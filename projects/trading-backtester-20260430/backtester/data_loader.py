import numpy as np
import pandas as pd


def load_market_data(path):
    df = pd.read_csv(path)
    required = {"open_time", "open", "high", "low", "close"}
    missing = required.difference(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")

    numeric_cols = [
        "open",
        "high",
        "low",
        "close",
        "volume",
        "quote_volume",
        "count",
        "taker_buy_volume",
        "taker_buy_quote_volume",
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df["timestamp_utc"] = pd.to_datetime(df["open_time"], unit="ms", utc=True)
    df["timestamp_ist"] = df["timestamp_utc"].dt.tz_convert("Asia/Kolkata")
    df = df.sort_values("timestamp_utc").reset_index(drop=True)

    if "quote_volume" in df.columns and "volume" in df.columns:
        df["minute_vwap"] = np.where(df["volume"] > 0, df["quote_volume"] / df["volume"], df["close"])
    else:
        df["minute_vwap"] = (df["high"] + df["low"] + df["close"]) / 3

    typical_price = (df["high"] + df["low"] + df["close"]) / 3
    volume = df["volume"] if "volume" in df.columns else pd.Series(1.0, index=df.index)
    df["session_vwap"] = (typical_price * volume).cumsum() / volume.replace(0, np.nan).cumsum()
    df["return"] = df["close"].pct_change().fillna(0.0)
    return df


def normalized_market_export(df):
    out = df.copy()
    out["timestamp_utc"] = out["timestamp_utc"].dt.strftime("%Y-%m-%d %H:%M:%S%z")
    out["timestamp_ist"] = out["timestamp_ist"].dt.strftime("%Y-%m-%d %H:%M:%S%z")
    return out

