import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import Papa from "papaparse";
import {
  AlertTriangle,
  BarChart3,
  Factory,
  FileUp,
  Gauge,
  LineChart,
  RotateCcw,
} from "lucide-react";
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
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./styles.css";

const CSV_URL = "/data/sqc_measurements.csv";
const numberFields = ["sample", "measurement", "target", "lsl", "usl", "defects", "inspected", "downtime_minutes"];
const palette = ["#0f766e", "#2563eb", "#dc2626", "#d97706", "#7c3aed", "#475569"];

function parseRows(rows) {
  return rows.map((row) => {
    const parsed = { ...row };
    numberFields.forEach((field) => {
      parsed[field] = Number(parsed[field] || 0);
    });
    parsed.outOfSpec = parsed.measurement < parsed.lsl || parsed.measurement > parsed.usl;
    return parsed;
  });
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stdDev(values) {
  if (values.length < 2) return 0;
  const avg = average(values);
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function formatPct(value) {
  return `${value.toFixed(2)}%`;
}

function groupBy(rows, key) {
  return rows.reduce((groups, row) => {
    const groupKey = row[key];
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(row);
    return groups;
  }, {});
}

function App() {
  const [rows, setRows] = useState([]);
  const [line, setLine] = useState("All");
  const [shift, setShift] = useState("All");
  const [product, setProduct] = useState("All");

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => setRows(parseRows(result.data)),
    });
  }, []);

  const options = useMemo(() => ({
    lines: ["All", ...new Set(rows.map((row) => row.line))],
    shifts: ["All", ...new Set(rows.map((row) => row.shift))],
    products: ["All", ...new Set(rows.map((row) => row.product))],
  }), [rows]);

  const filtered = useMemo(() => rows.filter((row) =>
    (line === "All" || row.line === line) &&
    (shift === "All" || row.shift === shift) &&
    (product === "All" || row.product === product)
  ), [rows, line, shift, product]);

  const stats = useMemo(() => {
    const measurements = filtered.map((row) => row.measurement);
    const inspected = filtered.reduce((sum, row) => sum + row.inspected, 0);
    const defects = filtered.reduce((sum, row) => sum + row.defects, 0);
    const outOfSpec = filtered.filter((row) => row.outOfSpec).length;
    const target = filtered[0]?.target || 0;
    const lsl = filtered[0]?.lsl || 0;
    const usl = filtered[0]?.usl || 0;
    const sigma = stdDev(measurements);
    const cpk = sigma ? Math.min((usl - average(measurements)) / (3 * sigma), (average(measurements) - lsl) / (3 * sigma)) : 0;

    return {
      target,
      lsl,
      usl,
      avg: average(measurements),
      sigma,
      cpk,
      defectRate: inspected ? (defects / inspected) * 100 : 0,
      defects,
      inspected,
      outOfSpec,
      downtime: filtered.reduce((sum, row) => sum + row.downtime_minutes, 0),
    };
  }, [filtered]);

  const dailyData = useMemo(() => Object.entries(groupBy(filtered, "date")).map(([date, dayRows]) => ({
    date: date.slice(5),
    measurement: Number(average(dayRows.map((row) => row.measurement)).toFixed(3)),
    defects: dayRows.reduce((sum, row) => sum + row.defects, 0),
    downtime: dayRows.reduce((sum, row) => sum + row.downtime_minutes, 0),
  })), [filtered]);

  const lineData = useMemo(() => Object.entries(groupBy(filtered, "line")).map(([name, lineRows]) => {
    const inspected = lineRows.reduce((sum, row) => sum + row.inspected, 0);
    const defects = lineRows.reduce((sum, row) => sum + row.defects, 0);
    return {
      name,
      defectRate: inspected ? Number(((defects / inspected) * 100).toFixed(2)) : 0,
      cpk: Number((Math.min(
        (lineRows[0].usl - average(lineRows.map((row) => row.measurement))) / (3 * stdDev(lineRows.map((row) => row.measurement)) || 1),
        (average(lineRows.map((row) => row.measurement)) - lineRows[0].lsl) / (3 * stdDev(lineRows.map((row) => row.measurement)) || 1)
      )).toFixed(2)),
    };
  }), [filtered]);

  const defectData = useMemo(() => Object.entries(groupBy(filtered.filter((row) => row.defect_type !== "None"), "defect_type"))
    .map(([name, defectRows]) => ({ name, value: defectRows.reduce((sum, row) => sum + row.defects, 0) }))
    .sort((a, b) => b.value - a.value), [filtered]);

  const recentRows = filtered.slice(-8).reverse();

  function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => setRows(parseRows(result.data)),
    });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Manufacturing SQC</p>
          <h1>Quality control dashboard</h1>
        </div>
        <div className="actions">
          <label className="icon-button" title="Upload CSV">
            <FileUp size={18} />
            <input type="file" accept=".csv" onChange={handleUpload} />
          </label>
          <button className="icon-button" title="Reset filters" onClick={() => { setLine("All"); setShift("All"); setProduct("All"); }}>
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      <section className="filters">
        <Select label="Line" value={line} options={options.lines} onChange={setLine} />
        <Select label="Shift" value={shift} options={options.shifts} onChange={setShift} />
        <Select label="Product" value={product} options={options.products} onChange={setProduct} />
      </section>

      <section className="kpi-grid">
        <Kpi icon={<Gauge />} label="Cpk" value={stats.cpk.toFixed(2)} tone={stats.cpk < 1 ? "bad" : stats.cpk < 1.33 ? "warn" : "good"} />
        <Kpi icon={<BarChart3 />} label="Defect rate" value={formatPct(stats.defectRate)} tone={stats.defectRate > 2 ? "bad" : "good"} />
        <Kpi icon={<AlertTriangle />} label="Out of spec" value={stats.outOfSpec} tone={stats.outOfSpec ? "bad" : "good"} />
        <Kpi icon={<Factory />} label="Inspected" value={stats.inspected.toLocaleString()} tone="neutral" />
      </section>

      <section className="dashboard-grid">
        <ChartPanel title="X-bar control trend" icon={<LineChart size={17} />}>
          <ResponsiveContainer width="100%" height={310}>
            <ComposedChart data={dailyData} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d9e2e5" />
              <XAxis dataKey="date" />
              <YAxis domain={["dataMin - 0.12", "dataMax + 0.12"]} />
              <Tooltip />
              <Legend />
              <ReferenceLine y={stats.target} stroke="#111827" strokeDasharray="4 4" label="Target" />
              <ReferenceLine y={stats.usl} stroke="#dc2626" strokeDasharray="5 5" label="USL" />
              <ReferenceLine y={stats.lsl} stroke="#dc2626" strokeDasharray="5 5" label="LSL" />
              <Area type="monotone" dataKey="measurement" fill="#dbeafe" stroke="#2563eb" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Line capability and defects" icon={<BarChart3 size={17} />}>
          <ResponsiveContainer width="100%" height={310}>
            <BarChart data={lineData} margin={{ top: 12, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d9e2e5" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="defectRate" name="Defect %" fill="#d97706" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" dataKey="cpk" name="Cpk" stroke="#0f766e" strokeWidth={3} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Pareto defect mix" icon={<AlertTriangle size={17} />}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={defectData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={2}>
                {defectData.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Defects and downtime by day" icon={<Factory size={17} />}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d9e2e5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="defects" stackId="1" stroke="#dc2626" fill="#fecaca" />
              <Area type="monotone" dataKey="downtime" stackId="2" stroke="#475569" fill="#cbd5e1" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      <section className="table-panel">
        <div className="panel-title">
          <h2>Latest sample records</h2>
          <span>{filtered.length} rows from CSV</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Line</th>
                <th>Shift</th>
                <th>Batch</th>
                <th>Measurement</th>
                <th>Defects</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRows.map((row) => (
                <tr key={`${row.batch}-${row.sample}`}>
                  <td>{row.date}</td>
                  <td>{row.line}</td>
                  <td>{row.shift}</td>
                  <td>{row.batch}</td>
                  <td>{row.measurement.toFixed(2)}</td>
                  <td>{row.defects}</td>
                  <td><span className={`status ${row.outOfSpec ? "bad" : "good"}`}>{row.outOfSpec ? "Out of spec" : "In control"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Kpi({ icon, label, value, tone }) {
  return (
    <article className={`kpi ${tone}`}>
      <div className="kpi-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function ChartPanel({ title, icon, children }) {
  return (
    <section className="chart-panel">
      <div className="panel-title">
        <h2>{icon}{title}</h2>
      </div>
      {children}
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
