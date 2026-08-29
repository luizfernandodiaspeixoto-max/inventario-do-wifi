import { useState } from 'react'
import { X, Send, UserRound, AtSign, Info } from 'lucide-react'

const ADMIN_EMAIL = 'luiz.peixoto@oi.net.br'

export default function AccessRequest({ onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const subject = encodeURIComponent(`[Inventário Wi-Fi] Solicitação de acesso de ${name}`)
    const body = encodeURIComponent(
      `Olá Luiz,\n\nSolicito acesso ao dashboard de Inventário de Redes Wi-Fi.\n\nNome: ${name}\nEmail: ${email}\n\nFavor enviar a senha de acesso.\n\nObrigado.`
    )
    window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`
    setSent(true)
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

        {sent ? (
          <div className="access-sent">
            <Info size={20} />
            <p>
              Seu aplicativo de email foi aberto para enviar a solicitação ao administrador.
              Após o envio, <strong>{ADMIN_EMAIL}</strong> responderá com a senha de acesso.
            </p>
            <p className="access-sent-tip">
              Se nada abriu, envie manualmente para {ADMIN_EMAIL} informando nome e email.
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

            <div className="access-hint">
              Ao enviar, seu app de email abrirá com a solicitação pronta para{' '}
              <strong>{ADMIN_EMAIL}</strong>. O administrador responderá com a senha.
            </div>

            <button type="submit" className="login-btn">
              <Send size={16} />
              Enviar solicitação
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
