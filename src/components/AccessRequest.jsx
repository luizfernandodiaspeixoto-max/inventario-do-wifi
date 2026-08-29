import { useState } from 'react'
import { X, Send, UserRound, AtSign, Info } from 'lucide-react'

export default function AccessRequest({ onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Não foi possível enviar a solicitação.')
      }
      setStatus({ type: 'ok', message: data.message })
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="access-overlay" onClick={onClose}>
      <div className="access-panel" onClick={(e) => e.stopPropagation()}>
        <div className="access-head">
          <div>
            <h3>Solicitar acesso</h3>
            <p>Preencha seus dados. O pedido será enviado ao administrador.</p>
          </div>
          <button className="access-close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {status && status.type === 'ok' ? (
          <div className="access-sent">
            <Info size={20} />
            <p>{status.message}</p>
            <p className="access-sent-tip">
              Aguarde o administrador aprovar. Você receberá a senha por email.
            </p>
            <button className="login-btn" type="button" onClick={onClose}>
              Voltar para o login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="access-field">
              <label>Seu nome</label>
              <div className="login-input-wrap">
                <UserRound size={16} className="login-input-icon" />
                <input
                  type="text"
                  className="login-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="access-field">
              <label>Seu email</label>
              <div className="login-input-wrap">
                <AtSign size={16} className="login-input-icon" />
                <input
                  type="email"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  required
                />
              </div>
            </div>

            {status && status.type === 'error' && (
              <div className="login-error">{status.message}</div>
            )}

            <div className="access-hint">
              Ao enviar, o administrador receberá o pedido e enviará a senha de acesso por email.
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              <Send size={16} />
              {loading ? 'Enviando...' : 'Enviar solicitação'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}