import { incrementVisit, getVisitCount } from '../lib/db.js'
import { json } from '../lib/http.js'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const stats = await incrementVisit()
    return json(res, 200, { ok: true, stats })
  }
  if (req.method === 'GET') {
    const stats = await getVisitCount()
    return json(res, 200, { ok: true, stats })
  }
  return json(res, 405, { ok: false, error: 'Método não permitido.' })
}