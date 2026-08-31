import { useEffect, useState } from 'react'
import { Layers, Mail, CalendarDays, UploadCloud, LogOut, ShieldCheck } from 'lucide-react'
import IntelbrasDashboard from './components/IntelbrasDashboard'
import ArubaDashboard from './components/ArubaDashboard'
import RuckusDashboard from './components/RuckusDashboard'
import MerakiDashboard from './components/MerakiDashboard'
import UploadPanel from './components/UploadPanel'
import LoginScreen from './components/LoginScreen'
import AdminPanel from './components/AdminPanel'
import { loadAllData, formatNumber } from './utils/dataLoader'
import { isAuthenticated, logout, getProfile } from './utils/auth'
import { api } from './utils/api'
import './App.css'

const TABS = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'intelbras', label: 'Intelbras' },
  { id: 'aruba', label: 'Aruba' },
  { id: 'ruckus', label: 'Ruckus' },
  { id: 'meraki', label: 'Meraki' },
  { id: 'admin', label: 'Administração', adminOnly: true },
]

function Overview({ intelbras, aruba, ruckus, meraki, handleSelect }) {
  const activeIntel = intelbras.filter((r) => r.state === 'ONLINE').length
  const totalIntel = intelbras.length
  const activeRuckus = ruckus.filter((r) => r.status === 'Online').length
  const totalRuckus = ruckus.length
  const totalMeraki = meraki.reduce((s, r) => s + r.mr, 0)
  const networksMeraki = meraki.filter((r) => r.mr > 0).length

  return (
    <div className="overview">
      <div className="overview-grid">
        <button className="vendor-card intelbras" onClick={() => handleSelect('intelbras')}>
          <div className="vendor-head">
            <span className="vendor-logo">Wi-Fi</span>
            <span className="vendor-name">Intelbras</span>
          </div>
          <div className="vendor-active">
            <span className="vendor-active-value">{formatNumber(activeIntel)}</span>
            <span className="vendor-active-label">APs Ativos</span>
          </div>
          <div className="vendor-meta">
            <span>{formatNumber(totalIntel)} APs no total</span>
            <span className="vendor-link">Ver detalhes →</span>
          </div>
        </button>

        <button className="vendor-card aruba" onClick={() => handleSelect('aruba')}>
          <div className="vendor-head">
            <span className="vendor-logo">HPE</span>
            <span className="vendor-name">Aruba</span>
          </div>
          <div className="vendor-active">
            <span className="vendor-active-value">{formatNumber(aruba.length)}</span>
            <span className="vendor-active-label">APs Licenciados</span>
          </div>
          <div className="vendor-meta">
            <span>{formatNumber(aruba.length)} APs com licença</span>
            <span className="vendor-link">Ver detalhes →</span>
          </div>
        </button>

        <button className="vendor-card ruckus" onClick={() => handleSelect('ruckus')}>
          <div className="vendor-head">
            <span className="vendor-logo">RX</span>
            <span className="vendor-name">Ruckus</span>
          </div>
          <div className="vendor-active">
            <span className="vendor-active-value">{formatNumber(activeRuckus)}</span>
            <span className="vendor-active-label">APs Ativos</span>
          </div>
          <div className="vendor-meta">
            <span>{formatNumber(totalRuckus)} APs no total</span>
            <span className="vendor-link">Ver detalhes →</span>
          </div>
        </button>

        <button className="vendor-card meraki" onClick={() => handleSelect('meraki')}>
          <div className="vendor-head">
            <span className="vendor-logo">MR</span>
            <span className="vendor-name">Meraki</span>
          </div>
          <div className="vendor-active">
            <span className="vendor-active-value">{formatNumber(totalMeraki)}</span>
            <span className="vendor-active-label">APs Ativos</span>
          </div>
          <div className="vendor-meta">
            <span>{formatNumber(networksMeraki)} redes com APs</span>
            <span className="vendor-link">Ver detalhes →</span>
          </div>
        </button>
      </div>

      <p className="overview-hint">
        Clique em um fabricante para ver os detalhes, ou use as abas acima.
      </p>
    </div>
  )
}

function App() {
  const [authed, setAuthed] = useState(() => isAuthenticated())
  const [base, setBase] = useState({ status: 'loading', intelbras: [], aruba: [], ruckus: [], meraki: [], error: null, availability: {} })
  const [tab, setTab] = useState('overview')
  const [custom, setCustom] = useState({})
  const [showUpload, setShowUpload] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRefreshKey, setAdminRefreshKey] = useState(0)
  const profile = getProfile()

  function handleLogout() {
    logout()
    setAuthed(false)
  }

  useEffect(() => {
    let active = true
    loadAllData()
      .then(({ intelbras, aruba, ruckus, meraki, availability }) => {
        if (!active) return
        setBase({ status: 'ready', intelbras, aruba, ruckus, meraki, error: null, availability })
      })
      .catch((err) => {
        if (!active) return
        setBase({ status: 'error', intelbras: [], aruba: [], ruckus: [], meraki: [], error: String(err), availability: {} })
      })
    api('auth', { params: { action: 'check-admin' } })
      .then((d) => { if (active) setIsAdmin(Boolean(d.isAdmin)) })
      .catch(() => { if (active) setIsAdmin(false) })
    api('auth', { method: 'POST', params: { action: 'visits' } }).catch(() => {})
    return () => { active = false }
  }, [])

  if (!authed) {
    return <LoginScreen />
  }

  const tabs = [...TABS]

  const state = {
    ...base,
    intelbras: custom.intelbras || base.intelbras,
    aruba: custom.aruba || base.aruba,
    ruckus: custom.ruckus || base.ruckus,
    meraki: custom.meraki || base.meraki,
  }

  function handleUpload(vendor, rows) {
    setCustom((prev) => ({ ...prev, [vendor]: rows }))
  }

  const lastUpdateIntel = new Date(2026, 7, 29, 7, 27, 24)
  const lastUpdateRuckus = new Date(2026, 7, 28, 21, 21)
  const lastUpdateGlobal = new Date(2026, 7, 29)

  return (
    <div className={`app-shell ${tab === 'overview' ? 'shell-overview' : 'shell-dash'}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">
            <img src={`${import.meta.env.BASE_URL}logo-wifi.svg`} alt="Logo Wi-Fi" className="brand-img" />
          </div>
          <div>
            <h1>Inventário de Redes Wi-Fi</h1>
            <p>Intelbras + Aruba + Ruckus + Meraki</p>
          </div>
        </div>
        <div className="header-actions">
          {Object.keys(custom).length > 0 && (
            <span className="custom-badge" title="Dados carregados nesta sessão">
              {Object.keys(custom).length} atualizado(s)
            </span>
          )}
          <div className="link-badge update">
            <CalendarDays size={14} />
            <span>Última atualização</span>
            <code>{lastUpdateGlobal.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</code>
          </div>
          <button className="upload-btn header" onClick={() => setShowUpload(true)}>
            <UploadCloud size={15} />
            Atualizar dados
          </button>
          {profile && profile.name && (
            <span className="user-chip" title={`${profile.name} <${profile.email || ''}>`}>
              {profile.name}
            </span>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Sair">
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </header>

      <main className="container">
        {tab === 'overview' && (
          <section className="page-intro">
            <h2>Monitoramento de Access Points</h2>
            <p>
              Inventário consolidado dos pontos de acesso das redes Intelbras, Aruba, Ruckus e Meraki, com
              separação clara por fabricante.
            </p>
          </section>
        )}

        <nav className="tabs">
          {tabs.map((t) => {
            if (t.adminOnly && !isAdmin) return null
            return (
              <button
                key={t.id}
                className={`tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <Layers size={15} />
                {t.label}
              </button>
            )
          })}
        </nav>

        {state.status === 'loading' && (
          <div className="center-state">
            <div className="spinner" />
            <p>Carregando dados do inventário...</p>
          </div>
        )}

        {state.status === 'error' && (
          <div className="center-state">
            <div className="error-box">
              <p>Não foi possível carregar os dados.</p>
              <p style={{ wordBreak: 'break-all' }}>{state.error}</p>
            </div>
          </div>
        )}

        {tab === 'admin' && isAdmin && (
          <AdminPanel refreshKey={adminRefreshKey} onRefresh={() => setAdminRefreshKey((k) => k + 1)} />
        )}

        {state.status === 'ready' && tab !== 'admin' && (
          <>
            {tab === 'overview' && (
              <Overview
                intelbras={state.intelbras}
                aruba={state.aruba}
                ruckus={state.ruckus}
                meraki={state.meraki}
                handleSelect={setTab}
              />
            )}
            {tab === 'intelbras' && (
              <IntelbrasDashboard rows={state.intelbras} lastUpdate={lastUpdateIntel} />
            )}
            {tab === 'aruba' && (
              state.aruba.length > 0 ? (
                <ArubaDashboard rows={state.aruba} lastUpdate={lastUpdateIntel} />
              ) : (
                <div className="center-state">
                  <p>Arquivo do Aruba não encontrado. Envie o arquivo para a pasta <code>public/data/Device_Inventory_Report.csv</code></p>
                </div>
              )
            )}
            {tab === 'ruckus' && (
              <RuckusDashboard rows={state.ruckus} lastUpdate={lastUpdateRuckus} />
            )}
            {tab === 'meraki' && (
              <MerakiDashboard rows={state.meraki} lastUpdate={lastUpdateRuckus} />
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <div className="footer-info">
          <span className="footer-label">Criado por</span>
          <span className="footer-name">Luiz Fernando</span>
          <a className="footer-email" href="mailto:luiz.peixoto@oi.net.br">luiz.peixoto@oi.net.br</a>
        </div>
        <div className="footer-actions">
          <a className="contact-btn" href="mailto:luiz.peixoto@oi.net.br">
            <Mail size={16} /> Enviar e-mail
          </a>
        </div>
      </footer>

      {showUpload && (
        <UploadPanel
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  )
}

export default App
