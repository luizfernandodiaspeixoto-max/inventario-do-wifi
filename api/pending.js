import { listPending } from '../lib/db.js'
import { json } from '../lib/http.js'
import { isAdminOfRequest } from '../lib/admin.js'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req, res) {
  const authorized = await isAdminOfRequest(req)
  if (!authorized) {
    return json(res, 401, { ok: false, error: 'Não autorizado.' })
  }
  const items = await listPending()
  return json(res, 200, { ok: true, items })
}
