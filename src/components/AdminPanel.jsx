import { useState, useEffect, useCallback } from 'react'
import {
  ShieldCheck, Clock, Users, CheckCircle, XCircle,
  Mail, KeyRound, Trash2, Eye, EyeOff, Loader, BarChart3, MousePointerClick,
} from 'lucide-react'
import { api } from '../utils/api'
import { formatNumber } from '../utils/dataLoader'

function fmtDate(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

function ActionBtn({ onClick, loading, color, icon: Icon, label, disabled }) {
  return (
    <button
      className={`admin-action ${color}`}
      onClick={onClick}
      disabled={loading || disabled}
      title={label}
    >
      {loading ? <Loader size={14} className="spin" /> : <Icon size={14} />}
      <span>{loading ? '...' : label}</span>
    </button>
  )
}

function PasswordModal({ password, email, message, onClose }) {
  const [show, setShow] = useState(false)
  return (
    <div className="admin-modal" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>
          {password ? (
            <>
              <KeyRound size={18} /> Senha gerada
            </>
          ) : (
            <>
              <Mail size={18} /> Informação
            </>
          )}
        </h3>
        {password && (
          <>
            <p>Login: <code>{email}</code></p>
            <div className="admin-password-box">
              {show ? <span className="admin-password">{password}</span> : <span className="admin-password masked">••••••••••</span>}
              <button className="admin-action ghost" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
                {show ? 'Ocultar' : 'Ver'}
              </button>
            </div>
            <p className="admin-modal-hint">
              Copie esta senha e envie para o usuário. O email não está configurado — o sistema não conseguiu enviar automaticamente.
            </p>
          </>
        )}
        {message && !password && <p>{message}</p>}
        <button className="login-btn" onClick={onClose}>Fechar</button>
      </div>
    </div>
  )
}

function PendingList({ onRefresh }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [actions, setActions] = useState({})
  const [msg, setMsg] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api('api/pending')
      setItems(data.items || [])
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleApprove(item) {
    setActions((p) => ({ ...p, [item.id + 'a']: true }))
    setMsg(null)
    try {
      const res = await api('api/approve', { method: 'POST', body: { id: item.id } })
      if (res.needsEmail) {
        setMsg({ type: 'pwd', password: res.password, email: res.email, text: res.message })
      } else {
        setMsg({ type: 'ok', text: res.message })
      }
      load()
      onRefresh()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setActions((p) => ({ ...p, [item.id + 'a']: false }))
    }
  }

  async function handleDeny(item) {
    setActions((p) => ({ ...p, [item.id + 'd']: true }))
    setMsg(null)
    try {
      await api('api/deny', { method: 'POST', body: { id: item.id } })
      load()
      onRefresh()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setActions((p) => ({ ...p, [item.id + 'd']: false }))
    }
  }

  if (loading) return <div className="admin-empty"><Loader size={18} className="spin" /> Carregando pedidos...</div>
  if (items.length === 0) return <div className="admin-empty"><CheckCircle size={18} /> Nenhum pedido pendente.</div>

  return (
    <>
      {msg && msg.type === 'pwd' && <PasswordModal password={msg.password} email={msg.email} message={msg.text} onClose={() => setMsg(null)} />}
      {msg && msg.type === 'ok' && <div className="admin-msg ok">{msg.text}</div>}
      {msg && msg.type === 'error' && <div className="admin-msg error">{msg.text}</div>}
      <div className="admin-list">
        {items.map((p) => (
          <div className="admin-card pending" key={p.id}>
            <div className="admin-card-head">
              <div className="admin-card-info">
                <span className="admin-card-name">{p.name}</span>
                <span className="admin-card-email">{p.email}</span>
              </div>
              <span className="admin-card-date">{fmtDate(p.createdAt)}</span>
            </div>
            <div className="admin-card-actions">
              <ActionBtn icon={CheckCircle} label="Aprovar" color="green" loading={actions[p.id + 'a']} onClick={() => handleApprove(p)} />
              <ActionBtn icon={XCircle} label="Recusar" color="red" loading={actions[p.id + 'd']} onClick={() => handleDeny(p)} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function UsersList({ onRefresh }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [actions, setActions] = useState({})
  const [msg, setMsg] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api('api/list-users')
      setItems(data.items || [])
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSendPassword(user) {
    setActions((p) => ({ ...p, [user.email + 'p']: true }))
    setMsg(null)
    try {
      const res = await api('api/send-password', { method: 'POST', body: { email: user.email } })
      if (res.needsEmail) {
        setMsg({ type: 'pwd', password: null, email: res.email, text: res.message })
      } else {
        setMsg({ type: 'ok', text: res.message })
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setActions((p) => ({ ...p, [user.email + 'p']: false }))
    }
  }

  async function handleRevoke(user) {
    setActions((p) => ({ ...p, [user.email + 'r']: true }))
    setMsg(null)
    try {
      await api('api/revoke', { method: 'POST', body: { email: user.email } })
      load()
      onRefresh()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setActions((p) => ({ ...p, [user.email + 'r']: false }))
    }
  }

  if (loading) return <div className="admin-empty"><Loader size={18} className="spin" /> Carregando usuários...</div>
  if (items.length === 0) return <div className="admin-empty"><Users size={18} /> Nenhum usuário aprovado.</div>

  return (
    <>
      {msg && msg.type === 'ok' && <div className="admin-msg ok">{msg.text}</div>}
      {msg && msg.type === 'error' && <div className="admin-msg error">{msg.text}</div>}
      <div className="admin-list">
        {items.map((u) => (
          <div className="admin-card user" key={u.email}>
            <div className="admin-card-head">
              <div className="admin-card-info">
                <span className="admin-card-name">{u.name}</span>
                <span className="admin-card-email">{u.email}</span>
              </div>
              <span className="admin-card-date">{fmtDate(u.createdAt)}</span>
            </div>
            <div className="admin-card-actions">
              <ActionBtn icon={KeyRound} label="Nova senha" color="amber" loading={actions[u.email + 'p']} onClick={() => handleSendPassword(u)} />
              <ActionBtn icon={Trash2} label="Remover" color="red" loading={actions[u.email + 'r']} onClick={() => handleRevoke(u)} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function VisitsCard() {
  const [stats, setStats] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await api('api/visits')
      setStats(data.stats)
    } catch {
      /* ignora */
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="admin-visits">
      <div className="admin-visits-card">
        <MousePointerClick size={22} />
        <div>
          <span className="admin-visits-value">{stats ? formatNumber(stats.total) : '—'}</span>
          <span className="admin-visits-label">visitas totais</span>
        </div>
      </div>
      <div className="admin-visits-card">
        <BarChart3 size={22} />
        <div>
          <span className="admin-visits-value">{stats ? formatNumber(stats.daily) : '—'}</span>
          <span className="admin-visits-label">visitas hoje</span>
        </div>
      </div>
    </div>
  )
}

export default function AdminPanel({ refreshKey, onRefresh }) {
  const [tab, setTab] = useState('pending')

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2><ShieldCheck size={20} /> Administração</h2>
        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
            <Clock size={15} /> Pedidos pendentes
          </button>
          <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            <Users size={15} /> Usuários aprovados
          </button>
        </div>
      </div>
      <VisitsCard key={'visits-' + refreshKey} />
      <div className="admin-body">
        {tab === 'pending' && <PendingList onRefresh={onRefresh} key={'pending-' + refreshKey} />}
        {tab === 'users' && <UsersList onRefresh={onRefresh} key={'users-' + refreshKey} />}
      </div>
    </div>
  )
}
