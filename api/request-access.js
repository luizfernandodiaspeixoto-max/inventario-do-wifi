import { randomPassword } from '../lib/auth.js'
import { saveApproval, getUser } from '../lib/db.js'
import { sendMail, emailAvailable } from '../lib/email.js'
import { json, readBody } from '../lib/http.js'

export const config = {
  runtime: 'nodejs',
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'luiz.peixoto@oi.net.br'
const SITE_URL = process.env.SITE_URL || 'https://meu-projeto.vercel.app'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Método não permitido.' })
  }

  const body = await readBody(req)
  const { name, email } = body || {}

  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json(res, 400, { ok: false, error: 'Informe um nome e um email válidos.' })
  }

  const normalizedEmail = String(email).toLowerCase()

  const existing = await getUser(normalizedEmail)
  if (existing && existing.approved) {
    return json(res, 200, { ok: true, message: 'Este email já está cadastrado. Use a senha enviada por email.' })
  }

  const token = randomPassword(32)
  const approval = { name, email: normalizedEmail, createdAt: Date.now() }
  await saveApproval(token, approval)

  const approveUrl = `${SITE_URL}/api/approve?token=${token}`

  try {
    if (!emailAvailable()) {
      return json(res, 503, { ok: false, error: 'Envio de email não configurado no servidor.' })
    }
    await sendMail({
      to: ADMIN_EMAIL,
      subject: `Nova solicitação de acesso: ${name}`,
      text: `${name} (${normalizedEmail}) solicitou acesso ao Inventário de Redes Wi-Fi.\n\nPara aprovar e enviar a senha automaticamente, clique no link:\n${approveUrl}\n\nSe não reconhecer esta pessoa, ignore este email.`,
      html: `<p><strong>${name}</strong> (${normalizedEmail}) solicitou acesso ao <strong>Inventário de Redes Wi-Fi</strong>.</p><p>Para aprovar e enviar a senha automaticamente para o solicitante, clique:</p><p><a href="${approveUrl}" style="display:inline-block;padding:10px 18px;background:#38bdf8;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Aprovar acesso</a></p><p style="color:#666;font-size:12px">Se não reconhecer esta pessoa, ignore este email.</p>`,
    })
  } catch (err) {
    return json(res, 500, { ok: false, error: err.message })
  }

  return json(res, 200, { ok: true, message: 'Solicitação enviada. Você receberá a senha após a aprovação.' })
}
