import pandas as pd
import numpy as np
from .indicators import rsi, ema

def signal_ema_crossover(df: pd.DataFrame, fast: int, slow: int) -> pd.Series:
    """
    EMA Crossover Strategy
    Long when Fast EMA > Slow EMA, Short otherwise.
    """
    f_ema = ema(df["close"], int(fast))
    s_ema = ema(df["close"], int(slow))
    return pd.Series(np.where(f_ema > s_ema, 1.0, -1.0), index=df.index)

def signal_bollinger_mean_reversion(df: pd.DataFrame, length: int, std_dev: float) -> pd.Series:
    """
    Bollinger Bands Mean Reversion
    Enter Long when price touches lower band, exit at mid.
    Enter Short when price touches upper band, exit at mid.
    """
    mid = df["close"].rolling(int(length)).mean()
    std = df["close"].rolling(int(length)).std()
    lower = mid - (float(std_dev) * std)
    upper = mid + (float(std_dev) * std)
    
    signal = pd.Series(0.0, index=df.index)
    state = 0
    
    # Iterate to maintain state (path dependent)
    for i in range(len(df)):
        price = df["close"].iat[i]
        if state == 0:
            if price <= lower.iat[i]: state = 1
            elif price >= upper.iat[i]: state = -1
        elif state == 1 and price >= mid.iat[i]:
            state = 0
        elif state == -1 and price <= mid.iat[i]:
            state = 0
        signal.iat[i] = state
    return signal

def signal_rsi_reversal(df: pd.DataFrame, length: int, threshold: int) -> pd.Series:
    """
    RSI Reversal Strategy
    Long when RSI < threshold (Oversold), Short when RSI > 100 - threshold (Overbought).
    """
    val = rsi(df["close"], int(length))
    oversold = int(threshold)
    overbought = 100 - oversold
    
    signal = pd.Series(0.0, index=df.index)
    state = 0
    for i in range(len(df)):
        if state == 0:
            if val.iat[i] < oversold: state = 1
            elif val.iat[i] > overbought: state = -1
        elif state == 1 and val.iat[i] >= 50:
            state = 0
        elif state == -1 and val.iat[i] <= 50:
            state = 0
        signal.iat[i] = state
    return signal

def signal_trend_momentum(df: pd.DataFrame, window: int, threshold_pct: float) -> pd.Series:
    """
    Simple Momentum Strategy
    Long if price is X% above its SMA, Short if X% below.
    """
    avg = df["close"].rolling(int(window)).mean()
    diff = (df["close"] / avg - 1) * 100
    
    signal = pd.Series(0.0, index=df.index)
    signal = np.where(diff > float(threshold_pct), 1.0, 
             np.where(diff < -float(threshold_pct), -1.0, 0.0))
    return pd.Series(signal, index=df.index)

STRATEGY_MAP = {
    "ema_crossover": {
        "name": "EMA Crossover",
        "func": signal_ema_crossover,
        "p1_name": "fast_ema",
        "p2_name": "slow_ema"
    },
    "bollinger_mr": {
        "name": "Bollinger Mean Reversion",
        "func": signal_bollinger_mean_reversion,
        "p1_name": "length",
        "p2_name": "std_dev"
    },
    "rsi_reversal": {
        "name": "RSI Reversal",
        "func": signal_rsi_reversal,
        "p1_name": "length",
        "p2_name": "threshold"
    },
    "momentum": {
        "name": "Trend Momentum",
        "func": signal_trend_momentum,
        "p1_name": "window",
        "p2_name": "threshold_pct"
    }
}
