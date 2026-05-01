import pandas as pd

def load_csv(path, format="binance"):
    """
    Loads market data from a CSV file.
    Default format is Binance (timestamp, open, high, low, close, volume).
    """
    df = pd.read_csv(path)
    
    if format == "binance":
        # Rename columns if they are numeric/index based or standard binance
        # Expected: open_time, open, high, low, close, volume, close_time, ...
        if "open_time" in df.columns:
            df["timestamp"] = pd.to_datetime(df["open_time"], unit="ms")
        else:
            # Try first column as timestamp
            df["timestamp"] = pd.to_datetime(df.iloc[:, 0])
            
        # Ensure standard names
        mapping = {
            "open": "open", "high": "high", "low": "low", "close": "close", "volume": "volume"
        }
        for col in df.columns:
            for k, v in mapping.items():
                if k in col.lower():
                    df[v] = df[col]
                    
    else:
        # Generic CSV handling
        df["timestamp"] = pd.to_datetime(df["Date"] if "Date" in df.columns else df.iloc[:, 0])
        df["close"] = df["Close"] if "Close" in df.columns else df["close"]
        
    return df[["timestamp", "open", "high", "low", "close", "volume"]].sort_values("timestamp")

def get_bars_per_year(df):
    """Infuses timeframe from data frequency"""
    delta = df["timestamp"].diff().median()
    minutes = delta.total_seconds() / 60
    if minutes <= 1.5: return 525600 # 1m
    if minutes <= 65: return 8760   # 1h
    if minutes <= 1445: return 365  # 1d
    return 365
