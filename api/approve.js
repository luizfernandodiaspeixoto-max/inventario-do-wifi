import { randomPassword } from '../lib/auth.js'
import { getApproval, removeApproval, saveUser } from '../lib/db.js'
import { sendMail, emailAvailable } from '../lib/email.js'
import { html } from '../lib/http.js'

export const config = {
  runtime: 'nodejs',
}

const SITE_URL = process.env.SITE_URL || 'https://meu-projeto.vercel.app'

function extractToken(req) {
  const url = new URL(req.url, 'http://localhost')
  return url.searchParams.get('token') || (req.query && req.query.token)
}

export default async function handler(req, res) {
  const token = extractToken(req)

  const approval = token ? await getApproval(token) : null
  if (!approval) {
    return html(res, 400, '<h2>Link inválido ou já utilizado.</h2><p>Peça novamente uma nova solicitação de acesso.</p>')
  }

  const password = randomPassword(10)

  await saveUser({
    name: approval.name,
    email: approval.email,
    password,
    approved: true,
    createdAt: Date.now(),
  })

  await removeApproval(token)

  try {
    if (!emailAvailable()) {
      return html(res, 500, '<h2>Acesso aprovado, mas o envio de email não está configurado no servidor.</h2>')
    }
    await sendMail({
      to: approval.email,
      subject: 'Seu acesso ao Inventário de Redes Wi-Fi',
      text: `Olá ${approval.name},\n\nSeu acesso foi aprovado.\n\nLogin: ${approval.email}\nSenha: ${password}\n\nAcesse: ${SITE_URL}\n\nRecomendamos trocar a senha após entrar.`,
      html: `<p>Olá <strong>${approval.name}</strong>,</p><p>Seu acesso ao <strong>Inventário de Redes Wi-Fi</strong> foi aprovado.</p><p><strong>Login:</strong> ${approval.email}<br/><strong>Senha:</strong> <code>${password}</code></p><p>Acesse: <a href="${SITE_URL}">${SITE_URL}</a></p><p style="color:#666;font-size:12px">Recomendamos trocar a senha após entrar.</p>`,
    })
  } catch (err) {
    return html(res, 500, `<h2>Acesso aprovado.</h2><p>Erro ao enviar o email da senha: ${err.message}</p>`)
  }

  return html(
    res,
    200,
    `<h2>Acesso aprovado!</h2><p>A senha foi enviada por email para <strong>${approval.email}</strong>.</p><p><a href="${SITE_URL}">Ir para o login</a></p>`
  )
}
