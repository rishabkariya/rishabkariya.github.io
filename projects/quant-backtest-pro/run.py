import argparse
import os
import pandas as pd
from backtester.data_loader import load_csv, get_bars_per_year
from backtester.engine import BacktestEngine
from backtester.strategies import STRATEGY_MAP

def main():
    parser = argparse.ArgumentParser(description="Quant Backtest Pro - Lite Trading Backtester")
    parser.add_argument("--data", type=str, required=True, help="Path to market data CSV")
    parser.add_argument("--strategy", type=str, default="ema_crossover", choices=STRATEGY_MAP.keys(), help="Strategy to run")
    parser.add_argument("--p1", type=float, default=20, help="First parameter value")
    parser.add_argument("--p2", type=float, default=50, help="Second parameter value")
    parser.add_argument("--output", type=str, default="results/backtest_result.csv", help="Output path")

    args = parser.parse_args()

    # 1. Load Data
    print(f"[*] Loading data from {args.data}...")
    df = load_csv(args.data)
    bars_per_year = get_bars_per_year(df)
    print(f"[+] Detected {len(df)} bars. Annualization factor: {bars_per_year}")

    # 2. Setup Engine
    engine = BacktestEngine(initial_capital=100000)
    strat = STRATEGY_MAP[args.strategy]
    
    # 3. Run Backtest
    print(f"[*] Running {strat['name']} (p1={args.p1}, p2={args.p2})...")
    result = engine.run(df, strat["func"], args.p1, args.p2, bars_per_year=bars_per_year)
    
    # 4. Display Results
    metrics = result["metrics"]
    print("\n" + "="*30)
    print(f" RESULTS: {strat['name']}")
    print("="*30)
    print(f"Total Return:   {metrics['total_return_pct']:.2f}%")
    print(f"CAGR:           {metrics['cagr_pct']:.2f}%")
    print(f"Sharpe Ratio:   {metrics['sharpe_ratio']:.2f}")
    print(f"Max Drawdown:   {metrics['max_drawdown_pct']:.2f}%")
    print(f"Win Rate:       {metrics['win_rate_pct']:.2f}%")
    print(f"Profit Factor:  {metrics['profit_factor']:.2f}")
    print(f"Total Trades:   {metrics['total_trades']}")
    print("="*30)

    # 5. Save Results
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    result["equity"].to_csv(args.output)
    print(f"\n[+] Equity curve saved to {args.output}")

if __name__ == "__main__":
    main()
