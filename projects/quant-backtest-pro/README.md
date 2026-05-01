# 📈 QuantBacktest Pro

A high-performance, lightweight Python backtester designed for rapid strategy prototyping. Built for traders who want to move from idea to equity curve in seconds.

![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

- **Vectorized Engine**: Fast backtesting using NumPy and Pandas.
- **Multiple Strategies**: Comes with 4 built-in strategies (EMA Crossover, Bollinger Bands, RSI Reversal, Momentum).
- **Timeframe Agnostic**: Automatically detects timeframe (1m, 1h, 1d) and annualizes metrics correctly.
- **Detailed Metrics**: Sharpe Ratio, Sortino, CAGR, Max Drawdown, and Profit Factor.
- **Clean Trade Logs**: Precise entry/exit tracking with PnL calculation.

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USER/quant-backtest-pro.git
   cd quant-backtest-pro
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 📊 Usage

Run a backtest on your Binance CSV data:

```bash
python run.py --data data/BTCUSDT-1d.csv --strategy ema_crossover --p1 20 --p2 50
```

### Supported Strategies:
- `ema_crossover`: Classic trend following.
- `bollinger_mr`: Mean reversion using volatility bands.
- `rsi_reversal`: Overbought/Oversold logic.
- `momentum`: Price trend momentum.

## 📂 Project Structure

- `backtester/`: Core engine, metrics, and indicators.
- `data/`: Place your market data CSVs here.
- `results/`: Backtest results and equity curves are saved here.
- `run.py`: Command-line interface for the backtester.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
