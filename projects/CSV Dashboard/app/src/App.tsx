import { useState, useEffect } from 'react'
import './App.css'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// Embedded data (same structure as CSV)
const salesData = [
  { date: '2024-01-01', revenue: 125000, expenses: 85000, profit: 40000, orders: 450, region: 'North America' },
  { date: '2024-02-01', revenue: 132000, expenses: 88000, profit: 44000, orders: 480, region: 'North America' },
  { date: '2024-03-01', revenue: 148000, expenses: 92000, profit: 56000, orders: 520, region: 'North America' },
  { date: '2024-04-01', revenue: 155000, expenses: 95000, profit: 60000, orders: 550, region: 'North America' },
  { date: '2024-05-01', revenue: 168000, expenses: 98000, profit: 70000, orders: 590, region: 'North America' },
  { date: '2024-06-01', revenue: 175000, expenses: 102000, profit: 73000, orders: 620, region: 'North America' },
  { date: '2024-07-01', revenue: 182000, expenses: 105000, profit: 77000, orders: 650, region: 'North America' },
  { date: '2024-08-01', revenue: 178000, expenses: 103000, profit: 75000, orders: 640, region: 'North America' },
  { date: '2024-09-01', revenue: 165000, expenses: 99000, profit: 66000, orders: 600, region: 'North America' },
  { date: '2024-10-01', revenue: 172000, expenses: 101000, profit: 71000, orders: 630, region: 'North America' },
  { date: '2024-11-01', revenue: 195000, expenses: 110000, profit: 85000, orders: 720, region: 'North America' },
  { date: '2024-12-01', revenue: 210000, expenses: 115000, profit: 95000, orders: 780, region: 'North America' },
]

const userData = [
  { date: '2024-01-01', new_users: 1200, active_users: 8500, sessions: 15200, bounce_rate: 42.5, avg_session_duration: 245, conversion_rate: 3.2 },
  { date: '2024-02-01', new_users: 1350, active_users: 9200, sessions: 16800, bounce_rate: 40.8, avg_session_duration: 252, conversion_rate: 3.5 },
  { date: '2024-03-01', new_users: 1480, active_users: 10100, sessions: 18500, bounce_rate: 38.5, avg_session_duration: 258, conversion_rate: 3.8 },
  { date: '2024-04-01', new_users: 1520, active_users: 10800, sessions: 19800, bounce_rate: 37.2, avg_session_duration: 265, conversion_rate: 4.1 },
  { date: '2024-05-01', new_users: 1680, active_users: 11500, sessions: 21200, bounce_rate: 36.0, avg_session_duration: 272, conversion_rate: 4.3 },
  { date: '2024-06-01', new_users: 1750, active_users: 12200, sessions: 22800, bounce_rate: 35.5, avg_session_duration: 278, conversion_rate: 4.5 },
  { date: '2024-07-01', new_users: 1820, active_users: 12900, sessions: 24200, bounce_rate: 34.8, avg_session_duration: 285, conversion_rate: 4.7 },
  { date: '2024-08-01', new_users: 1780, active_users: 12600, sessions: 23800, bounce_rate: 35.2, avg_session_duration: 282, conversion_rate: 4.6 },
  { date: '2024-09-01', new_users: 1650, active_users: 11800, sessions: 22200, bounce_rate: 36.5, avg_session_duration: 275, conversion_rate: 4.2 },
  { date: '2024-10-01', new_users: 1720, active_users: 12400, sessions: 23500, bounce_rate: 35.8, avg_session_duration: 280, conversion_rate: 4.4 },
  { date: '2024-11-01', new_users: 1950, active_users: 13800, sessions: 26200, bounce_rate: 33.5, avg_session_duration: 295, conversion_rate: 4.9 },
  { date: '2024-12-01', new_users: 2100, active_users: 15200, sessions: 28800, bounce_rate: 32.0, avg_session_duration: 310, conversion_rate: 5.2 },
]

const productData = [
  { product: 'Wireless Headphones', category: 'Electronics', units_sold: 2850, revenue: 427500, profit_margin: 35, rating: 4.6, stock_level: 145 },
  { product: 'Smart Watch', category: 'Electronics', units_sold: 1920, revenue: 576000, profit_margin: 42, rating: 4.4, stock_level: 89 },
  { product: 'Laptop Stand', category: 'Accessories', units_sold: 3420, revenue: 136800, profit_margin: 55, rating: 4.7, stock_level: 230 },
  { product: 'USB-C Hub', category: 'Electronics', units_sold: 2680, revenue: 187600, profit_margin: 48, rating: 4.3, stock_level: 178 },
  { product: 'Mechanical Keyboard', category: 'Electronics', units_sold: 1560, revenue: 234000, profit_margin: 38, rating: 4.8, stock_level: 67 },
]

const monthlyRevenue = [
  { month: '2024-01', revenue: 298000, expenses: 204000, profit: 94000, orders: 980 },
  { month: '2024-02', revenue: 319000, expenses: 217000, profit: 102000, orders: 1070 },
  { month: '2024-03', revenue: 348000, expenses: 235000, profit: 113000, orders: 1160 },
  { month: '2024-04', revenue: 368000, expenses: 248000, profit: 120000, orders: 1240 },
  { month: '2024-05', revenue: 395000, expenses: 262000, profit: 133000, orders: 1340 },
  { month: '2024-06', revenue: 415000, expenses: 276000, profit: 139000, orders: 1420 },
  { month: '2024-07', revenue: 435000, expenses: 289000, profit: 146000, orders: 1500 },
  { month: '2024-08', revenue: 425000, expenses: 282000, profit: 143000, orders: 1470 },
  { month: '2024-09', revenue: 398000, expenses: 265000, profit: 133000, orders: 1370 },
  { month: '2024-10', revenue: 416000, expenses: 277000, profit: 139000, orders: 1440 },
  { month: '2024-11', revenue: 462000, expenses: 302000, profit: 160000, orders: 1630 },
  { month: '2024-12', revenue: 503000, expenses: 321000, profit: 182000, orders: 1790 },
]

const regionData = [
  { name: 'North America', value: 2105000 },
  { name: 'Europe', value: 1581000 },
  { name: 'Asia Pacific', value: 1352000 },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const bgColor = darkMode ? '#0f172a' : '#ffffff'
  const cardBg = darkMode ? '#1e293b' : '#ffffff'
  const textColor = darkMode ? '#f8fafc' : '#0f172a'
  const mutedText = darkMode ? '#94a3b8' : '#64748b'
  const borderColor = darkMode ? '#334155' : '#e2e8f0'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor, color: textColor }}>
        <div>Loading dashboard data...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${borderColor}`, backgroundColor: cardBg, padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#3b82f6', borderRadius: '0.5rem' }}>📊</div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Analytics Dashboard</h1>
              <p style={{ fontSize: '0.875rem', color: mutedText, margin: 0 }}>Real-time business insights</p>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '0.5rem 1rem', border: `1px solid ${borderColor}`, borderRadius: '0.375rem', backgroundColor: cardBg, cursor: 'pointer', color: textColor }}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: cardBg, borderRadius: '0.5rem', border: `1px solid ${borderColor}` }}>
            <p style={{ fontSize: '0.875rem', color: mutedText, margin: '0 0 0.5rem 0' }}>Total Revenue</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>$5,038,000</p>
            <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0' }}>+12.5%</p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: cardBg, borderRadius: '0.5rem', border: `1px solid ${borderColor}` }}>
            <p style={{ fontSize: '0.875rem', color: mutedText, margin: '0 0 0.5rem 0' }}>Total Profit</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>$1,644,000</p>
            <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0' }}>+8.3%</p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: cardBg, borderRadius: '0.5rem', border: `1px solid ${borderColor}` }}>
            <p style={{ fontSize: '0.875rem', color: mutedText, margin: '0 0 0.5rem 0' }}>Total Orders</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>16,390</p>
            <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0' }}>+15.2%</p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: cardBg, borderRadius: '0.5rem', border: `1px solid ${borderColor}` }}>
            <p style={{ fontSize: '0.875rem', color: mutedText, margin: '0 0 0.5rem 0' }}>Active Users</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>15,200</p>
            <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0' }}>+5.7%</p>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: cardBg, borderRadius: '0.5rem', border: `1px solid ${borderColor}` }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(value) => value.substring(5)} />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: cardBg, borderRadius: '0.5rem', border: `1px solid ${borderColor}` }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>User Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => value.substring(5)} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="new_users" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="active_users" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: cardBg, borderRadius: '0.5rem', border: `1px solid ${borderColor}` }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Product Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `$${value / 1000}k`} />
                <YAxis type="category" dataKey="product" width={120} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: cardBg, borderRadius: '0.5rem', border: `1px solid ${borderColor}` }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Revenue by Region</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ padding: '1.5rem', backgroundColor: cardBg, borderRadius: '0.5rem', border: `1px solid ${borderColor}` }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Recent Sales Data</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 500 }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 500 }}>Region</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 500 }}>Revenue</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 500 }}>Profit</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 500 }}>Orders</th>
                </tr>
              </thead>
              <tbody>
                {salesData.slice(-5).reverse().map((row, index) => (
                  <tr key={index} style={{ borderBottom: `1px solid ${borderColor}` }}>
                    <td style={{ padding: '0.75rem 1rem' }}>{row.date}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', border: `1px solid ${borderColor}`, borderRadius: '0.25rem', fontSize: '0.75rem' }}>{row.region}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{formatCurrency(row.revenue)}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#10b981' }}>{formatCurrency(row.profit)}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{row.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${borderColor}`, marginTop: '2rem', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: mutedText, margin: 0 }}>
          Built with React + Recharts • Data from CSV files
        </p>
      </footer>
    </div>
  )
}

export default App
