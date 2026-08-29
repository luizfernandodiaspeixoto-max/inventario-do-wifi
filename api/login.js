import { signSession } from '../lib/auth.js'
import { getUser } from '../lib/db.js'
import { json, readBody } from '../lib/http.js'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Método não permitido.' })
  }

  const body = await readBody(req)
  const { email, password } = body || {}
  if (!email || !password) {
    return json(res, 400, { ok: false, error: 'Informe login e senha.' })
  }

  const normalizedEmail = String(email).toLowerCase()
  const user = await getUser(normalizedEmail)

  if (!user || !user.approved || user.password !== password) {
    return json(res, 401, { ok: false, error: 'Login ou senha incorretos.' })
  }

  const token = await signSession(user.email)

  return json(res, 200, { ok: true, token, name: user.name, email: user.email })
}