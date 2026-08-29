import { useState } from 'react'
import { Lock, ShieldCheck, User, KeyRound, HelpCircle } from 'lucide-react'
import { authenticate } from '../utils/auth'
import AccessRequest from './AccessRequest'

export default function LoginScreen() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRequest, setShowRequest] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      if (authenticate(user, pass)) {
        window.location.reload()
      } else {
        setError('Login ou senha incorretos.')
        setPass('')
        setLoading(false)
      }
    }, 350)
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-badge"><ShieldCheck size={22} /></span>
        </div>
        <h1 className="login-title">Inventário de Redes Wi-Fi</h1>
        <p className="login-subtitle">Área restrita — faça login para acessar o dashboard.</p>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Login</label>
            <div className="login-input-wrap">
              <User size={16} className="login-input-icon" />
              <input
                type="text"
                className="login-input"
                value={user}
                onChange={(e) => { setUser(e.target.value); setError('') }}
                placeholder="Usuário"
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label>Senha</label>
            <div className="login-input-wrap">
              <KeyRound size={16} className="login-input-icon" />
              <input
                type="password"
                className="login-input"
                value={pass}
                onChange={(e) => { setPass(e.target.value); setError('') }}
                placeholder="Senha"
              />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            <Lock size={16} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <button className="login-request" type="button" onClick={() => setShowRequest(true)}>
          <HelpCircle size={15} />
          Solicitar acesso
        </button>

        <p className="login-foot">
          Acesso exclusivo. Dados protegidos para uso interno.
        </p>
      </div>

      {showRequest && <AccessRequest onClose={() => setShowRequest(false)} />}
    </div>
  )
}
