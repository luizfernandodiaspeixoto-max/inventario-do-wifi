import { randomPassword } from '../lib/auth.js'
import {
  getPendingById,
  removePending,
  saveUser,
  getUser,
  listUsers,
  removeUser,
} from '../lib/db.js'
import { sendMail, emailAvailable } from '../lib/email.js'
import { json, readBody } from '../lib/http.js'
import { isAdminOfRequest } from '../lib/admin.js'

export const config = { runtime: 'nodejs' }

const SITE_URL = process.env.SITE_URL || 'https://meu-projeto.vercel.app'

function getAction(req) {
  const url = new URL(req.url, 'http://localhost')
  return url.searchParams.get('action') || (req.query && req.query.action)
}

export default async function handler(req, res) {
  const authorized = await isAdminOfRequest(req)
  if (!authorized) {
    return json(res, 401, { ok: false, error: 'Não autorizado.' })
  }

  const action = getAction(req)

  // GET - list users / pending
  if (req.method === 'GET') {
    if (action === 'pending') {
      const { listPending } = await import('../lib/db.js')
      const items = await listPending()
      return json(res, 200, { ok: true, items })
    }
    if (action === 'users') {
      const items = await listUsers()
      const safe = items.map(u => ({ name: u.name, email: u.email, createdAt: u.createdAt }))
      return json(res, 200, { ok: true, items: safe })
    }
    if (action === 'visits') {
      const { getVisitCount } = await import('../lib/db.js')
      const stats = await getVisitCount()
      return json(res, 200, { ok: true, stats })
    }
    return json(res, 400, { ok: false, error: 'Ação inválida. Use ?action=pending|users|visits' })
  }

  // POST - approve, deny, create-user, send-password, revoke
  if (req.method === 'POST') {
    const body = await readBody(req)

    if (action === 'approve') {
      const id = body?.id
      const pending = id ? await getPendingById(id) : null
      if (!pending) {
        return json(res, 404, { ok: false, error: 'Pedido não encontrado ou já processado.' })
      }
      const password = randomPassword(10)
      await saveUser({ name: pending.name, email: pending.email, password, approved: true, createdAt: Date.now() })
      await removePending(id)

      if (!emailAvailable()) {
        return json(res, 200, { ok: true, needsEmail: true, message: 'Acesso aprovado, mas o envio de email não está configurado.', password, email: pending.email })
      }
      try {
        await sendMail({
          to: pending.email,
          subject: 'Seu acesso ao Inventário de Redes Wi-Fi',
          text: `Olá ${pending.name},\n\nSeu acesso foi aprovado.\n\nLogin: ${pending.email}\nSenha: ${password}\n\nAcesse: ${SITE_URL}`,
          html: `<p>Olá <strong>${pending.name}</strong>,</p><p>Seu acesso ao <strong>Inventário de Redes Wi-Fi</strong> foi aprovado.</p><p><strong>Login:</strong> ${pending.email}<br/><strong>Senha:</strong> <code>${password}</code></p><p>Acesse: <a href="${SITE_URL}">${SITE_URL}</a></p>`,
        })
        return json(res, 200, { ok: true, message: 'Acesso aprovado. A senha foi enviada por email.' })
      } catch (err) {
        return json(res, 200, { ok: true, needsEmail: true, message: 'Acesso aprovado, mas falha ao enviar email: ' + err.message, password, email: pending.email })
      }
    }

    if (action === 'deny') {
      const id = body?.id
      if (!id) return json(res, 400, { ok: false, error: 'ID obrigatório.' })
      await removePending(id)
      return json(res, 200, { ok: true, message: 'Pedido recusado.' })
    }

    if (action === 'create-user') {
      const { name, email, password: providedPassword, sendEmail } = body || {}
      const normalized = email ? String(email).toLowerCase() : null
      if (!name || !normalized) {
        return json(res, 400, { ok: false, error: 'Nome e email são obrigatórios.' })
      }
      const existing = await getUser(normalized)
      if (existing) return json(res, 409, { ok: false, error: 'Usuário já existe.' })
      const password = providedPassword && providedPassword.trim().length >= 4
        ? providedPassword.trim()
        : randomPassword(10)
      const user = { name, email: normalized, password, approved: true, createdAt: Date.now() }
      await saveUser(user)

      if (sendEmail && emailAvailable()) {
        try {
          await sendMail({
            to: normalized,
            subject: 'Acesso criado - Inventário de Redes Wi-Fi',
            text: `Olá ${name},\n\nSeu acesso foi criado.\n\nLogin: ${normalized}\nSenha: ${password}\n\nAcesse: ${SITE_URL}`,
            html: `<p>Olá <strong>${name}</strong>,</p><p>Seu acesso foi criado.</p><p><strong>Login:</strong> ${normalized}</p><p><strong>Senha:</strong> <code>${password}</code></p><p>Acesse: <a href="${SITE_URL}">${SITE_URL}</a></p>`,
          })
          return json(res, 200, { ok: true, message: 'Usuário criado e senha enviada por email.', password: null })
        } catch (err) {
          return json(res, 200, { ok: true, needsEmail: true, email: normalized, password, message: 'Usuário criado, mas falha ao enviar email: ' + err.message })
        }
      }
      return json(res, 200, { ok: true, needsEmail: !emailAvailable(), email: normalized, password, message: emailAvailable() ? 'Usuário criado.' : 'Usuário criado. Email não configurado — a senha é exibida abaixo.' })
    }

    if (action === 'send-password') {
      const { email } = body || {}
      const normalized = email ? String(email).toLowerCase() : null
      const user = normalized ? await getUser(normalized) : null
      if (!user) return json(res, 404, { ok: false, error: 'Usuário não encontrado.' })

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
        return json(res, 200, { ok: true, message: 'Nova senha enviada por email.' })
      } catch (err) {
        return json(res, 200, { ok: true, needsEmail: true, email: normalized, message: 'Falha ao enviar email: ' + err.message })
      }
    }

    if (action === 'revoke') {
      const { email } = body || {}
      const normalized = email ? String(email).toLowerCase() : null
      if (!normalized) return json(res, 400, { ok: false, error: 'Email obrigatório.' })
      await removeUser(normalized)
      return json(res, 200, { ok: true, message: 'Acesso removido.' })
    }

    // POST - send update alert (notificar usuários sobre atualização da página)
    if (action === 'send-update-alert') {
      const { emails, subject, message } = body || {}
      const list = Array.isArray(emails) ? emails.filter(Boolean) : []
      if (list.length === 0) {
        return json(res, 400, { ok: false, error: 'Selecione ao menos um usuário para notificar.' })
      }
      if (!emailAvailable()) {
        return json(res, 200, { ok: true, needsEmail: true, emails: list, message: 'Envio de email não configurado no servidor.' })
      }
      const fullSubject = subject && subject.trim() ? subject.trim() : 'Atualização da página — Inventário de Redes Wi-Fi'
      const fullMessage = message && message.trim()
        ? message.trim()
        : `Olá,\n\nInformamos que a página do Inventário de Redes Wi-Fi foi atualizada.\n\nRecomendamos que recarregue a página para visualizar as mudanças mais recentes.\n\nAtenciosamente,\nLuiz Fernando\nluiz.peixoto@oi.net.br`
      const htmlBody = (fullMessage.split('\n').map(line => `<p>${line}</p>`).join(''))
      const html = `<div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.5">${htmlBody}</div>`
      const results = []
      for (const email of list) {
        const to = String(email).toLowerCase()
        try {
          await sendMail({ to, subject: fullSubject, text: fullMessage, html, template: 'update' })
          results.push({ email: to, sent: true })
        } catch (err) {
          results.push({ email: to, sent: false, error: err.message })
        }
      }
      const errors = results.filter(r => !r.sent)
      if (errors.length === results.length) {
        return json(res, 200, { ok: true, needsEmail: true, results, message: 'Falha ao enviar os emails: ' + errors[0].error })
      }
      return json(res, 200, { ok: true, results, message: `${results.length - errors.length} email(s) de atualização enviado(s).` })
    }

    return json(res, 400, { ok: false, error: 'Ação inválida.' })
  }

  return json(res, 405, { ok: false, error: 'Método não permitido.' })
}