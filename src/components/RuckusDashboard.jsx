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
} from 'recharts'
import { Wifi, Radio, Users, MapPin, AlertTriangle, Settings } from 'lucide-react'
import { formatNumber } from '../utils/dataLoader'

const STATUS_COLORS = { Online: '#34d399', Offline: '#fb7185', Flagged: '#fbbf24' }
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
  if (filters.zone !== 'all') filtered = filtered.filter((r) => r.zone === filters.zone)
  if (filters.status !== 'all') filtered = filtered.filter((r) => r.status === filters.status)

  const online = filtered.filter((r) => r.status === 'Online')
  const flagged = filtered.filter((r) => r.status === 'Flagged')

  return {
    filtered,
    online,
    total: filtered.length,
    onlineCount: online.length,
    offlineCount: filtered.filter((r) => r.status === 'Offline').length,
    flaggedCount: flagged.length,
    totalClients: filtered.reduce((s, r) => s + r.clients, 0),
    byModel: topOrdered(groupCount(filtered, 'model')).slice(0, 10),
    byZone: topOrdered(groupCount(filtered, 'zone')).slice(0, 10),
    byConfig: topOrdered(groupCount(filtered, 'configStatus')),
    models: [...new Set(rows.map((r) => r.model).filter(Boolean))].sort(),
    zones: [...new Set(rows.map((r) => r.zone).filter(Boolean))].sort(),
    onlineRatio: filtered.length ? online.length / filtered.length : 0,
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

function ChartCard({ title, subtitle, className, children }) {
  return (
    <div className={`chart-card${className ? ' ' + className : ''}`}>
      <div className="chart-header">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="chart-body">{children}</div>
    </div>
  )
}

function DonutStatus({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
          {data.map((d, i) => (
            <Cell key={i} fill={STATUS_COLORS[d.name] || BAR_COLORS[i]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Legend verticalAlign="bottom" iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  )
}

function BarModels({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2a3a55" />
        <XAxis type="number" tickFormatter={formatNumber} stroke="#64748b" />
        <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} stroke="#64748b" />
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Bar dataKey="value" name="APs" radius={[0, 6, 6, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function BarZones({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2a3a55" />
        <XAxis type="number" tickFormatter={formatNumber} stroke="#64748b" />
        <YAxis type="category" dataKey="name" width={155} tick={{ fontSize: 10 }} stroke="#64748b" />
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Bar dataKey="value" name="APs" fill="#fbbf24" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function BarConfig({ data }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 12, right: 20, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3a55" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#64748b" />
        <YAxis tickFormatter={formatNumber} stroke="#64748b" />
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Bar dataKey="value" name="APs" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function StackedStatusByZone({ rows }) {
  const agg = rows.reduce((acc, r) => {
    const z = r.zone || 'Não informado'
    if (!acc[z]) acc[z] = { name: z, Online: 0, Offline: 0, Flagged: 0 }
    acc[z][r.status] = (acc[z][r.status] || 0) + 1
    return acc
  }, {})
  const data = Object.values(agg).sort((a, b) => (b.Online + b.Offline + b.Flagged) - (a.Online + a.Offline + a.Flagged)).slice(0, 10)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2a3a55" />
        <XAxis type="number" tickFormatter={formatNumber} stroke="#64748b" />
        <YAxis type="category" dataKey="name" width={155} tick={{ fontSize: 10 }} stroke="#64748b" />
        <Tooltip />
        <Legend />
        <Bar dataKey="Online" stackId="a" fill="#34d399" />
        <Bar dataKey="Offline" stackId="a" fill="#fb7185" />
        <Bar dataKey="Flagged" stackId="a" fill="#fbbf24" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function RuckusDashboard({ rows, lastUpdate }) {
  const [filters, setFilters] = useState({ model: 'all', zone: 'all', status: 'all' })
  const data = useMemo(() => processRows(rows, filters), [rows, filters])

  const statusData = [
    { name: 'Online', value: data.onlineCount },
    { name: 'Offline', value: data.offlineCount },
    { name: 'Flagged', value: data.flaggedCount },
  ].filter((d) => d.value > 0)

  return (
    <div className="dashboard">
      <div className="hero-banner">
        <div className="hero-stat ruckus">
          <span className="hero-stat-value">{formatNumber(data.onlineCount)}</span>
          <span className="hero-stat-label">APs Ativos</span>
        </div>
        <div className="hero-info">
          <span className="hero-info-badge">Ruckus</span>
          <span className="hero-info-badge">Ruckus Wireless</span>
          <span className="hero-info-badge">{data.total} APs no total</span>
          <span className="hero-info-badge lax">{Math.round(data.onlineRatio * 100)}% disponibilidade</span>
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
          <label>Zona / Local</label>
          <select value={filters.zone} onChange={(e) => setFilters({ ...filters, zone: e.target.value })}>
            <option value="all">Todas as zonas</option>
            {data.zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label>Status</label>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="all">Todos os status</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Flagged">Flagged</option>
          </select>
        </div>
        <div className="update-info">
          <span className="dot" />
          <div>
            <strong>Fabricante</strong>
            <span>Ruckus — Wireless</span>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <KPI label="Total de APs" value={data.total} icon={Radio} color="#38bdf8" />
        <KPI label="APs Ativos (Online)" value={data.onlineCount} icon={Wifi} color="#34d399" />
        <KPI label="APs Offline" value={data.offlineCount} icon={AlertTriangle} color="#fb7185" />
        <KPI label="APs Flagged" value={data.flaggedCount} icon={Settings} color="#fbbf24" />
        <KPI label="Clientes conectados" value={data.totalClients} icon={Users} color="#f472b6" />
        <KPI label="Zonas / Locais" value={data.zones.length} icon={MapPin} color="#22d3ee" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Status dos APs" subtitle="Proporção online × offline × flagged">
          <DonutStatus data={statusData} />
        </ChartCard>

        <ChartCard title="Modelos" subtitle="Distribuição por modelo de AP">
          <BarModels data={data.byModel} />
        </ChartCard>

        <ChartCard title="Configuração" subtitle="Estado da configuração dos APs">
          <BarConfig data={data.byConfig} />
        </ChartCard>

        <ChartCard title="Status por zona" subtitle="Online × offline × flagged por local">
          <StackedStatusByZone rows={data.filtered} />
        </ChartCard>

        <ChartCard title="APs por zona" subtitle="Top localidades com mais APs" className="wide">
          <BarZones data={data.byZone} />
        </ChartCard>
      </div>
    </div>
  )
}
