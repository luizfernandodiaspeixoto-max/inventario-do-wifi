import { randomPassword } from '../lib/auth.js'
import { getPendingById, removePending, saveUser } from '../lib/db.js'
import { sendMail, emailAvailable } from '../lib/email.js'
import { json, readBody } from '../lib/http.js'
import { isAdminOfRequest } from '../lib/admin.js'

export const config = {
  runtime: 'nodejs',
}

const SITE_URL = process.env.SITE_URL || 'https://meu-projeto.vercel.app'

function extractId(req) {
  const url = new URL(req.url, 'http://localhost')
  return url.searchParams.get('id') || (req.query && req.query.id)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Método não permitido.' })
  }

  const authorized = await isAdminOfRequest(req)
  if (!authorized) {
    return json(res, 401, { ok: false, error: 'Somente o administrador pode aprovar acessos.' })
  }

  const body = await readBody(req)
  const id = body && body.id ? body.id : extractId(req)

  const pending = id ? await getPendingById(id) : null
  if (!pending) {
    return json(res, 404, { ok: false, error: 'Pedido não encontrado ou já processado.' })
  }

  const password = randomPassword(10)

  await saveUser({
    name: pending.name,
    email: pending.email,
    password,
    approved: true,
    createdAt: Date.now(),
  })

  await removePending(id)

  if (!emailAvailable()) {
    return json(res, 200, {
      ok: true,
      needsEmail: true,
      message: 'Acesso aprovado, mas o envio de email não está configurado.',
      password,
      email: pending.email,
    })
  }

  try {
    await sendMail({
      to: pending.email,
      subject: 'Seu acesso ao Inventário de Redes Wi-Fi',
      text: `Olá ${pending.name},\n\nSeu acesso foi aprovado.\n\nLogin: ${pending.email}\nSenha: ${password}\n\nAcesse: ${SITE_URL}`,
      html: `<p>Olá <strong>${pending.name}</strong>,</p><p>Seu acesso ao <strong>Inventário de Redes Wi-Fi</strong> foi aprovado.</p><p><strong>Login:</strong> ${pending.email}<br/><strong>Senha:</strong> <code>${password}</code></p><p>Acesse: <a href="${SITE_URL}">${SITE_URL}</a></p>`,
    })
  } catch (err) {
    return json(res, 200, {
      ok: true,
      needsEmail: true,
      message: 'Acesso aprovado, mas falha ao enviar email: ' + err.message,
      password,
      email: pending.email,
    })
  }

  return json(res, 200, { ok: true, message: 'Acesso aprovado. A senha foi enviada por email.' })
}
