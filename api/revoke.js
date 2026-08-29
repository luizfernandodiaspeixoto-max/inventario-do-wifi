import { removeUser } from '../lib/db.js'
import { json, readBody } from '../lib/http.js'
import { isAdminOfRequest } from '../lib/admin.js'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Método não permitido.' })
  }

  const authorized = await isAdminOfRequest(req)
  if (!authorized) {
    const secret = process.env.ADMIN_SECRET
    const headerSecret = req.headers['x-admin-secret']
    if (!secret || headerSecret !== secret) {
      return json(res, 401, { ok: false, error: 'Não autorizado.' })
    }
  }

  const body = await readBody(req)
  const { email } = body || {}
  if (!email) {
    return json(res, 400, { ok: false, error: 'Informe o email.' })
  }

  await removeUser(email)
  return json(res, 200, { ok: true, message: 'Acesso removido.' })
}
