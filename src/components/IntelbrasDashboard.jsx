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
import { Wifi, Power, PowerOff, Network, MapPin, Radio } from 'lucide-react'
import { formatNumber } from '../utils/dataLoader'

const PIE_COLORS = ['#34d399', '#fb7185']

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
  if (filters.site !== 'all') filtered = filtered.filter((r) => r.site === filters.site)
  if (filters.model !== 'all') filtered = filtered.filter((r) => r.model === filters.model)

  const online = filtered.filter((r) => r.state === 'ONLINE')

  return {
    filtered,
    online,
    total: filtered.length,
    onlineCount: online.length,
    offlineCount: filtered.length - online.length,
    bySite: topOrdered(groupCount(filtered, 'site')),
    byModel: topOrdered(groupCount(filtered, 'model')),
    byVersion: topOrdered(groupCount(filtered, 'version')).slice(0, 8),
    sites: [...new Set(rows.map((r) => r.site).filter(Boolean))].sort(),
    models: [...new Set(rows.map((r) => r.model).filter(Boolean))].sort(),
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

function DonutStatus({ online, offline }) {
  const data = [
    { name: 'Online', value: online },
    { name: 'Offline', value: offline },
  ]
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
          {data.map((d, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Legend verticalAlign="bottom" iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  )
}

function BarSites({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2a3a55" />
        <XAxis type="number" tickFormatter={formatNumber} stroke="#64748b" />
        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} stroke="#64748b" />
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Bar dataKey="value" name="APs" fill="#38bdf8" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function BarModels({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3a55" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
        <YAxis tickFormatter={formatNumber} stroke="#64748b" />
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Bar dataKey="value" name="APs" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function OnlineBar({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3a55" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
        <YAxis tickFormatter={formatNumber} stroke="#64748b" />
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Legend />
        <Bar dataKey="online" name="Online" stackId="a" fill="#34d399" />
        <Bar dataKey="offline" name="Offline" stackId="a" fill="#fb7185" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function IntelbrasDashboard({ rows, lastUpdate }) {
  const [filters, setFilters] = useState({ site: 'all', model: 'all' })
  const data = useMemo(() => processRows(rows, filters), [rows, filters])

  const onlineStatusData = rows.reduce((acc, r) => {
    if (!acc[r.site]) acc[r.site] = { name: r.site, online: 0, offline: 0 }
    if (r.state === 'ONLINE') acc[r.site].online++
    else acc[r.site].offline++
    return acc
  }, {})
  const onlineStatusArr = Object.values(onlineStatusData)

  return (
    <div className="dashboard">
      <div className="hero-banner">
        <div className="hero-stat">
          <span className="hero-stat-value">{formatNumber(data.onlineCount)}</span>
          <span className="hero-stat-label">APs Ativos</span>
        </div>
        <div className="hero-info">
          <span className="hero-info-badge">Intelbras</span>
          <span className="hero-info-badge">Cloud Manager</span>
          <span className="hero-info-badge">{data.total} APs no total</span>
          <span className="hero-info-badge lax">{Math.round(data.onlineRatio * 100)}% disponibilidade</span>
          {lastUpdate ? (
            <span className="hero-update">Atualizado em {new Date(lastUpdate).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
          ) : null}
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-field">
          <label>Site / Estado</label>
          <select value={filters.site} onChange={(e) => setFilters({ ...filters, site: e.target.value })}>
            <option value="all">Todos os sites</option>
            {data.sites.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label>Modelo</label>
          <select value={filters.model} onChange={(e) => setFilters({ ...filters, model: e.target.value })}>
            <option value="all">Todos os modelos</option>
            {data.models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="update-info">
          <span className="dot" />
          <div>
            <strong>Fabricante</strong>
            <span>Intelbras — Wi-Fi</span>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <KPI label="Total de APs" value={data.total} icon={Radio} color="#38bdf8" />
        <KPI label="APs Ativos (Online)" value={data.onlineCount} icon={Power} color="#34d399" />
        <KPI label="APs Offline" value={data.offlineCount} icon={PowerOff} color="#fb7185" />
        <KPI label="Sites / Estados" value={data.bySite.length} icon={MapPin} color="#6366f1" />
        <KPI label="Modelo predominante" value={data.byModel[0]?.name || '—'} icon={Wifi} color="#fbbf24" sub={data.byModel[0] ? `${formatNumber(data.byModel[0].value)} APs` : ''} />
        <KPI label="Disponibilidade" value={`${Math.round(data.onlineRatio * 100)}%`} icon={Network} color="#22d3ee" sub={`${formatNumber(data.onlineCount)} de ${formatNumber(data.total)}`} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Status geral dos APs" subtitle="Proporção online × offline">
          <DonutStatus online={data.onlineCount} offline={data.offlineCount} />
        </ChartCard>

        <ChartCard title="Modelos" subtitle="Distribuição por modelo de AP">
          <BarModels data={data.byModel} />
        </ChartCard>

        <ChartCard title="APs por site / estado" subtitle="Total por localidade">
          <BarSites data={data.bySite} />
        </ChartCard>

        <ChartCard title="Status por site" subtitle="Online × offline por localidade">
          <OnlineBar data={onlineStatusArr} />
        </ChartCard>
      </div>
    </div>
  )
}
