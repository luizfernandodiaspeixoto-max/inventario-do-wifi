import { listSessions, incrementVisit, getVisitCount } from '../lib/db.js'
import { json } from '../lib/http.js'
import { isAdminOfRequest } from '../lib/admin.js'

export const config = { runtime: 'nodejs' }

function formatDuration(ms) {
  if (!ms) return '—'
  const seconds = Math.floor(ms / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}

function fmtDate(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const action = url.searchParams.get('action')

  // GET visits (public)
  if (req.method === 'GET' && action === 'visits') {
    const stats = await getVisitCount()
    return json(res, 200, { ok: true, stats })
  }

  // POST visits (increment)
  if (req.method === 'POST' && action === 'visits') {
    const stats = await incrementVisit()
    return json(res, 200, { ok: true, stats })
  }

  // Admin required for sessions
  const authorized = await isAdminOfRequest(req)
  if (!authorized) {
    return json(res, 401, { ok: false, error: 'Não autorizado.' })
  }

  // GET sessions (with optional format)
  if (req.method === 'GET' && action === 'sessions') {
    const format = url.searchParams.get('format') || 'json'
    const sessions = await listSessions()
    const formatted = sessions.map(s => ({
      name: s.userName,
      email: s.userEmail,
      ip: s.ip,
      loginAt: fmtDate(s.loginAt),
      logoutAt: fmtDate(s.logoutAt),
      duration: formatDuration(s.duration || (s.logoutAt ? s.logoutAt - s.loginAt : Date.now() - s.loginAt)),
      active: !s.logoutAt,
    }))

    if (format === 'json') {
      return json(res, 200, { ok: true, items: formatted })
    }

    if (format === 'excel') {
      const XLSX = await import('xlsx')
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(formatted.map(f => ({
        Nome: f.name,
        Email: f.email,
        IP: f.ip,
        Login: f.loginAt,
        Logout: f.logoutAt,
        'Tempo logado': f.duration,
        Status: f.active ? 'Ativo' : 'Finalizado',
      })))
      XLSX.utils.book_append_sheet(wb, ws, 'Sessões')
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="sessoes-${new Date().toISOString().slice(0,10)}.xlsx"`)
      return res.end(buf)
    }

    if (format === 'pdf') {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('Relatório de Sessões - Inventário de Redes Wi-Fi', 14, 20)
      doc.setFontSize(10)
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28)
      
      let y = 38
      doc.setFontSize(9)
      formatted.forEach((s, i) => {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        doc.text(`${i + 1}. ${s.name} (${s.email})`, 14, y)
        y += 5
        doc.text(`   IP: ${s.ip} | Login: ${s.loginAt} | Logout: ${s.logoutAt} | Tempo: ${s.duration} | ${s.active ? 'Ativo' : 'Finalizado'}`, 14, y)
        y += 7
      })
      
      const pdfBuf = doc.output('arraybuffer')
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="sessoes-${new Date().toISOString().slice(0,10)}.pdf"`)
      return res.end(Buffer.from(pdfBuf))
    }

    return json(res, 400, { ok: false, error: 'Formato inválido. Use json, excel ou pdf.' })
  }

  return json(res, 405, { ok: false, error: 'Método não permitido.' })
}