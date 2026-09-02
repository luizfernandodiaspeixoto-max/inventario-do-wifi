export function emailAvailable() {
  return Boolean(process.env.EMAILJS_SERVICE_ID)
}

async function sendEmailJS({ to, subject, text }) {
  const serviceId = process.env.EMAILJS_SERVICE_ID
  const templateId = process.env.EMAILJS_TEMPLATE_ID
  const publicKey = process.env.EMAILJS_PUBLIC_KEY
  const privateKey = process.env.EMAILJS_PRIVATE_KEY
  if (!serviceId || !templateId || !publicKey || !privateKey) throw new Error('EmailJS não configurado.')

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        email: to,
        from_name: 'Inventário Wi-Fi',
        subject,
        message: text,
      },
    }),
  })

  const result = await res.text()
  if (!res.ok) throw new Error(`EmailJS ${res.status}: ${result}`)
  return true
}

export async function sendMail({ to, subject, text, html }) {
  return sendEmailJS({ to, subject, text })
}
