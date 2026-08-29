import { Resend } from 'resend'

const from =
  process.env.MAIL_FROM ||
  process.env.RESEND_FROM ||
  'Inventário Wi-Fi <onboarding@resend.dev>'

export function emailAvailable() {
  return Boolean(process.env.RESEND_API_KEY)
}

function client() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendMail({ to, subject, text, html }) {
  if (!emailAvailable()) {
    throw new Error('RESEND_API_KEY não configurada no servidor.')
  }
  const { error } = await client().emails.send({ from, to, subject, text, html })
  if (error) throw new Error(`Falha ao enviar email: ${error.message}`)
  return true
}
