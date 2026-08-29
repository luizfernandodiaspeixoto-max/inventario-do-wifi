import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { Wifi, Radio, Users, CalendarDays, BadgeCheck } from 'lucide-react'
import { formatNumber, expYear } from '../utils/dataLoader'

const BAR_COLORS = ['#38bdf8', '#6366f1', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6', '#fb7185', '#22d3ee']

function groupCount(rows, key) {
  return rows.reduce((acc, r) => {
    const v = r[key] || 'Não informado'
    acc[v] = (acc[v] || 0) + 1
    return acc
  }, {})
}

function topOrdered(obj) {
  return Object.entries(obj)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

function processRows(rows, filters) {
  let filtered = rows
  if (filters.model !== 'all') filtered = filtered.filter((r) => r.model === filters.model)
  if (filters.account !== 'all') filtered = filtered.filter((r) => r.accountName === filters.account)

  const expYears = filtered.reduce((acc, r) => {
    const y = expYear(r.subscriptionExpiration)
    if (y) acc[y] = (acc[y] || 0) + 1
    return acc
  }, {})
  const byExpiration = Object.entries(expYears)
    .sort((a, b) => a[0] - b[0])
    .map(([name, value]) => ({ name: String(name), value }))

  return {
    filtered,
    total: filtered.length,
    byModel: topOrdered(groupCount(filtered, 'model')).slice(0, 10),
    byAccount: topOrdered(groupCount(filtered, 'accountName')).slice(0, 10),
    byExpiration,
    archived: filtered.filter((r) => r.archived).length,
    models: [...new Set(rows.map((r) => r.model).filter(Boolean))].sort(),
    accounts: [...new Set(rows.map((r) => r.accountName).filter(Boolean))].sort(),
  }
}

function KPI({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: `${color}1a`, color }}>
        <Icon size={22} />
      </div>
      <div className="kpi-info">
        <div className="kpi-value">{formatNumber(value)}</div>
        <div className="kpi-label">{label}</div>
        {sub ? <div className="kpi-sub">{sub}</div> : null}
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="chart-body">{children}</div>
    </div>
  )
}

function BarModels({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2a3a55" />
        <XAxis type="number" tickFormatter={formatNumber} stroke="#64748b" />
        <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 11 }} stroke="#64748b" />
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Bar dataKey="value" name="APs licenciados" radius={[0, 6, 6, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function BarAccounts({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2a3a55" />
        <XAxis type="number" tickFormatter={formatNumber} stroke="#64748b" />
        <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 10 }} stroke="#64748b" />
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Bar dataKey="value" name="APs" fill="#fbbf24" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function LineExpiration({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 12, right: 20, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3a55" />
        <XAxis dataKey="name" stroke="#64748b" />
        <YAxis tickFormatter={formatNumber} stroke="#64748b" />
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Line type="monotone" dataKey="value" name="APs" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function DonutTier({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
          {data.map((d, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Legend verticalAlign="bottom" iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default function ArubaDashboard({ rows, lastUpdate }) {
  const [filters, setFilters] = useState({ model: 'all', account: 'all' })
  const data = useMemo(() => processRows(rows, filters), [rows, filters])

  const tierArr = Object.entries(groupCount(rows, 'subscriptionTier')).map(([name, value]) => ({ name, value }))

  return (
    <div className="dashboard">
      <div className="hero-banner">
        <div className="hero-stat aruba">
          <span className="hero-stat-value">{formatNumber(data.total)}</span>
          <span className="hero-stat-label">APs Licenciados</span>
        </div>
        <div className="hero-info">
          <span className="hero-info-badge">Aruba</span>
          <span className="hero-info-badge">HPE Networking Central</span>
          <span className="hero-info-badge">Somente APs com licença</span>
          {lastUpdate ? (
            <span className="hero-update">Atualizado em {new Date(lastUpdate).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
          ) : null}
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-field">
          <label>Modelo</label>
          <select value={filters.model} onChange={(e) => setFilters({ ...filters, model: e.target.value })}>
            <option value="all">Todos os modelos</option>
            {data.models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label>Cliente</label>
          <select value={filters.account} onChange={(e) => setFilters({ ...filters, account: e.target.value })}>
            <option value="all">Todos os clientes</option>
            {data.accounts.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="update-info">
          <span className="dot" />
          <div>
            <strong>Fabricante</strong>
            <span>Aruba — HPE</span>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <KPI label="Total APs licenciados" value={data.total} icon={Radio} color="#38bdf8" />
        <KPI label="Clientes / contas" value={data.accounts.length} icon={Users} color="#6366f1" />
        <KPI label="Modelos distintos" value={data.models.length} icon={Wifi} color="#fbbf24" />
        <KPI label="Faixas de expiração" value={data.byExpiration.length} icon={CalendarDays} color="#34d399" sub="anos de vencimento" />
        <KPI label="Arquivados" value={data.archived} icon={BadgeCheck} color="#94a3b8" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Modelos licenciados" subtitle="APs com licença por modelo">
          <BarModels data={data.byModel} />
        </ChartCard>

        <ChartCard title="Clientes" subtitle="Top contas com mais APs licenciados">
          <BarAccounts data={data.byAccount} />
        </ChartCard>

        <ChartCard title="Expiração de licenças" subtitle="APs por ano de vencimento da licença">
          {data.byExpiration.length ? (
            <LineExpiration data={data.byExpiration} />
          ) : (
            <p className="empty">Nenhuma licença com data no filtro atual.</p>
          )}
        </ChartCard>

        <ChartCard title="Tipo de licença" subtitle="Distribuição por subscription tier">
          <DonutTier data={tierArr} />
        </ChartCard>
      </div>
    </div>
  )
}
