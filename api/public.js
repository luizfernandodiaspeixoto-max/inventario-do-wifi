import { randomPassword } from '../lib/auth.js'
import { savePending, getUser } from '../lib/db.js'
import { json, readBody } from '../lib/http.js'

export const config = { runtime: 'nodejs' }

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

    return json(res, 200, { ok: true, message: 'Solicitação enviada. Aguarde a aprovação do administrador.' })
  }

  return json(res, 405, { ok: false, error: 'Método não permitido.' })
}