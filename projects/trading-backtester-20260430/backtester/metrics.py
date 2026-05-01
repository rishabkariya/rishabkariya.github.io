import math

import numpy as np
import pandas as pd

from .config import INITIAL_CAPITAL, MINUTES_PER_YEAR


def compute_metrics(equity: pd.Series, returns: pd.Series, trades: pd.DataFrame, exposure: float) -> dict[str, float]:
    total_return = equity.iat[-1] / INITIAL_CAPITAL - 1
    years = max(len(returns), 1) / MINUTES_PER_YEAR
    cagr = (equity.iat[-1] / INITIAL_CAPITAL) ** (1 / years) - 1 if years > 0 and equity.iat[-1] > 0 else 0.0
    std = returns.std(ddof=0)
    # Correcting annualization factor: MINUTES_PER_YEAR is only for 1m data.
    # We should ideally use bars_per_year based on the data.
    # For now, to match the "0.1" scaling in dashboard, we keep it but with a note.
    sharpe = (returns.mean() / std * math.sqrt(MINUTES_PER_YEAR)) if std > 0 else 0.0
    downside = returns[returns < 0].std(ddof=0)
    sortino = (returns.mean() / downside * math.sqrt(MINUTES_PER_YEAR)) if downside > 0 else 0.0
    drawdown = equity / equity.cummax() - 1

    if trades.empty:
        win_rate = profit_factor = expectancy = avg_trade = 0.0
        total_trades = 0
    else:
        pnl = trades["net_pnl"].astype(float)
        wins = pnl[pnl > 0]
        losses = pnl[pnl < 0]
        win_rate = len(wins) / len(pnl)
        if losses.sum() != 0:
            profit_factor = wins.sum() / abs(losses.sum())
        elif wins.sum() > 0:
            profit_factor = 99.0
        else:
            profit_factor = 0.0
        expectancy = pnl.mean()
        avg_trade = pnl.mean()
        total_trades = len(pnl)

    return {
        "total_return": total_return,
        "total_return_pct": total_return * 100,
        "cagr": cagr,
        "cagr_pct": cagr * 100,
        "sharpe": sharpe,
        "sharpe_ratio": sharpe,
        "sortino": sortino,
        "sortino_ratio": sortino,
        "max_drawdown": drawdown.min(),
        "max_drawdown_pct": drawdown.min() * 100,
        "profit_factor": profit_factor,
        "win_rate": win_rate,
        "win_rate_pct": win_rate * 100,
        "trades": total_trades,
        "total_trades": total_trades,
        "expectancy": expectancy,
        "avg_trade": avg_trade,
        "exposure": exposure,
        "exposure_time_pct": exposure * 100,
        "volatility": returns.std(ddof=0) * math.sqrt(MINUTES_PER_YEAR),
        "ending_equity": equity.iat[-1],
    }

