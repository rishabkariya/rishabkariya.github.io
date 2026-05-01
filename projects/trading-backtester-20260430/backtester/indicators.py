import numpy as np
import pandas as pd


def rsi(close: pd.Series, length: int) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1 / int(length), adjust=False, min_periods=int(length)).mean()
    avg_loss = loss.ewm(alpha=1 / int(length), adjust=False, min_periods=int(length)).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    return (100 - (100 / (1 + rs))).fillna(50)


def rolling_sharpe(returns: pd.Series, window: int, bars_per_year: int) -> pd.Series:
    mean = returns.rolling(window).mean()
    std = returns.rolling(window).std(ddof=0)
    values = mean / std.replace(0, np.nan) * np.sqrt(bars_per_year)
    return values.replace([np.inf, -np.inf], np.nan).fillna(0.0)

