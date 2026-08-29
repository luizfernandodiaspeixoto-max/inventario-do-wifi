import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export const DATA_INTELBRAS = 'data/Device_Report.xlsx'
export const DATA_ARUBA = 'data/Device_Inventory_Report.csv'
export const DATA_RUCKUS = 'data/Inventario_Ruckus.csv'
export const DATA_MERAKI = 'data/Inventario_Meraki.csv'

export async function loadIntelbras() {
  const res = await fetch(DATA_INTELBRAS)
  const buf = await res.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const json = XLSX.utils.sheet_to_json(sheet)

  return json.map((r) => ({
    deviceName: r['Device Name'] || '',
    state: String(r['State'] || '').trim(),
    publicIp: r['Public IP'] || '',
    serial: r['SN'] || '',
    category: r['Category'] || '',
    model: r['Model'] || '',
    branch: r['Branch'] || '',
    site: r['Site'] || '',
    version: r['Device Version'] || '',
    uptime: r['Uptime'] || '',
    onlineDuration: r['Online Duration'] || '',
    firstAssociated: r['First Associated At'] || '',
    lastDisassociated: r['Last Disassociated At'] || '',
    mac: r['MAC'] || '',
  }))
}

export async function loadAruba() {
  const res = await fetch(DATA_ARUBA)
  const text = await res.text()

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data
          .filter((r) => ['IAP', 'AP'].includes(String(r['Device Type']).trim()))
          .filter((r) => String(r['Subscription Tier'] || '').trim() !== '')
          .map((r) => ({
            serial: r['Serial Number'] || '',
            model: r['Model'] || '',
            mac: r['Mac Address'] || '',
            type: String(r['Device Type'] || '').trim(),
            subscriptionExpiration: r['Subscription Expiration'] || '',
            subscriptionTier: String(r['Subscription Tier'] || '').trim(),
            accountName: r['Account Name'] || '',
            locationName: r['Location Name'] || '',
            ccsRegion: r['Ccs Region'] || '',
            archived: String(r['Archived']).toLowerCase() === 'true',
          }))
        resolve(rows)
      },
      error: reject,
    })
  })
}

export async function loadRuckus() {
  const res = await fetch(DATA_RUCKUS)
  const text = await res.text()

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data.map((r) => ({
          mac: r['AP MAC'] || '',
          name: r['AP Name'] || '',
          status: String(r['Status'] || '').trim(),
          ip: r['IP Address'] || '',
          trafficKb: Number(r['Total Traffic Byte (1hr) (KB)']) || 0,
          clients: Number(r['Clients']) || 0,
          model: r['Model'] || '',
          zone: r['Zone'] || '',
          firmware: r['AP Firmware'] || '',
          serial: r['Serial'] || '',
          configStatus: r['Configuration Status'] || '',
          lastSeen: r['Last Seen'] || '',
          poe: r['PoE Port'] || '',
        }))
        resolve(rows)
      },
      error: reject,
    })
  })
}

export async function loadMeraki() {
  const res = await fetch(DATA_MERAKI)
  const text = await res.text()

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data.map((r) => ({
          network: r['Network'] || '',
          organization: r['Organization'] || '',
          usage: r['Usage'] || '',
          clients: Number(r['Clients']) || 0,
          tags: r['Tags'] || '',
          networkType: r['Network Type'] || '',
          mx: Number(r['MX']) || 0,
          ms: Number(r['MS']) || 0,
          mr: Number(r['MR']) || 0,
          mv: Number(r['MV']) || 0,
          mg: Number(r['MG']) || 0,
          mt: Number(r['MT']) || 0,
        }))
        resolve(rows)
      },
      error: reject,
    })
  })
}

async function safeLoad(loader, fallback) {
  try {
    const data = await loader()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, data: fallback, error: String(err) }
  }
}

export async function loadAllData() {
  const [intelbras, aruba, ruckus, meraki] = await Promise.all([
    safeLoad(loadIntelbras, []),
    safeLoad(loadAruba, []),
    safeLoad(loadRuckus, []),
    safeLoad(loadMeraki, []),
  ])
  return {
    intelbras: intelbras.data,
    aruba: aruba.data,
    ruckus: ruckus.data,
    meraki: meraki.data,
    availability: {
      intelbras: intelbras.ok,
      aruba: aruba.ok,
      ruckus: ruckus.ok,
      meraki: meraki.ok,
    },
  }
}

export function formatNumber(n) {
  return new Intl.NumberFormat('pt-BR').format(n || 0)
}

export function expYear(dateStr) {
  const t = Date.parse(dateStr)
  if (isNaN(t)) return null
  return new Date(t).getFullYear()
}

export function parseBytesGb(usage) {
  const m = String(usage || '').match(/^([\d.,]+)\s*(GB|MB|KB|TB)/i)
  if (!m) return 0
  const val = parseFloat(m[1].replace(',', '.'))
  const unit = m[2].toUpperCase()
  if (unit === 'GB') return val
  if (unit === 'MB') return val / 1024
  if (unit === 'KB') return val / 1048576
  if (unit === 'TB') return val * 1024
  return 0
}

export function readRowsFromFile(file) {
  const name = String(file.name || '').toLowerCase()
  const isXlsx = name.endsWith('.xlsx') || name.endsWith('.xls')
  const isCsv = name.endsWith('.csv') || name.endsWith('.txt')

  if (!isXlsx && !isCsv) {
    return Promise.reject(new Error('Formato não suportado. Envie um arquivo .csv, .txt ou .xlsx/.xls.'))
  }

  const textPromise = isCsv
    ? new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsText(file, 'utf-8')
      })
    : null

  if (isXlsx) {
    return file.arrayBuffer().then((buf) => {
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      return XLSX.utils.sheet_to_json(sheet)
    })
  }

  return textPromise.then((text) => {
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => resolve(result.data),
        error: reject,
      })
    })
  })
}

export function mapRowsForVendor(vendor, rows) {
  return rows
    .filter(Boolean)
    .map((r) => {
      if (vendor === 'intelbras') {
        return {
          deviceName: r['Device Name'] || '',
          state: String(r['State'] || '').trim(),
          publicIp: r['Public IP'] || '',
          serial: r['SN'] || '',
          category: r['Category'] || '',
          model: r['Model'] || '',
          branch: r['Branch'] || '',
          site: r['Site'] || '',
          version: r['Device Version'] || '',
          uptime: r['Uptime'] || '',
          onlineDuration: r['Online Duration'] || '',
          firstAssociated: r['First Associated At'] || '',
          lastDisassociated: r['Last Disassociated At'] || '',
          mac: r['MAC'] || '',
        }
      }
      if (vendor === 'aruba') {
        if (!['IAP', 'AP'].includes(String(r['Device Type']).trim())) return null
        if (String(r['Subscription Tier'] || '').trim() === '') return null
        return {
          serial: r['Serial Number'] || '',
          model: r['Model'] || '',
          mac: r['Mac Address'] || '',
          type: String(r['Device Type'] || '').trim(),
          subscriptionExpiration: r['Subscription Expiration'] || '',
          subscriptionTier: String(r['Subscription Tier'] || '').trim(),
          accountName: r['Account Name'] || '',
          locationName: r['Location Name'] || '',
          ccsRegion: r['Ccs Region'] || '',
          archived: String(r['Archived']).toLowerCase() === 'true',
        }
      }
      if (vendor === 'ruckus') {
        return {
          mac: r['AP MAC'] || '',
          name: r['AP Name'] || '',
          status: String(r['Status'] || '').trim(),
          ip: r['IP Address'] || '',
          trafficKb: Number(r['Total Traffic Byte (1hr) (KB)']) || 0,
          clients: Number(r['Clients']) || 0,
          model: r['Model'] || '',
          zone: r['Zone'] || '',
          firmware: r['AP Firmware'] || '',
          serial: r['Serial'] || '',
          configStatus: r['Configuration Status'] || '',
          lastSeen: r['Last Seen'] || '',
          poe: r['PoE Port'] || '',
        }
      }
      if (vendor === 'meraki') {
        return {
          network: r['Network'] || '',
          organization: r['Organization'] || '',
          usage: r['Usage'] || '',
          clients: Number(r['Clients']) || 0,
          tags: r['Tags'] || '',
          networkType: r['Network Type'] || '',
          mx: Number(r['MX']) || 0,
          ms: Number(r['MS']) || 0,
          mr: Number(r['MR']) || 0,
          mv: Number(r['MV']) || 0,
          mg: Number(r['MG']) || 0,
          mt: Number(r['MT']) || 0,
        }
      }
      return null
    })
    .filter(Boolean)
}
