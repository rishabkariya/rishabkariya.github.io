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
  "param1_value",
  "param2_value",
  "total_return",
  "total_return_pct",
  "cagr",
  "cagr_pct",
  "sharpe",
  "sharpe_ratio",
  "sortino",
  "sortino_ratio",
  "max_drawdown",
  "max_drawdown_pct",
  "win_rate",
  "win_rate_pct",
  "profit_factor",
  "trades",
  "total_trades",
  "avg_trade",
  "volatility",
  "exposure",
  "equity",
  "pnl",
  "drawdown",
  "rolling_sharpe",
  "position",
  "close",
  "entry_price",
  "exit_price",
  "net_pnl",
  "r_multiple",
]);

function parseValue(key, value) {
  if (numericFields.has(key)) return Number(value);
  if (value === "True") return true;
  if (value === "False") return false;
  return value;
}

async function loadCsv(path) {
  const response = await fetch(path);
  const text = await response.text();
  return Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transform: (value, key) => parseValue(key, value),
  }).data;
}

const SCALE = 20000; // 1,000,000 raw → $50 displayed

function fmtPct(value, digits = 2) {
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

function fmtMoney(value) {
  return (Number(value) / SCALE).toLocaleString("en-US", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "USD",
  });
}

function fmtNum(value, digits = 2) {
  return Number(value || 0).toFixed(digits);
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

function sortLabel(key, sortKey, direction) {
  if (key !== sortKey) return "SORT";
  return direction === "asc" ? "ASC" : "DESC";
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
                  <b>{sortLabel(key, sortKey, sortDirection)}</b>
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
                <span>{strategy.param1_name}={strategy.param1_value} / {strategy.param2_name}={strategy.param2_value}</span>
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

function Heatmap({ strategy, sweep, selectedComboId, onSelectCombo }) {
  const [metric, setMetric] = useState("sharpe_ratio");
  const rows = useMemo(() => sweep.filter((item) => item.strategy_id === strategy?.strategy_id), [sweep, strategy]);
  const xValues = [...new Set(rows.map((item) => item.param2_value))].sort((a, b) => Number(a) - Number(b));
  const yValues = [...new Set(rows.map((item) => item.param1_value))].sort((a, b) => Number(a) - Number(b));
  const values = rows.map((item) => Number(item[metric]));
  const min = Math.min(...values);
  const max = Math.max(...values);

  function getCellStyles(value) {
    if (!Number.isFinite(value) || max === min) return { background: "#f8fafc", color: "#0f172a" };
    
    let background, color;
    if (value < 0) {
      // Map negative values to a Rose/Red scale (hue 345)
      const norm = min < 0 ? Math.max(0, value / min) : 0; // 1 at min, 0 at 0
      const lightness = 95 - (norm * 50); // 95% (light) to 45% (dark)
      background = `hsl(345, 80%, ${lightness}%)`;
      color = lightness < 60 ? "#ffffff" : "#0f172a";
    } else {
      // Map positive values to a Teal scale (hue 173)
      const norm = max > 0 ? value / max : 0; // 1 at max, 0 at 0
      const lightness = 95 - (norm * 50); // 95% (light) to 45% (dark)
      background = `hsl(173, 78%, ${lightness}%)`;
      color = lightness < 60 ? "#ffffff" : "#0f172a";
    }
    
    return { background, color };
  }

  function findCell(y, x) {
    return rows.find((item) => item.param1_value === y && item.param2_value === x);
  }

  return (
    <article className="heatmap-panel">
      <div className="panel-head">
        <div>
          <p className="panel-kicker">Parameter Heatmap</p>
          <h2>{strategy?.name}</h2>
        </div>
        <select value={metric} onChange={(event) => setMetric(event.target.value)}>
          <option value="sharpe_ratio">Sharpe</option>
          <option value="total_return_pct">Return</option>
          <option value="max_drawdown_pct">Max DD</option>
          <option value="profit_factor">Profit Factor</option>
        </select>
      </div>
      <div className="heatmap-scroll">
        <div className="heatmap-grid" style={{ gridTemplateColumns: `86px repeat(${xValues.length}, 82px)` }}>
          <span className="heatmap-axis">{strategy?.param1_name}</span>
          {xValues.map((x) => <span key={x} className="heatmap-axis">{strategy?.param2_name}<br />{x}</span>)}
          {yValues.map((y) => (
            <React.Fragment key={y}>
              <span className="heatmap-y">{y}</span>
              {xValues.map((x) => {
                const cell = findCell(y, x);
                const value = cell ? Number(cell[metric]) : 0;
                return (
                  <button
                    type="button"
                    key={`${y}-${x}`}
                    className={cell?.combo_id === selectedComboId ? "heat-cell selected" : "heat-cell"}
                    style={cell?.combo_id === selectedComboId ? {} : getCellStyles(value)}
                    onClick={() => cell && onSelectCombo(cell.combo_id)}
                  >
                    {metric.includes("pct") ? value.toFixed(2) : value.toFixed(2)}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <p className="heatmap-note">Click any cell to load that exact parameter combo into the PnL, drawdown, Sharpe, and trade panels.</p>
    </article>
  );
}

function Details({ combo, curve, trades }) {
  const winningTrades = trades.filter((trade) => trade.net_pnl > 0).length;
  const losingTrades = trades.length - winningTrades;
  const latest = curve[curve.length - 1];

  return (
    <section className="details-grid">
      <article className="chart-panel wide">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">Selected combo</p>
            <h2>{combo.strategy_name}</h2>
            <span className="combo-subtitle">{combo.param1_name}={combo.param1_value} / {combo.param2_name}={combo.param2_value}</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={330}>
          <ComposedChart data={curve}>
            <CartesianGrid stroke="#dfe6ea" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={26} />
            <YAxis yAxisId="equity" domain={['auto', 'auto']} tickFormatter={(value) => `$${(value / SCALE).toFixed(2)}`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value, name) => [fmtMoney(value), name]} />
            <Line yAxisId="equity" type="monotone" dataKey="equity" name="Equity" stroke="#0f766e" strokeWidth={2.4} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </article>

      <aside className="side-stack">
        <MetricCard label="Equity" value={fmtMoney(latest?.equity || 0)} sub="latest mark" />
        <MetricCard label="Total Return" value={fmtPct(combo.total_return)} tone={combo.total_return >= 0 ? "good" : "bad"} />
        <MetricCard label="Sharpe" value={fmtNum(combo.sharpe_ratio)} sub={`Sortino ${fmtNum(combo.sortino_ratio)}`} />
        <MetricCard label="Max Drawdown" value={fmtPct(combo.max_drawdown)} tone="bad" />
      </aside>

      <article className="chart-panel">
        <div className="panel-head compact">
          <h3>Drawdown</h3>
          <span>{fmtPct(combo.max_drawdown)}</span>
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
            <YAxis tickFormatter={(value) => `$${(value / SCALE).toFixed(2)}`} tick={{ fontSize: 12 }} />
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
          <h3>Position</h3>
          <span>{combo.total_trades} trades</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={curve}>
            <CartesianGrid stroke="#dfe6ea" vertical={false} />
            <XAxis dataKey="date" hide />
            <YAxis ticks={[-1, 0, 1]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="stepAfter" dataKey="position" stroke="#7c3aed" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </article>

      <article className="chart-panel wide">
        <div className="panel-head compact">
          <h3>Recent Fills / Trades</h3>
          <span>{trades.length} rows from CSV</span>
        </div>
        <div className="trade-log">
          {trades.slice(-10).reverse().map((trade) => (
            <div key={trade.trade_id} className="trade-row">
              <span>{trade.exit_date}</span>
              <strong>{trade.side}</strong>
              <span>{fmtNum(trade.entry_price)} to {fmtNum(trade.exit_price)}</span>
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
  const [sweep, setSweep] = useState([]);
  const [curves, setCurves] = useState([]);
  const [trades, setTrades] = useState([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState("");
  const [selectedComboId, setSelectedComboId] = useState("");
  const [query, setQuery] = useState("");
  const [minSharpe, setMinSharpe] = useState(-50);
  const [sortKey, setSortKey] = useState("total_return");
  const [sortDirection, setSortDirection] = useState("desc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadCsv("./data/strategy_metrics.csv"),
      loadCsv("./data/parameter_sweep.csv"),
      loadCsv("./data/strategy_equity.csv"),
      loadCsv("./data/strategy_trades.csv"),
    ]).then(([metrics, sweepRows, equityRows, tradeRows]) => {
      setStrategies(metrics);
      setSweep(sweepRows);
      setCurves(equityRows);
      setTrades(tradeRows);
      setSelectedStrategyId(metrics[0]?.strategy_id || "");
      setSelectedComboId(metrics[0]?.selected_combo_id || "");
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

  function handleStrategySelect(strategyId) {
    const strategy = strategies.find((item) => item.strategy_id === strategyId);
    setSelectedStrategyId(strategyId);
    setSelectedComboId(strategy?.selected_combo_id || sweep.find((item) => item.strategy_id === strategyId)?.combo_id || "");
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

  const selectedStrategy = strategies.find((strategy) => strategy.strategy_id === selectedStrategyId) || strategies[0];
  const selectedCombo = sweep.find((item) => item.combo_id === selectedComboId) || sweep.find((item) => item.strategy_id === selectedStrategy?.strategy_id);
  const selectedCurve = curves.filter((row) => row.combo_id === selectedCombo?.combo_id);
  const selectedTrades = trades.filter((row) => row.combo_id === selectedCombo?.combo_id);

  const portfolioStats = useMemo(() => {
    if (!strategies.length) return null;
    const best = [...strategies].sort((a, b) => b.total_return - a.total_return)[0];
    const avgSharpe = strategies.reduce((sum, item) => sum + item.sharpe, 0) / strategies.length;
    const combos = sweep.length;
    return { best, avgSharpe, combos };
  }, [strategies, sweep]);

  if (loading) {
    return <main className="dashboard-shell loading">Loading backtest CSVs...</main>;
  }

  return (
    <main className="dashboard-shell">
      <section className="hero-band">
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="github-link primary">
          <Icon name="github" /> GitHub
        </a>
      </section>

      <section className="metric-strip">
        <MetricCard label="Strategies" value={strategies.length} sub="stat-arb skipped" />
        <MetricCard label="Parameter Combos" value={portfolioStats.combos} sub="25 per strategy" />
        <MetricCard label="Best Return" value={fmtPct(portfolioStats.best.total_return)} sub={portfolioStats.best.name} tone="good" />
        <MetricCard label="Avg Sharpe" value={fmtNum(portfolioStats.avgSharpe)} sub="best combo per strategy" />
      </section>

      <section className="workspace-grid">
        <article className="leaderboard-panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Leaderboard</p>
              <h2>Best combo per strategy</h2>
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
              <input type="range" min="-300" max="30" step="1" value={minSharpe} onChange={(event) => setMinSharpe(Number(event.target.value))} />
            </label>
          </div>
          <StrategyTable
            strategies={filteredStrategies}
            selectedId={selectedStrategy?.strategy_id}
            onSelect={handleStrategySelect}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </article>

        <Heatmap
          strategy={selectedStrategy}
          sweep={sweep}
          selectedComboId={selectedCombo?.combo_id}
          onSelectCombo={setSelectedComboId}
        />
      </section>

      {selectedCombo ? <Details combo={selectedCombo} curve={selectedCurve} trades={selectedTrades} /> : null}

      <section className="bottom-analysis">
        <article className="chart-panel">
          <div className="panel-head compact">
            <h3>Return vs Drawdown</h3>
            <span>all 100 parameter combos</span>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart>
              <CartesianGrid stroke="#dfe6ea" />
              <XAxis dataKey="max_drawdown" name="Max DD" tickFormatter={(value) => fmtPct(value, 0)} tick={{ fontSize: 12 }} />
              <YAxis dataKey="total_return" name="Return" tickFormatter={(value) => fmtPct(value, 0)} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value, name) => [name === "Return" || name === "Max DD" ? fmtPct(value) : value, name]} />
              <Scatter data={sweep} fill="#0f766e" isAnimationActive={false} />
            </ScatterChart>
          </ResponsiveContainer>
        </article>
      </section>
    </main>
  );
}
