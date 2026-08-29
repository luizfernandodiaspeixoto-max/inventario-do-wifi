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

const keyFor = (id) => `wifi_inventory_user::${id}`

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

export async function getUser(email) {
  if (!email) return null
  const key = keyFor(String(email).toLowerCase())
  const raw = await getRaw(key)
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}

export async function saveUser(user) {
  const key = keyFor(user.email)
  await setRaw(key, JSON.stringify(user))
}

export async function removeUser(email) {
  await delRaw(keyFor(String(email).toLowerCase()))
}

const approvalKeyFor = (token) => `wifi_inventory_approval::${token}`

export async function saveApproval(token, data) {
  await setRaw(approvalKeyFor(token), JSON.stringify(data))
}

export async function getApproval(token) {
  const raw = await getRaw(approvalKeyFor(token))
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}

export async function removeApproval(token) {
  await delRaw(approvalKeyFor(token))
}

export const hasStore = Boolean(redis)
