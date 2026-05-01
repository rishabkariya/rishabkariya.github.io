import pandas as pd

from .config import (
    INITIAL_CAPITAL,
    MINUTES_PER_YEAR,
    ROLLING_SHARPE_WINDOW,
    SLIPPAGE_BPS,
    TRANSACTION_COST_BPS,
)
from .indicators import rolling_sharpe
from .metrics import compute_metrics
from .strategies import StrategySpec


def combo_id(strategy_id: str, param1_value, param2_value) -> str:
    p1 = str(param1_value).replace(".", "p")
    p2 = str(param2_value).replace(".", "p")
    return f"{strategy_id}__{p1}__{p2}"


def run_combo(df: pd.DataFrame, spec: StrategySpec, param1, param2):
    combo = combo_id(spec.strategy_id, param1, param2)
    params = {
        "param1_name": spec.param1_name,
        "param1_value": param1,
        "param2_name": spec.param2_name,
        "param2_value": param2,
    }
    signal = spec.signal_fn(df, param1, param2)
    close = df["close"].astype(float)
    position = signal.shift(1).fillna(0.0).clip(-1, 1)
    raw_return = position * close.pct_change().fillna(0.0)
    turnover = position.diff().abs().fillna(position.abs())
    net_return = raw_return - turnover * ((TRANSACTION_COST_BPS + SLIPPAGE_BPS) / 10_000)
    equity = INITIAL_CAPITAL * (1 + net_return).cumprod()
    pnl = equity.diff().fillna(0.0)
    drawdown = equity / equity.cummax() - 1
    roll_sharpe = rolling_sharpe(net_return, ROLLING_SHARPE_WINDOW, MINUTES_PER_YEAR)
    exposure = float((position != 0).mean())

    curve = pd.DataFrame(
        {
            "combo_id": combo,
            "strategy_id": spec.strategy_id,
            "strategy_name": spec.strategy_name,
            "timestamp_utc": df["timestamp_utc"].dt.strftime("%Y-%m-%d %H:%M:%S%z"),
            "timestamp_ist": df["timestamp_ist"].dt.strftime("%Y-%m-%d %H:%M:%S%z"),
            "date": df["timestamp_ist"].dt.strftime("%H:%M"),
            "close": close,
            "position": position,
            "bar_return": net_return,
            "equity": equity,
            "pnl": pnl,
            "drawdown": drawdown,
            "rolling_sharpe": roll_sharpe,
            **params,
        }
    )
    trades = build_trade_log(df, position, equity, spec, combo, params)
    metrics = compute_metrics(equity, net_return, trades, exposure)
    return curve, trades, metrics


def build_trade_log(df, position, equity, spec, combo, params):
    rows = []
    current_side = 0.0
    entry_index = None
    entry_price = 0.0
    entry_equity = INITIAL_CAPITAL
    close = df["close"].astype(float)

    for i, pos in enumerate(position):
        previous = current_side
        if previous == 0 and pos != 0:
            current_side = pos
            entry_index = i
            entry_price = close.iat[i]
            entry_equity = equity.iat[i]
        elif previous != 0 and pos != previous:
            rows.append(_trade_row(df, close, equity, spec, combo, params, rows, previous, entry_index, i, entry_price, entry_equity))
            if pos != 0:
                current_side = pos
                entry_index = i
                entry_price = close.iat[i]
                entry_equity = equity.iat[i]
            else:
                current_side = 0.0
                entry_index = None

    if current_side != 0 and entry_index is not None:
        i = len(df) - 1
        rows.append(_trade_row(df, close, equity, spec, combo, params, rows, current_side, entry_index, i, entry_price, entry_equity))

    return pd.DataFrame(rows)


def _trade_row(df, close, equity, spec, combo, params, rows, side, entry_index, exit_index, entry_price, entry_equity):
    exit_price = close.iat[exit_index]
    exit_equity = equity.iat[exit_index]
    return {
        "combo_id": combo,
        "strategy_id": spec.strategy_id,
        "strategy_name": spec.strategy_name,
        "trade_id": f"{combo}-{len(rows) + 1:04d}",
        "side": "long" if side > 0 else "short",
        "entry_timestamp_utc": df.at[entry_index, "timestamp_utc"].strftime("%Y-%m-%d %H:%M:%S%z"),
        "exit_timestamp_utc": df.at[exit_index, "timestamp_utc"].strftime("%Y-%m-%d %H:%M:%S%z"),
        "entry_timestamp_ist": df.at[entry_index, "timestamp_ist"].strftime("%Y-%m-%d %H:%M:%S%z"),
        "exit_timestamp_ist": df.at[exit_index, "timestamp_ist"].strftime("%Y-%m-%d %H:%M:%S%z"),
        "exit_date": df.at[exit_index, "timestamp_ist"].strftime("%H:%M"),
        "entry_price": entry_price,
        "exit_price": exit_price,
        "qty": 1.0,
        "gross_return": (exit_price / entry_price - 1) * side,
        "net_pnl": exit_equity - entry_equity,
        "equity_after": exit_equity,
        "r_multiple": (exit_equity - entry_equity) / max(abs(entry_equity) * 0.001, 1.0),
        **params,
    }

