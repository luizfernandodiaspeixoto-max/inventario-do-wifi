import { signSession, verifySession } from '../lib/auth.js'
import { getUser } from '../lib/db.js'
import { json, readBody } from '../lib/http.js'
import { isAdminOfRequest, ADMIN_EMAIL } from '../lib/admin.js'

export const config = { runtime: 'nodejs' }

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown'
}

function getAction(req) {
  const url = new URL(req.url, 'http://localhost')
  return url.searchParams.get('action') || (req.query && req.query.action)
}

export default async function handler(req, res) {
  const action = getAction(req)

  // GET /api/auth?action=check-admin
  if (req.method === 'GET' && action === 'check-admin') {
    const isAdmin = await isAdminOfRequest(req)
    return json(res, 200, { ok: true, isAdmin })
  }

  // POST /api/auth?action=login
  if (req.method === 'POST' && action === 'login') {
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

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const { saveSession } = await import('../lib/db.js')
    await saveSession({
      id: sessionId,
      userEmail: normalizedEmail,
      userName: user.name,
      ip: getClientIP(req),
      loginAt: Date.now(),
      logoutAt: null,
      duration: null,
    })

    return json(res, 200, { ok: true, token, name: user.name, email: user.email, sessionId })
  }

  // POST /api/auth?action=logout
  if (req.method === 'POST' && action === 'logout') {
    const body = await readBody(req)
    const { sessionId } = body || {}
    if (sessionId) {
      const now = Date.now()
      const { getSession, updateSession } = await import('../lib/db.js')
      const session = await getSession(sessionId)
      if (session) {
        await updateSession(sessionId, {
          logoutAt: now,
          duration: now - (session.loginAt || now)
        })
      }
    }
    return json(res, 200, { ok: true })
  }

  return json(res, 405, { ok: false, error: 'Método não permitido.' })
}