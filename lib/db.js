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
