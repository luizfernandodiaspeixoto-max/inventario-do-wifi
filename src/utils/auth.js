const SESSION_KEY = 'wifi_inventory_session'
const PROFILE_KEY = 'wifi_inventory_profile'

export function isAuthenticated() {
  try {
    return Boolean(sessionStorage.getItem(SESSION_KEY))
  } catch {
    return false
  }
}

export async function login(email, password) {
  const res = await fetch('api/login', {
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

export function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(PROFILE_KEY)
  } catch {
    /* ignorar */
  }
}