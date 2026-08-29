import { verifySession } from './auth.js'

export const ADMIN_EMAIL = () => (process.env.ADMIN_EMAIL || 'luiz.peixoto@oi.net.br').toLowerCase()

export async function isAdminOfRequest(req) {
  const auth = req.headers['authorization'] || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return false
  const payload = await verifySession(token)
  if (!payload) return false
  return String(payload.email).toLowerCase() === ADMIN_EMAIL()
}

export async function sessionEmail(req) {
  const auth = req.headers['authorization'] || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const payload = await verifySession(token)
  return payload ? String(payload.email).toLowerCase() : null
}
