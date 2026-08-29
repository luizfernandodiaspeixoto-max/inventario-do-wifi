import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import { Radio, MapPin, Wifi, CheckCircle, Users } from 'lucide-react'
import { formatNumber, parseBytesGb } from '../utils/dataLoader'

const BAR_COLORS = ['#38bdf8', '#6366f1', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6', '#fb7185', '#22d3ee', '#a3e635']

function processRows(rows) {
  const withAp = rows.filter((r) => r.mr > 0)
  const totalMr = withAp.reduce((s, r) => s + r.mr, 0)

  const byOrg = withAp.reduce((acc, r) => {
    const org = r.organization || 'Não informado'
    if (!acc[org]) acc[org] = { name: org, mr: 0, networks: 0 }
    acc[org].mr += r.mr
    acc[org].networks += 1
    return acc
  }, {})
  const byOrgArr = Object.values(byOrg)
    .sort((a, b) => b.mr - a.mr)
    .slice(0, 10)

  const byNetwork = withAp
    .map((r) => ({
      name: r.network || 'Não informado',
      mr: r.mr,
      organization: r.organization || 'Não informado',
      networkType: r.networkType || 'Não informado',
      usage: r.usage && r.usage !== 'None' ? parseBytesGb(r.usage) : 0,
      hasUsage: r.usage && r.usage !== 'None',
    }))
    .sort((a, b) => b.mr - a.mr)

  const byNetworkType = withAp.reduce((acc, r) => {
    const t = r.networkType || 'Não informado'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})

  const byUsage = withAp
    .filter((r) => r.usage && r.usage !== 'None')
    .map((r) => ({ name: r.network, usage: parseBytesGb(r.usage), mr: r.mr }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 10)

  const orgs = [...new Set(withAp.map((r) => r.organization).filter(Boolean))].sort()

  const totalClients = rows.reduce((s, r) => s + r.clients, 0)
  const byClients = rows
    .map((r) => ({ name: r.network || 'Não informado', clients: r.clients }))
    .filter((r) => r.clients > 0)
    .sort((a, b) => b.clients - a.clients)
    .slice(0, 10)

  return {
    withAp,
    totalMr,
    networks: withAp.length,
    totalOrgs: orgs.length,
    totalClients,
    byOrg: byOrgArr,
    byNetwork,
    byNetworkType: Object.entries(byNetworkType).map(([name, value]) => ({ name, value })),
    byUsage,
    byClients,
    orgs,
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

function BarOrganizations({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2a3a55" />
        <XAxis type="number" tickFormatter={formatNumber} stroke="#64748b" />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9 }} stroke="#64748b" />
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Bar dataKey="mr" name="APs (MR)" radius={[0, 6, 6, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function PieNetworkType({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={35} outerRadius={65} paddingAngle={2}>
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

function BarUsage({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2a3a55" />
        <XAxis type="number" tickFormatter={(v) => v.toFixed(1) + ' GB'} stroke="#64748b" />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 9 }} stroke="#64748b" />
        <Tooltip formatter={(v) => v.toFixed(1) + ' GB'} />
        <Bar dataKey="usage" name="Tráfego (GB)" fill="#34d399" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function BarClients({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2a3a55" />
        <XAxis type="number" tickFormatter={formatNumber} stroke="#64748b" />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 9 }} stroke="#64748b" />
        <Tooltip formatter={(v) => formatNumber(v)} />
        <Bar dataKey="clients" name="Clientes" fill="#f472b6" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function MerakiDashboard({ rows, lastUpdate }) {
  const data = useMemo(() => processRows(rows), [rows])

  return (
    <div className="dashboard">
      <div className="hero-banner">
        <div className="hero-stat meraki">
          <span className="hero-stat-value">{formatNumber(data.totalMr)}</span>
          <span className="hero-stat-label">APs Ativos</span>
        </div>
        <div className="hero-info">
          <span className="hero-info-badge">Meraki</span>
          <span className="hero-info-badge">Cisco Meraki Dashboard</span>
          <span className="hero-info-badge">{data.networks} redes com APs</span>
          <span className="hero-info-badge">{data.totalOrgs} organizações</span>
          {lastUpdate ? (
            <span className="hero-update">Atualizado em {new Date(lastUpdate).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
          ) : null}
        </div>
      </div>

      <div className="kpi-grid">
        <KPI label="APs Ativos (MR)" value={data.totalMr} icon={Radio} color="#38bdf8" />
        <KPI label="Redes com APs" value={data.networks} icon={MapPin} color="#6366f1" />
        <KPI label="Organizações" value={data.totalOrgs} icon={Wifi} color="#34d399" />
        <KPI label="Clientes conectados" value={data.totalClients} icon={Users} color="#f472b6" sub={`em ${data.byClients.length} redes com tráfego`} />
        <KPI label="Redes com tráfego" value={data.byUsage.length} icon={CheckCircle} color="#22d3ee" sub={`de ${data.networks} redes`} />
      </div>

      <div className="charts-grid">
        <ChartCard title="APs por rede" subtitle="Todas as redes com APs licenciados" className="wide">
          <BarOrganizations data={data.byNetwork} />
        </ChartCard>

        <ChartCard title="Clientes por rede" subtitle="Top redes com mais clientes conectados">
          {data.byClients.length > 0 ? (
            <BarClients data={data.byClients} />
          ) : (
            <p className="empty">Nenhum dado de clientes disponível.</p>
          )}
        </ChartCard>

        <ChartCard title="APs por organização" subtitle="Quantidade de MR por organização">
          <BarOrganizations data={data.byOrg} />
        </ChartCard>

        <ChartCard title="Tipo de rede" subtitle="Wireless vs Combined">
          <PieNetworkType data={data.byNetworkType} />
        </ChartCard>

        <ChartCard title="Tráfego por rede" subtitle="Top redes com mais utilização (GB)">
          {data.byUsage.length > 0 ? (
            <BarUsage data={data.byUsage} />
          ) : (
            <p className="empty">Nenhum dado de tráfego disponível.</p>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
