import { removeUser } from '../lib/db.js'
import { json, readBody } from '../lib/http.js'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req, res) {
  const secret = process.env.ADMIN_SECRET
  const auth = req.headers['x-admin-secret']

  if (!secret || auth !== secret) {
    return json(res, 401, { ok: false, error: 'Não autorizado.' })
  }

  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Método não permitido.' })
  }

  const body = await readBody(req)
  const { email } = body || {}
  if (!email) {
    return json(res, 400, { ok: false, error: 'Informe o email.' })
  }

  await removeUser(email)
  return json(res, 200, { ok: true, message: 'Acesso removido.' })
}
