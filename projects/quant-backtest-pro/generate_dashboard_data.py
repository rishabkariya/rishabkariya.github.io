import pandas as pd
import numpy as np
import os
from backtester.data_loader import load_csv, get_bars_per_year
from backtester.engine import BacktestEngine
from backtester.strategies import STRATEGY_MAP

# Configuration
DATA_PATH = "data/BTCUSDT-1m-2026-04-30.csv"
OUTPUT_DIR = "../../projects/backtest-dashboard/public/data"
INITIAL_CAPITAL = 1000000.0

def generate():
    print(f"[*] Loading data: {DATA_PATH}")
    df = load_csv(DATA_PATH)
    bars_per_year = get_bars_per_year(df)
    engine = BacktestEngine(initial_capital=INITIAL_CAPITAL)
    
    all_metrics = []
    all_sweeps = []
    all_equities = []
    all_trades = []
    
    # Define Parameter Grids
    grids = {
        "ema_crossover": {
            "p1": [10, 20, 30, 40, 50],
            "p2": [100, 150, 200, 250, 300]
        },
        "bollinger_mr": {
            "p1": [10, 20, 30, 40, 50],
            "p2": [1.5, 2.0, 2.5, 3.0, 3.5]
        },
        "rsi_reversal": {
            "p1": [7, 14, 21, 28, 35],
            "p2": [20, 25, 30, 35, 40]
        },
        "momentum": {
            "p1": [10, 20, 30, 40, 50],
            "p2": [0.1, 0.2, 0.3, 0.4, 0.5]
        }
    }
    
    for strat_id, strat_info in STRATEGY_MAP.items():
        print(f"[*] Processing Strategy: {strat_id}")
        grid = grids.get(strat_id)
        if not grid: continue
        
        best_combo = None
        best_return = -999999
        
        for p1 in grid["p1"]:
            for p2 in grid["p2"]:
                combo_id = f"{strat_id}__{str(p1).replace('.', 'p')}__{str(p2).replace('.', 'p')}"
                result = engine.run(df, strat_info["func"], p1, p2, bars_per_year=bars_per_year)
                
                m = result["metrics"]
                
                # Prepare Sweep Row
                sweep_row = {
                    "strategy_id": strat_id,
                    "combo_id": combo_id,
                    "param1_value": p1,
                    "param2_value": p2,
                    "total_return_pct": m["total_return_pct"],
                    "sharpe_ratio": m["sharpe_ratio"],
                    "sortino_ratio": m["sortino_ratio"],
                    "max_drawdown_pct": m["max_drawdown_pct"],
                    "win_rate_pct": m["win_rate_pct"],
                    "profit_factor": m["profit_factor"],
                    "total_trades": m["total_trades"]
                }
                all_sweeps.append(sweep_row)
                
                # Keep track of best for metrics.csv
                if m["total_return"] > best_return:
                    best_return = m["total_return"]
                    best_combo = {
                        "strategy_id": strat_id,
                        "selected_combo_id": combo_id,
                        "name": strat_info["name"],
                        "symbol": "BTCUSDT",
                        "timeframe": "1m",
                        "strategy_type": "Trend" if "ema" in strat_id or "momentum" in strat_id else "Mean Reversion",
                        "param1_name": strat_info["p1_name"],
                        "param1_value": p1,
                        "param2_name": strat_info["p2_name"],
                        "param2_value": p2,
                        "total_return": m["total_return"],
                        "cagr": m["cagr"],
                        "sharpe": m["sharpe_ratio"],
                        "sortino": m["sortino_ratio"],
                        "max_drawdown": m["max_drawdown"],
                        "win_rate": m["win_rate"],
                        "profit_factor": m["profit_factor"],
                        "trades": m["total_trades"],
                        "avg_trade": m["avg_trade_pnl"],
                        "volatility": m["volatility_annualized"],
                        "exposure": 0.5 # Placeholder
                    }
                
                # Save equity curve for the dashboard
                # The dashboard expects: combo_id, strategy_id, strategy_name, date, close, position, bar_return, equity, pnl, drawdown, rolling_sharpe
                eq_df = pd.DataFrame({
                    "combo_id": combo_id,
                    "strategy_id": strat_id,
                    "strategy_name": strat_info["name"],
                    "date": df["timestamp"].dt.strftime("%Y-%m-%d %H:%M"),
                    "close": df["close"],
                    "position": result["position"],
                    "bar_return": result["returns"],
                    "equity": result["equity"],
                    "pnl": result["equity"].diff().fillna(0),
                    "drawdown": (result["equity"] / result["equity"].cummax() - 1),
                    "rolling_sharpe": 0 # Placeholder for speed
                })
                all_equities.append(eq_df)
                
                # Save trades
                t_df = result["trades"]
                if not t_df.empty:
                    t_df["combo_id"] = combo_id
                    all_trades.append(t_df)

        if best_combo:
            all_metrics.append(best_combo)

    # Save to CSVs
    print(f"[*] Saving results to {OUTPUT_DIR}")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    pd.DataFrame(all_metrics).to_csv(f"{OUTPUT_DIR}/strategy_metrics.csv", index=False)
    pd.DataFrame(all_sweeps).to_csv(f"{OUTPUT_DIR}/parameter_sweep.csv", index=False)
    pd.concat(all_equities).to_csv(f"{OUTPUT_DIR}/strategy_equity.csv", index=False)
    
    if all_trades:
        pd.concat(all_trades).to_csv(f"{OUTPUT_DIR}/strategy_trades.csv", index=False)
    
    print("[+] Dashboard data generated successfully!")

if __name__ == "__main__":
    generate()
