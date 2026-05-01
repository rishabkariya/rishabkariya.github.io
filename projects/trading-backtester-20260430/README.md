# Trading Backtester Output Project

Standalone project generated from `trading_backtester_project_design_updated.pdf`.

## Source Data

Input file:

`C:\Users\risha\Downloads\BTCUSDT-1m-2026-04-28\BTCUSDT-1m-2026-04-28.csv`

The loader converts Binance millisecond `open_time` into:

- `timestamp_utc`
- `timestamp_ist`

## Strategies

The runner executes four dashboard-ready strategies with 25 parameter combinations each:

1. Bollinger Bands Mean Reversion
2. RSI Mean Reversion
3. VWAP Mean Reversion
4. EMA Crossover Trend Following

Statistical arbitrage is skipped for this version because the user requested simplicity and the Downloads folder only contained one BTC asset file.

## Outputs

Run:

```powershell
python .\run_backtests.py
```

Generated CSV files go to:

`outputs\trading-backtester-20260430\results`

Required exports:

- `trade_logs.csv`
- `equity_curve.csv`
- `drawdown_curve.csv`
- `rolling_sharpe.csv`
- `parameter_sweep_results.csv`
- `strategy_metrics_summary.csv`

Additional exports:

- `normalized_btc_1m.csv`
- `strategy_run_metadata.csv`
- `parameter_heatmap_long.csv`
- `dashboard_strategy_metrics.csv`
- `dashboard_parameter_sweep.csv`
- `dashboard_strategy_equity.csv`
- `dashboard_strategy_trades.csv`

## Dashboard Contract

Copy these files into the dashboard's `public/data` folder:

- `dashboard_strategy_metrics.csv` -> `strategy_metrics.csv`
- `dashboard_parameter_sweep.csv` -> `parameter_sweep.csv`
- `dashboard_strategy_equity.csv` -> `strategy_equity.csv`
- `dashboard_strategy_trades.csv` -> `strategy_trades.csv`

The dashboard can then show:

- leaderboard: best combo per strategy
- heatmap: all 25 combos for selected strategy
- drilldown: clicking a heatmap cell loads that exact combo's equity, PnL, drawdown, rolling Sharpe, position, and trade log
