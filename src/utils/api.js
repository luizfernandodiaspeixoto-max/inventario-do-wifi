function token() {
  try {
    return sessionStorage.getItem('wifi_inventory_session') || ''
  } catch {
    return ''
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const t = token()
  if (t) headers.Authorization = `Bearer ${t}`

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
