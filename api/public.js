import { randomPassword } from '../lib/auth.js'
import { savePending, getUser } from '../lib/db.js'
import { sendMail, emailAvailable } from '../lib/email.js'
import { json, readBody } from '../lib/http.js'

export const config = { runtime: 'nodejs' }

const SITE_URL = process.env.SITE_URL || 'https://inventariodowifi.vercel.app'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'luiz.peixoto@oi.net.br'

function getAction(req) {
  const url = new URL(req.url, 'http://localhost')
  return url.searchParams.get('action') || (req.query && req.query.action)
}

export default async function handler(req, res) {
  const action = getAction(req)

  // POST /api/public?action=request-access
  if (req.method === 'POST' && action === 'request-access') {
    const body = await readBody(req)
    const { name, email } = body || {}

    if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json(res, 400, { ok: false, error: 'Informe um nome e um email válidos.' })
    }

    const normalizedEmail = String(email).toLowerCase()

    const existing = await getUser(normalizedEmail)
    if (existing) {
      return json(res, 200, { ok: true, message: 'Já existe uma conta para este email. Use a senha que você recebeu ou solicite uma nova.' })
    }

    const id = randomPassword(20)
    await savePending(id, {
      name,
      email: normalizedEmail,
      createdAt: Date.now(),
    })

    if (emailAvailable()) {
      try {
        await sendMail({
          to: ADMIN_EMAIL,
          subject: `Nova solicitação de acesso - ${name}`,
          text: `Você recebeu uma nova solicitação de acesso ao Inventário de Redes Wi-Fi.\n\nSolicitante: ${name}\nEmail: ${normalizedEmail}\n\nEntre no painel de administração para aprovar ou recusar:\n${SITE_URL}`,
          html: `<p><strong>Nova solicitação de acesso</strong></p><p>Você recebeu uma nova solicitação de acesso ao <strong>Inventário de Redes Wi-Fi</strong>.</p><p><strong>Solicitante:</strong> ${name}<br/><strong>Email:</strong> <a href="mailto:${normalizedEmail}">${normalizedEmail}</a></p><p>Entre no <strong>painel de administração</strong> para aprovar ou recusar:</p><p><a href="${SITE_URL}">${SITE_URL}</a></p>`,
        })
      } catch (err) {
        console.error('Falha ao notificar admin do novo pedido de acesso:', err.message)
      }
    }

    return json(res, 200, { ok: true, message: 'Solicitação enviada. Aguarde a aprovação do administrador.' })
  }

  return json(res, 405, { ok: false, error: 'Método não permitido.' })
}