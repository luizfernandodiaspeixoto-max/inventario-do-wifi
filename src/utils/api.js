function token() {
  try {
    return sessionStorage.getItem('wifi_inventory_session') || ''
  } catch {
    return ''
  }
}

function apiPath(action, params = {}) {
  const base = '/api'
  const sp = new URLSearchParams(params)
  return `${base}/${action}?${sp.toString()}`
}

export async function api(action, { method = 'GET', body, params } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const t = token()
  if (t) headers.Authorization = `Bearer ${t}`

  let path
  if (params) {
    path = apiPath(action, params)
  } else {
    path = action.startsWith('/') ? action : `/api/${action}`
  }

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || 'Erro na requisição.')
  }
  return data
}
