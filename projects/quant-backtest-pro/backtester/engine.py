import pandas as pd
import numpy as np
from .metrics import compute_metrics
from .indicators import rolling_sharpe

class BacktestEngine:
    def __init__(self, initial_capital=100000.0, commission_bps=2.0, slippage_bps=1.0):
        self.initial_capital = initial_capital
        self.cost_pct = (commission_bps + slippage_bps) / 10000
        
    def run(self, df, signal_fn, p1, p2, bars_per_year=365):
        """
        Runs a backtest for a single parameter combination.
        """
        # Vectorized backtest for speed
        signal = signal_fn(df, p1, p2)
        # Shift signal by 1 bar to avoid lookahead bias (execute at next open/close)
        position = signal.shift(1).fillna(0.0)
        
        # Returns
        price_return = df["close"].pct_change().fillna(0.0)
        raw_return = position * price_return
        
        # Transaction Costs
        turnover = position.diff().abs().fillna(position.abs())
        costs = turnover * self.cost_pct
        net_return = raw_return - costs
        
        # Equity Curve
        equity = self.initial_capital * (1 + net_return).cumprod()
        
        # Trade Log
        trades = self._build_trade_log(df, position, equity)
        
        # Metrics
        metrics = compute_metrics(equity, net_return, trades, bars_per_year)
        
        return {
            "equity": equity,
            "returns": net_return,
            "trades": trades,
            "metrics": metrics,
            "position": position
        }

    def _build_trade_log(self, df, position, equity):
        trades = []
        current_pos = 0.0
        entry_idx = None
        
        for i in range(len(position)):
            pos = position.iat[i]
            if pos != current_pos:
                # Close previous position
                if current_pos != 0:
                    trades.append({
                        "entry_time": df["timestamp"].iat[entry_idx],
                        "exit_time": df["timestamp"].iat[i],
                        "entry_price": df["close"].iat[entry_idx],
                        "exit_price": df["close"].iat[i],
                        "side": "Long" if current_pos > 0 else "Short",
                        "net_pnl": equity.iat[i] - equity.iat[entry_idx],
                        "return_pct": (equity.iat[i] / equity.iat[entry_idx] - 1) * 100
                    })
                
                # Open new position
                if pos != 0:
                    entry_idx = i
                current_pos = pos
        
        return pd.DataFrame(trades)
