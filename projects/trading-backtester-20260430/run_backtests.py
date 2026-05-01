from backtester.exporter import run_all


if __name__ == "__main__":
    market, sweep = run_all()
    print(f"Loaded {len(market):,} BTC 1-minute rows")
    print(f"Ran {len(sweep):,} parameter combinations")
    print("Strategies: 4")
    print("Stat-arb: skipped per user request")
    print("Wrote required and dashboard-ready CSV outputs")
