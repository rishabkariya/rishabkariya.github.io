import itertools

import pandas as pd

from .config import INITIAL_CAPITAL, RESULTS_DIR, SLIPPAGE_BPS, SOURCE_CSV, TRANSACTION_COST_BPS
from .data_loader import load_market_data, normalized_market_export
from .engine import run_combo
from .strategies import strategy_specs


def run_all():
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    df = load_market_data(SOURCE_CSV)
    normalized_market_export(df).to_csv(RESULTS_DIR / "normalized_btc_1m.csv", index=False)

    curves = []
    trades = []
    sweep_rows = []

    for spec in strategy_specs():
        for param1, param2 in itertools.product(spec.param1_values, spec.param2_values):
            curve, trade_log, metrics = run_combo(df, spec, param1, param2)
            curves.append(curve)
            if not trade_log.empty:
                trades.append(trade_log)
            sweep_rows.append(
                {
                    "combo_id": curve.at[0, "combo_id"],
                    "strategy_id": spec.strategy_id,
                    "strategy_name": spec.strategy_name,
                    "symbol": spec.symbol,
                    "timeframe": spec.timeframe,
                    "strategy_type": spec.strategy_type,
                    "param1_name": spec.param1_name,
                    "param1_value": param1,
                    "param2_name": spec.param2_name,
                    "param2_value": param2,
                    **metrics,
                }
            )

    all_curves = pd.concat(curves, ignore_index=True)
    all_trades = pd.concat(trades, ignore_index=True) if trades else pd.DataFrame()
    sweep = pd.DataFrame(sweep_rows)
    best = select_best_per_strategy(sweep)
    sweep = sweep.merge(best[["strategy_id", "combo_id"]].assign(selected_for_dashboard=True), on=["strategy_id", "combo_id"], how="left")
    sweep["selected_for_dashboard"] = sweep["selected_for_dashboard"].fillna(False)

    export_required(all_curves, all_trades, sweep)
    export_dashboard_files(all_curves, all_trades, sweep, best)
    export_metadata()
    return df, sweep


def select_best_per_strategy(sweep):
    active = sweep[sweep["total_trades"] > 0].copy()
    source = active if not active.empty else sweep
    return (
        source.sort_values(["strategy_id", "sharpe_ratio", "total_return_pct"], ascending=[True, False, False])
        .groupby("strategy_id", as_index=False)
        .head(1)
        .reset_index(drop=True)
    )


def export_required(curves, trades, sweep):
    trades.to_csv(RESULTS_DIR / "trade_logs.csv", index=False)
    curves.to_csv(RESULTS_DIR / "equity_curve.csv", index=False)
    curves[["combo_id", "strategy_id", "strategy_name", "timestamp_utc", "timestamp_ist", "date", "drawdown", "param1_name", "param1_value", "param2_name", "param2_value"]].to_csv(
        RESULTS_DIR / "drawdown_curve.csv", index=False
    )
    curves[["combo_id", "strategy_id", "strategy_name", "timestamp_utc", "timestamp_ist", "date", "rolling_sharpe", "param1_name", "param1_value", "param2_name", "param2_value"]].to_csv(
        RESULTS_DIR / "rolling_sharpe.csv", index=False
    )
    sweep.to_csv(RESULTS_DIR / "parameter_sweep_results.csv", index=False)
    select_best_per_strategy(sweep).to_csv(RESULTS_DIR / "strategy_metrics_summary.csv", index=False)
    heatmap_long(sweep).to_csv(RESULTS_DIR / "parameter_heatmap_long.csv", index=False)


def export_dashboard_files(curves, trades, sweep, best):
    dashboard_metrics = best.rename(columns={"strategy_name": "name"}).copy()
    dashboard_metrics["selected_combo_id"] = dashboard_metrics["combo_id"]
    dashboard_metrics[
        [
            "strategy_id",
            "selected_combo_id",
            "name",
            "symbol",
            "timeframe",
            "strategy_type",
            "param1_name",
            "param1_value",
            "param2_name",
            "param2_value",
            "total_return",
            "cagr",
            "sharpe",
            "sortino",
            "max_drawdown",
            "win_rate",
            "profit_factor",
            "trades",
            "avg_trade",
            "volatility",
            "exposure",
        ]
    ].to_csv(RESULTS_DIR / "dashboard_strategy_metrics.csv", index=False)

    sweep.to_csv(RESULTS_DIR / "dashboard_parameter_sweep.csv", index=False)
    curves.to_csv(RESULTS_DIR / "dashboard_strategy_equity.csv", index=False)
    trades.to_csv(RESULTS_DIR / "dashboard_strategy_trades.csv", index=False)


def heatmap_long(sweep):
    rows = []
    for _, row in sweep.iterrows():
        for metric in ["sharpe_ratio", "total_return_pct", "max_drawdown_pct", "profit_factor"]:
            rows.append(
                {
                    "combo_id": row["combo_id"],
                    "strategy_id": row["strategy_id"],
                    "strategy_name": row["strategy_name"],
                    "param1_name": row["param1_name"],
                    "param1_value": row["param1_value"],
                    "param2_name": row["param2_name"],
                    "param2_value": row["param2_value"],
                    "metric_name": metric,
                    "metric_value": row[metric],
                }
            )
    return pd.DataFrame(rows)


def export_metadata():
    pd.DataFrame(
        [
            {
                "source_csv": str(SOURCE_CSV),
                "initial_capital": INITIAL_CAPITAL,
                "transaction_cost_bps": TRANSACTION_COST_BPS,
                "slippage_bps": SLIPPAGE_BPS,
                "bar_size": "1 minute",
                "strategies": "Bollinger, RSI, VWAP, EMA crossover",
                "skipped": "Statistical arbitrage skipped per user simplification request.",
            }
        ]
    ).to_csv(RESULTS_DIR / "strategy_run_metadata.csv", index=False)
