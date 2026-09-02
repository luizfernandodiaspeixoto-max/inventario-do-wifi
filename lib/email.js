export function emailAvailable() {
  return Boolean(process.env.EMAILJS_SERVICE_ID)
}

const DEFAULT_SUBJECT = 'Atualização da página — Inventário de Redes Wi-Fi'
const DEFAULT_TEXT = `Olá,

Informamos que a página do Inventário de Redes Wi-Fi foi atualizada.

Recomendamos que recarregue a página para visualizar as mudanças mais recentes.

Atenciosamente,
Luiz Fernando
luiz.peixoto@oi.net.br`

async function sendEmailJSTemplate({ templateId, template_params }) {
  const serviceId = process.env.EMAILJS_SERVICE_ID
  const publicKey = process.env.EMAILJS_PUBLIC_KEY
  const privateKey = process.env.EMAILJS_PRIVATE_KEY
  if (!serviceId || !templateId || !publicKey || !privateKey) {
    throw new Error('EmailJS não configurado.')
  }

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params,
    }),
  })

  const result = await res.text()
  if (!res.ok) throw new Error(`EmailJS ${res.status}: ${result}`)
  return true
}

export async function sendMail({ to, subject, text, template }) {
  const templateId = template === 'update'
    ? (process.env.EMAILJS_TEMPLATE_UPDATE || process.env.EMAILJS_TEMPLATE_ID)
    : (process.env.EMAILJS_TEMPLATE_NEWUSER || process.env.EMAILJS_TEMPLATE_ID)
  return sendEmailJSTemplate({
    templateId,
    template_params: {
      email: to,
      from_name: 'Inventário Wi-Fi',
      subject: subject || DEFAULT_SUBJECT,
      message: text || DEFAULT_TEXT,
    },
  })
}

export function defaultPageText() {
  return { subject: DEFAULT_SUBJECT, text: DEFAULT_TEXT }
}
