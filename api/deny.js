import { removePending, getPendingById } from '../lib/db.js'
import { json, readBody } from '../lib/http.js'
import { isAdminOfRequest } from '../lib/admin.js'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Método não permitido.' })
  }

  const authorized = await isAdminOfRequest(req)
  if (!authorized) {
    return json(res, 401, { ok: false, error: 'Não autorizado.' })
  }

  const body = await readBody(req)
  const { id } = body || {}
  const pending = id ? await getPendingById(id) : null
  if (!pending) {
    return json(res, 404, { ok: false, error: 'Pedido não encontrado.' })
  }

  await removePending(id)
  return json(res, 200, { ok: true, message: 'Pedido recusado.' })
}
