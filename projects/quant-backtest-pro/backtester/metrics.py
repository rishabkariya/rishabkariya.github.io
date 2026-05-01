import math
import numpy as np
import pandas as pd

def compute_metrics(equity: pd.Series, returns: pd.Series, trades: pd.DataFrame, bars_per_year: int) -> dict:
    """
    Computes performance metrics for a trading strategy.
    
    Args:
        equity: Series of cumulative equity values
        returns: Series of bar-by-bar net returns
        trades: DataFrame containing the trade log
        bars_per_year: Number of bars in a year (e.g., 365 for 1d, 525600 for 1m)
    """
    initial_capital = equity.iat[0] if len(equity) > 0 else 1.0
    total_return = equity.iat[-1] / initial_capital - 1
    
    # Calculate CAGR
    years = len(returns) / bars_per_year if bars_per_year > 0 else 1
    if years > 0 and equity.iat[-1] > 0:
        cagr = (equity.iat[-1] / initial_capital) ** (1 / years) - 1
    else:
        cagr = 0.0

    # Risk Adjusted Metrics
    std = returns.std(ddof=0)
    # Annualized Sharpe = (Mean / Std) * sqrt(BarsPerYear)
    sharpe = (returns.mean() / std * math.sqrt(bars_per_year)) if std > 0 else 0.0
    
    downside_std = returns[returns < 0].std(ddof=0)
    sortino = (returns.mean() / downside_std * math.sqrt(bars_per_year)) if downside_std > 0 else 0.0
    
    drawdown = equity / equity.cummax() - 1
    max_dd = drawdown.min()

    # Trade Statistics
    if trades.empty:
        win_rate = profit_factor = avg_trade = 0.0
        total_trades = 0
    else:
        pnl = trades["net_pnl"].astype(float)
        wins = pnl[pnl > 0]
        losses = pnl[pnl < 0]
        win_rate = len(wins) / len(pnl)
        
        abs_loss_sum = abs(losses.sum())
        if abs_loss_sum > 0:
            profit_factor = wins.sum() / abs_loss_sum
        else:
            # If there are no losses, cap Profit Factor at a reasonable high value
            profit_factor = 99.0 if wins.sum() > 0 else 0.0
            
        avg_trade = pnl.mean()
        total_trades = len(pnl)

    return {
        "total_return": total_return,
        "total_return_pct": total_return * 100,
        "cagr": cagr,
        "cagr_pct": cagr * 100,
        "sharpe_ratio": sharpe,
        "sortino_ratio": sortino,
        "max_drawdown": max_dd,
        "max_drawdown_pct": max_dd * 100,
        "profit_factor": profit_factor,
        "win_rate": win_rate,
        "win_rate_pct": win_rate * 100,
        "total_trades": total_trades,
        "avg_trade_pnl": avg_trade,
        "volatility_annualized": std * math.sqrt(bars_per_year),
        "ending_equity": equity.iat[-1],
    }
