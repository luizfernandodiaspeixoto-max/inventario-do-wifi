import { getUser, saveUser } from '../lib/db.js'
import { randomPassword } from '../lib/auth.js'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  const secret = process.env.ADMIN_SECRET
  const auth = req.headers['authorization'] || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null

  if (!secret || token !== secret) {
    res.status(401).setHeader('Content-Type', 'application/json').end(JSON.stringify({ ok: false, error: 'Não autorizado.' }))
    return
  }

  const email = (process.env.ADMIN_EMAIL || 'luiz.peixoto@oi.net.br').toLowerCase()
  const existing = await getUser(email)

  if (existing) {
    res.status(200).setHeader('Content-Type', 'application/json').end(JSON.stringify({ ok: true, exists: true }))
    return
  }

  const password = randomPassword(10)
  await saveUser({ name: 'Luiz Fernando', email, password, approved: true, createdAt: Date.now() })

  res.status(200).setHeader('Content-Type', 'application/json').end(JSON.stringify({ ok: true, email, password }))
}
