const ADMIN_USER = 'admin'
const ADMIN_PASS = '21wqsaxz'

const SESSION_KEY = 'wifi_inventory_auth'

export function isAuthenticated() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function authenticate(user, pass) {
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* persistência é opcional */
    }
    return true
  }
  return false
}

export function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignorar */
  }
}
