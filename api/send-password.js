import { randomPassword } from '../lib/auth.js'
import { getUser, saveUser } from '../lib/db.js'
import { sendMail, emailAvailable } from '../lib/email.js'
import { json, readBody } from '../lib/http.js'
import { isAdminOfRequest } from '../lib/admin.js'

export const config = {
  runtime: 'nodejs',
}

const SITE_URL = process.env.SITE_URL || 'https://meu-projeto.vercel.app'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Método não permitido.' })
  }

  const authorized = await isAdminOfRequest(req)
  if (!authorized) {
    return json(res, 401, { ok: false, error: 'Não autorizado.' })
  }

  const body = await readBody(req)
  const { email } = body || {}
  const normalized = email ? String(email).toLowerCase() : null

  const user = normalized ? await getUser(normalized) : null
  if (!user) {
    return json(res, 404, { ok: false, error: 'Usuário não encontrado.' })
  }

  if (!emailAvailable()) {
    return json(res, 200, { ok: true, needsEmail: true, email: normalized, message: 'Envio de email não configurado.' })
  }

  const newPassword = randomPassword(10)
  user.password = newPassword
  await saveUser(user)

  try {
    await sendMail({
      to: normalized,
      subject: 'Nova senha de acesso - Inventário de Redes Wi-Fi',
      text: `Olá ${user.name},\n\nSua nova senha de acesso é:\nSenha: ${newPassword}\n\nLogin: ${normalized}\nAcesse: ${SITE_URL}`,
      html: `<p>Olá <strong>${user.name}</strong>,</p><p>Sua nova senha de acesso é:</p><p><strong>Senha:</strong> <code>${newPassword}</code></p><p><strong>Login:</strong> ${normalized}</p><p>Acesse: <a href="${SITE_URL}">${SITE_URL}</a></p>`,
    })
  } catch (err) {
    return json(res, 200, { ok: true, needsEmail: true, email: normalized, message: 'Falha ao enviar email: ' + err.message })
  }

  return json(res, 200, { ok: true, message: 'Nova senha enviada por email.' })
}
