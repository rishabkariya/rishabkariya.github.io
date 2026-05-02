import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GITHUB_URL = "https://github.com/rishabkariya/limit-order-backtester";

const numericFields = new Set([
  "total_return",
  "cagr",
  "sharpe",
  "sortino",
  "max_drawdown",
  "win_rate",
  "profit_factor",
  "trades",
  "avg_trade",
  "volatility",
  "exposure",
  "equity",
  "pnl",
  "drawdown",
  "rolling_sharpe",
  "qty",
  "entry_price",
  "exit_price",
  "net_pnl",
  "r_multiple",
]);

function parseValue(key, value) {
  if (numericFields.has(key)) return Number(value);
  return value;
}

async function loadCsv(path) {
  const response = await fetch(path);
  const text = await response.text();
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transform: (value, key) => parseValue(key, value),
  });
  return parsed.data;
}

function fmtPct(value, digits = 1) {
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

function fmtMoney(value) {
  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  });
}

function fmtNum(value, digits = 2) {
  return Number(value).toFixed(digits);
}

function Icon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };
  const paths = {
    github: <><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.7a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.3-3.7 1.4a12.8 12.8 0 0 0-6.7 0C6.7.3 5.6.6 5.6.6a4.8 4.8 0 0 0-.1 3.6 5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.1 6.4 6.1 6.7a3 3 0 0 0-.8 1.8" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 20h14" /></>,
  };
  return <svg className="icon" {...common}>{paths[name]}</svg>;
}

function MetricCard({ label, value, tone, sub }) {
  return (
    <article className={`metric-card ${tone || ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {sub ? <small>{sub}</small> : null}
    </article>
  );
}

function StrategyTable({ strategies, selectedId, onSelect, sortKey, sortDirection, onSort }) {
  const headers = [
    ["name", "Strategy"],
    ["total_return", "Return"],
    ["sharpe", "Sharpe"],
    ["max_drawdown", "Max DD"],
    ["win_rate", "Win"],
    ["profit_factor", "PF"],
    ["trades", "Trades"],
  ];

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map(([key, label]) => (
              <th key={key}>
                <button type="button" onClick={() => onSort(key)} className={sortKey === key ? "active-sort" : ""}>
                  <span>{label}</span>
                  <b>{sortKey === key ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}</b>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {strategies.map((strategy) => (
            <tr
              key={strategy.strategy_id}
              className={selectedId === strategy.strategy_id ? "selected" : ""}
              onClick={() => onSelect(strategy.strategy_id)}
            >
              <td>
                <strong>{strategy.name}</strong>
                <span>{strategy.symbol} · {strategy.timeframe}</span>
              </td>
              <td className={strategy.total_return >= 0 ? "positive" : "negative"}>{fmtPct(strategy.total_return)}</td>
              <td>{fmtNum(strategy.sharpe)}</td>
              <td className="negative">{fmtPct(strategy.max_drawdown)}</td>
              <td>{fmtPct(strategy.win_rate)}</td>
              <td>{fmtNum(strategy.profit_factor)}</td>
              <td>{strategy.trades}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Details({ strategy, curve, trades }) {
  const winningTrades = trades.filter((trade) => trade.net_pnl > 0).length;
  const losingTrades = trades.length - winningTrades;
  const latest = curve[curve.length - 1];

  return (
    <section className="details-grid">
      <article className="chart-panel wide">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">Selected strategy</p>
            <h2>{strategy.name}</h2>
          </div>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="github-link">
            <Icon name="github" /> GitHub
          </a>
        </div>
        <ResponsiveContainer width="100%" height={330}>
          <ComposedChart data={curve}>
            <CartesianGrid stroke="#dfe6ea" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={26} />
            <YAxis yAxisId="equity" tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fontSize: 12 }} />
            <YAxis yAxisId="pnl" orientation="right" tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value, name) => [fmtMoney(value), name]} />
            <Legend />
            <Bar yAxisId="pnl" dataKey="pnl" name="Daily PnL" fill="#94a3b8" barSize={10} />
            <Line yAxisId="equity" type="monotone" dataKey="equity" name="Equity" stroke="#0f766e" strokeWidth={2.4} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </article>

      <aside className="side-stack">
        <MetricCard label="Equity" value={fmtMoney(latest?.equity || 0)} sub="latest mark" />
        <MetricCard label="Total Return" value={fmtPct(strategy.total_return)} tone={strategy.total_return >= 0 ? "good" : "bad"} />
        <MetricCard label="Sharpe" value={fmtNum(strategy.sharpe)} sub={`Sortino ${fmtNum(strategy.sortino)}`} />
        <MetricCard label="Max Drawdown" value={fmtPct(strategy.max_drawdown)} tone="bad" />
      </aside>

      <article className="chart-panel">
        <div className="panel-head compact">
          <h3>Drawdown</h3>
          <span>{fmtPct(strategy.max_drawdown)}</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={curve}>
            <CartesianGrid stroke="#dfe6ea" vertical={false} />
            <XAxis dataKey="date" hide />
            <YAxis tickFormatter={(value) => fmtPct(value, 0)} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [fmtPct(value), "Drawdown"]} />
            <Area type="monotone" dataKey="drawdown" stroke="#be123c" fill="#ffe4e6" />
          </AreaChart>
        </ResponsiveContainer>
      </article>

      <article className="chart-panel">
        <div className="panel-head compact">
          <h3>Rolling Sharpe</h3>
          <span>{fmtNum(latest?.rolling_sharpe || 0)}</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={curve}>
            <CartesianGrid stroke="#dfe6ea" vertical={false} />
            <XAxis dataKey="date" hide />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [fmtNum(value), "Rolling Sharpe"]} />
            <Line type="monotone" dataKey="rolling_sharpe" stroke="#1d4ed8" strokeWidth={2.2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </article>

      <article className="chart-panel">
        <div className="panel-head compact">
          <h3>Trade PnL</h3>
          <span>{winningTrades}W / {losingTrades}L</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={trades}>
            <CartesianGrid stroke="#dfe6ea" vertical={false} />
            <XAxis dataKey="exit_date" hide />
            <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [fmtMoney(value), "Trade PnL"]} />
            <Bar dataKey="net_pnl" radius={[4, 4, 0, 0]}>
              {trades.map((trade) => (
                <Cell key={trade.trade_id} fill={trade.net_pnl >= 0 ? "#0f766e" : "#be123c"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </article>

      <article className="chart-panel">
        <div className="panel-head compact">
          <h3>Risk / Return Map</h3>
          <span>{strategy.timeframe}</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ScatterChart>
            <CartesianGrid stroke="#dfe6ea" />
            <XAxis dataKey="r_multiple" name="R multiple" tick={{ fontSize: 12 }} />
            <YAxis dataKey="net_pnl" name="PnL" tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value, name) => [name === "PnL" ? fmtMoney(value) : fmtNum(value), name]} />
            <Scatter data={trades} fill="#7c3aed" isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </article>

      <article className="chart-panel wide">
        <div className="panel-head compact">
          <h3>Recent Fills / Trades</h3>
          <span>{trades.length} rows from CSV</span>
        </div>
        <div className="trade-log">
          {trades.slice(-8).reverse().map((trade) => (
            <div key={trade.trade_id} className="trade-row">
              <span>{trade.exit_date}</span>
              <strong>{trade.side}</strong>
              <span>{trade.qty} @ {fmtNum(trade.exit_price)}</span>
              <b className={trade.net_pnl >= 0 ? "positive" : "negative"}>{fmtMoney(trade.net_pnl)}</b>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export default function App() {
  const [strategies, setStrategies] = useState([]);
  const [curves, setCurves] = useState([]);
  const [trades, setTrades] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [minSharpe, setMinSharpe] = useState(0);
  const [sortKey, setSortKey] = useState("total_return");
  const [sortDirection, setSortDirection] = useState("desc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadCsv("./data/strategy_metrics.csv"),
      loadCsv("./data/strategy_equity.csv"),
      loadCsv("./data/strategy_trades.csv"),
    ]).then(([metrics, equity, tradeRows]) => {
      setStrategies(metrics);
      setCurves(equity);
      setTrades(tradeRows);
      setSelectedId(metrics[0]?.strategy_id || "");
      setLoading(false);
    });
  }, []);

  function handleSort(key) {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "name" ? "asc" : "desc");
    }
  }

  const filteredStrategies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return strategies
      .filter((strategy) => !q || `${strategy.name} ${strategy.symbol} ${strategy.strategy_type}`.toLowerCase().includes(q))
      .filter((strategy) => strategy.sharpe >= minSharpe)
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "string") return sortDirection === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        return sortDirection === "asc" ? av - bv : bv - av;
      });
  }, [strategies, query, minSharpe, sortKey, sortDirection]);

  const selectedStrategy = strategies.find((strategy) => strategy.strategy_id === selectedId) || filteredStrategies[0] || strategies[0];
  const selectedCurve = curves.filter((row) => row.strategy_id === selectedStrategy?.strategy_id);
  const selectedTrades = trades.filter((row) => row.strategy_id === selectedStrategy?.strategy_id);

  const portfolioStats = useMemo(() => {
    if (!strategies.length) return null;
    const best = [...strategies].sort((a, b) => b.total_return - a.total_return)[0];
    const avgSharpe = strategies.reduce((sum, item) => sum + item.sharpe, 0) / strategies.length;
    const avgReturn = strategies.reduce((sum, item) => sum + item.total_return, 0) / strategies.length;
    return { best, avgSharpe, avgReturn };
  }, [strategies]);

  if (loading) {
    return <main className="dashboard-shell loading">Loading CSV backtests...</main>;
  }

  return (
    <main className="dashboard-shell">
      <section className="hero-band">
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="github-link primary">
          <Icon name="github" /> GitHub
        </a>
      </section>

      <section className="metric-strip">
        <MetricCard label="Strategies" value={strategies.length} sub="mock CSV rows" />
        <MetricCard label="Best Return" value={fmtPct(portfolioStats.best.total_return)} sub={portfolioStats.best.name} tone="good" />
        <MetricCard label="Avg Sharpe" value={fmtNum(portfolioStats.avgSharpe)} sub="across strategies" />
        <MetricCard label="Avg Return" value={fmtPct(portfolioStats.avgReturn)} sub="unweighted" />
      </section>

      <section className="workspace-grid">
        <article className="leaderboard-panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Leaderboard</p>
              <h2>Strategy backtests</h2>
            </div>
            <span className="row-count">{filteredStrategies.length} shown</span>
          </div>
          <div className="filters">
            <label className="search-box">
              <Icon name="search" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search strategy, symbol, type" />
            </label>
            <label className="range-filter">
              <span><Icon name="filter" /> Min Sharpe {fmtNum(minSharpe, 1)}</span>
              <input type="range" min="-1" max="3" step="0.1" value={minSharpe} onChange={(event) => setMinSharpe(Number(event.target.value))} />
            </label>
          </div>
          <StrategyTable
            strategies={filteredStrategies}
            selectedId={selectedStrategy.strategy_id}
            onSelect={setSelectedId}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </article>

        <article className="comparison-panel">
          <div className="panel-head compact">
            <h3>Return vs drawdown</h3>
            <span>all strategies</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid stroke="#dfe6ea" />
              <XAxis dataKey="max_drawdown" name="Max DD" tickFormatter={(value) => fmtPct(value, 0)} tick={{ fontSize: 12 }} />
              <YAxis dataKey="total_return" name="Return" tickFormatter={(value) => fmtPct(value, 0)} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value, name) => [name === "Return" || name === "Max DD" ? fmtPct(value) : value, name]} />
              <Scatter data={strategies} fill="#0f766e" isAnimationActive={false} />
            </ScatterChart>
          </ResponsiveContainer>
        </article>
      </section>

      {selectedStrategy ? <Details strategy={selectedStrategy} curve={selectedCurve} trades={selectedTrades} /> : null}
    </main>
  );
}
