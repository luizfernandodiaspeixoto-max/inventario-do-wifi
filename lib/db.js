import { Redis } from '@upstash/redis'

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

let redis = null
if (url && token) {
  try {
    redis = new Redis({ url, token })
  } catch {
    redis = null
  }
}

const memoryStore = new Map()

const USER_PREFIX = 'wifi_inventory_user::'
const PENDING_PREFIX = 'wifi_inventory_pending::'
const PENDING_LIST = 'wifi_inventory_pending_ids'
const USER_LIST = 'wifi_inventory_user_ids'
const SESSION_PREFIX = 'wifi_inventory_session::'
const SESSION_LIST = 'wifi_inventory_session_ids'

async function getRaw(key) {
  if (redis) {
    try {
      return await redis.get(key)
    } catch {
      return undefined
    }
  }
  return memoryStore.get(key)
}

async function setRaw(key, value) {
  if (redis) {
    try {
      await redis.set(key, value)
      return
    } catch {
      /* fallback nao faz nada */
    }
  }
  memoryStore.set(key, value)
}

async function delRaw(key) {
  if (redis) {
    try {
      await redis.del(key)
      return
    } catch {
      /* ignorar */
    }
  }
  memoryStore.delete(key)
}

async function listGet(key) {
  const raw = await getRaw(key)
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function listAdd(key, item) {
  const list = await listGet(key)
  if (!list.includes(item)) {
    list.push(item)
    await setRaw(key, JSON.stringify(list))
  }
}

async function listRemove(key, item) {
  const list = await listGet(key)
  const idx = list.indexOf(item)
  if (idx >= 0) {
    list.splice(idx, 1)
    await setRaw(key, JSON.stringify(list))
  }
}

function parse(raw) {
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}

/* ---------- Usuários aprovados ---------- */

const userKey = (email) => `${USER_PREFIX}${String(email).toLowerCase()}`

export async function getUser(email) {
  if (!email) return null
  return parse(await getRaw(userKey(email)))
}

export async function saveUser(user) {
  user.email = String(user.email).toLowerCase()
  await setRaw(userKey(user.email), JSON.stringify(user))
  await listAdd(USER_LIST, user.email)
}

export async function removeUser(email) {
  const norm = String(email).toLowerCase()
  await delRaw(userKey(norm))
  await listRemove(USER_LIST, norm)
}

export async function listUsers() {
  const ids = await listGet(USER_LIST)
  const out = []
  for (const id of ids) {
    const u = parse(await getRaw(userKey(id)))
    if (u) out.push(u)
  }
  return out
}

/* ---------- Pedidos pendentes ---------- */

const pendingKey = (id) => `${PENDING_PREFIX}${id}`

export async function savePending(id, data) {
  await setRaw(pendingKey(id), JSON.stringify({ id, ...data }))
  await listAdd(PENDING_LIST, id)
}

export async function getPendingById(id) {
  return parse(await getRaw(pendingKey(id)))
}

export async function getPendingByEmail(email) {
  const ids = await listGet(PENDING_LIST)
  for (const id of ids) {
    const p = parse(await getRaw(pendingKey(id)))
    if (p && p.email === String(email).toLowerCase()) return p
  }
  return null
}

export async function removePending(id) {
  await delRaw(pendingKey(id))
  await listRemove(PENDING_LIST, id)
}

export async function listPending() {
  const ids = await listGet(PENDING_LIST)
  const out = []
  for (const id of ids) {
    const p = parse(await getRaw(pendingKey(id)))
    if (p) out.push(p)
  }
  out.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
  return out
}

export const hasStore = Boolean(redis)

/* ---------- Visitas ---------- */

const VISITS_TOTAL = 'wifi_visits_total'
const VISITS_DAILY = 'wifi_visits_daily::'

export function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function getVisitCount() {
  const totalRaw = await getRaw(VISITS_TOTAL)
  const total = typeof totalRaw === 'number' ? totalRaw : parseInt(totalRaw || '0', 10) || 0

  const dayRaw = await getRaw(`${VISITS_DAILY}${todayKey()}`)
  const daily = typeof dayRaw === 'number' ? dayRaw : parseInt(dayRaw || '0', 10) || 0

  return { total, daily }
}

export async function incrementVisit() {
  if (redis) {
    try {
      const [total, daily] = await Promise.all([
        redis.incr(VISITS_TOTAL),
        redis.incr(`${VISITS_DAILY}${todayKey()}`),
      ])
      return { total, daily }
    } catch {
      /* ignora e usa fallback de memória */
    }
  }

  const totalRaw = (await getRaw(VISITS_TOTAL)) || 0
  const total = (typeof totalRaw === 'number' ? totalRaw : parseInt(totalRaw, 10) || 0) + 1
  await setRaw(VISITS_TOTAL, total)

  const dayKey = `${VISITS_DAILY}${todayKey()}`
  const dayRaw = (await getRaw(dayKey)) || 0
  const daily = (typeof dayRaw === 'number' ? dayRaw : parseInt(dayRaw, 10) || 0) + 1
  await setRaw(dayKey, daily)

  return { total, daily }
}

/* ---------- Sessões de usuário (login tracking) ---------- */

const sessionKey = (id) => `${SESSION_PREFIX}${id}`

export async function saveSession(session) {
  await setRaw(sessionKey(session.id), JSON.stringify(session))
  await listAdd(SESSION_LIST, session.id)
}

export async function getSession(id) {
  return parse(await getRaw(sessionKey(id)))
}

export async function updateSession(id, updates) {
  const session = await getSession(id)
  if (!session) return null
  const updated = { ...session, ...updates }
  await setRaw(sessionKey(id), JSON.stringify(updated))
  return updated
}

export async function listSessions() {
  const ids = await listGet(SESSION_LIST)
  const out = []
  for (const id of ids) {
    const s = parse(await getRaw(sessionKey(id)))
    if (s) out.push(s)
  }
  out.sort((a, b) => (b.loginAt || 0) - (a.loginAt || 0))
  return out
}

export async function deleteSession(id) {
  await delRaw(sessionKey(id))
  await listRemove(SESSION_LIST, id)
}
