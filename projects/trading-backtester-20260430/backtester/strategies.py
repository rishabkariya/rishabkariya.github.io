from dataclasses import dataclass
from typing import Callable

import numpy as np
import pandas as pd

from .indicators import rsi


SignalFn = Callable[[pd.DataFrame, float | int, float | int], pd.Series]


@dataclass(frozen=True)
class StrategySpec:
    strategy_id: str
    strategy_name: str
    symbol: str
    timeframe: str
    strategy_type: str
    param1_name: str
    param1_values: list[float | int]
    param2_name: str
    param2_values: list[float | int]
    signal_fn: SignalFn


def signal_bollinger(df: pd.DataFrame, length: int, std_dev: float) -> pd.Series:
    mid = df["close"].rolling(int(length)).mean()
    std = df["close"].rolling(int(length)).std(ddof=0)
    lower = mid - float(std_dev) * std
    upper = mid + float(std_dev) * std
    signal = pd.Series(0.0, index=df.index)
    current = 0
    for i in df.index:
        price = df.at[i, "close"]
        if current == 0:
            if price < lower.iat[i]:
                current = 1
            elif price > upper.iat[i]:
                current = -1
        elif current == 1 and price >= mid.iat[i]:
            current = 0
        elif current == -1 and price <= mid.iat[i]:
            current = 0
        signal.iat[i] = current
    return signal


def signal_rsi(df: pd.DataFrame, length: int, oversold: int) -> pd.Series:
    value = rsi(df["close"], int(length))
    overbought = 100 - int(oversold)
    signal = pd.Series(0.0, index=df.index)
    current = 0
    for i in df.index:
        if current == 0:
            if value.iat[i] < oversold:
                current = 1
            elif value.iat[i] > overbought:
                current = -1
        elif current == 1 and value.iat[i] >= 50:
            current = 0
        elif current == -1 and value.iat[i] <= 50:
            current = 0
        signal.iat[i] = current
    return signal


def signal_vwap(df: pd.DataFrame, deviation_pct: float, exit_threshold: float) -> pd.Series:
    deviation = ((df["close"] - df["session_vwap"]) / df["session_vwap"]) * 100
    signal = pd.Series(0.0, index=df.index)
    current = 0
    for i in df.index:
        value = deviation.iat[i]
        if current == 0:
            if value <= -float(deviation_pct):
                current = 1
            elif value >= float(deviation_pct):
                current = -1
        elif current == 1 and value >= -float(exit_threshold):
            current = 0
        elif current == -1 and value <= float(exit_threshold):
            current = 0
        signal.iat[i] = current
    return signal


def signal_ema(df: pd.DataFrame, fast: int, slow: int) -> pd.Series:
    if int(fast) >= int(slow):
        return pd.Series(0.0, index=df.index)
    fast_ema = df["close"].ewm(span=int(fast), adjust=False).mean()
    slow_ema = df["close"].ewm(span=int(slow), adjust=False).mean()
    return pd.Series(np.where(fast_ema > slow_ema, 1.0, -1.0), index=df.index)


def strategy_specs() -> list[StrategySpec]:
    return [
        StrategySpec(
            "bollinger_mean_reversion",
            "Bollinger Bands Mean Reversion",
            "BTCUSDT",
            "1m",
            "Mean Reversion",
            "bb_length",
            [10, 20, 30, 40, 50],
            "std_dev",
            [1.5, 2, 2.5, 3, 3.5],
            signal_bollinger,
        ),
        StrategySpec(
            "rsi_mean_reversion",
            "RSI Mean Reversion",
            "BTCUSDT",
            "1m",
            "Mean Reversion",
            "rsi_length",
            [7, 10, 14, 20, 30],
            "oversold_threshold",
            [20, 25, 30, 35, 40],
            signal_rsi,
        ),
        StrategySpec(
            "vwap_mean_reversion",
            "VWAP Mean Reversion",
            "BTCUSDT",
            "1m",
            "Mean Reversion",
            "vwap_deviation_pct",
            [0.5, 1, 1.5, 2, 2.5],
            "exit_threshold",
            [0, 0.2, 0.4, 0.6, 0.8],
            signal_vwap,
        ),
        StrategySpec(
            "ema_crossover_trend",
            "EMA Crossover Trend Following",
            "BTCUSDT",
            "1m",
            "Trend Following",
            "fast_ema",
            [5, 10, 15, 20, 25],
            "slow_ema",
            [50, 75, 100, 125, 150],
            signal_ema,
        ),
    ]

