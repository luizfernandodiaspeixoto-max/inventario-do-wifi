const SESSION_KEY = 'wifi_inventory_session'
const PROFILE_KEY = 'wifi_inventory_profile'
const SESSION_ID_KEY = 'wifi_inventory_session_id'

export function isAuthenticated() {
  try {
    return Boolean(sessionStorage.getItem(SESSION_KEY))
  } catch {
    return false
  }
}

export async function login(email, password) {
  const res = await fetch('api/auth?action=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Não foi possível entrar.')
  }
  try {
    sessionStorage.setItem(SESSION_KEY, data.token)
    sessionStorage.setItem(PROFILE_KEY, JSON.stringify({ name: data.name, email: data.email }))
    if (data.sessionId) {
      sessionStorage.setItem(SESSION_ID_KEY, data.sessionId)
    }
  } catch {
    /* persistência é opcional */
  }
  return data
}

export function getProfile() {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getSessionId() {
  try {
    return sessionStorage.getItem(SESSION_ID_KEY)
  } catch {
    return null
  }
}

export async function logout() {
  const sessionId = getSessionId()
  if (sessionId) {
    try {
      await fetch('api/auth?action=logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
        keepalive: true,
      })
    } catch {
      /* ignora erro de logout no servidor */
    }
  }
  try {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(PROFILE_KEY)
    sessionStorage.removeItem(SESSION_ID_KEY)
  } catch {
    /* ignorar */
  }
}