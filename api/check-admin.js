import { json } from '../lib/http.js'
import { isAdminOfRequest } from '../lib/admin.js'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req, res) {
  const isAdmin = await isAdminOfRequest(req)
  return json(res, 200, { ok: true, isAdmin })
}
