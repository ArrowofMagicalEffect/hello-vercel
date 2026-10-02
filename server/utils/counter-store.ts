import { createClient } from '@vercel/kv'

// 本地调试时可用 COUNTER_KEY 换一个 key，避免污染生产数据
const COUNTER_KEY = process.env.COUNTER_KEY || 'demo:counter'

// 匹配任意前缀的 Upstash REST 凭证：
// UPSTASH_REDIS_REST_URL / KV_REST_API_URL / STORAGE_URL 等都能命中，排除 VERCEL_ 自带变量
const CREDENTIAL_URL_KEY = /^(?!VERCEL_).*(UPSTASH|REDIS|KV|STORAGE).*_URL$/i
const URL_SUFFIX = '_URL'

type CounterStore = {
  backend: 'vercel-kv' | 'memory'
  source: string | null
  get: () => Promise<number>
  incr: () => Promise<number>
}

let memoryValue = 0
let store: CounterStore | null = null

function findCredentials() {
  for (const [key, url] of Object.entries(process.env)) {
    // 线上是 https，本地 serverless-redis-http 是 http://localhost
    const isHttpUrl = url?.startsWith('https://') || url?.startsWith('http://localhost')
    if (!isHttpUrl || !CREDENTIAL_URL_KEY.test(key)) continue
    const prefix = key.slice(0, -URL_SUFFIX.length)
    const token = process.env[`${prefix}_TOKEN`]
    if (token) return { url, token, source: prefix }
  }
  return null
}

function createStore(): CounterStore {
  const credentials = findCredentials()

  if (credentials) {
    const kv = createClient({ url: credentials.url, token: credentials.token })
    return {
      backend: 'vercel-kv',
      source: credentials.source,
      get: async () => Number((await kv.get<number>(COUNTER_KEY)) ?? 0),
      incr: async () => kv.incr(COUNTER_KEY)
    }
  }

  return {
    backend: 'memory',
    source: null,
    get: async () => memoryValue,
    incr: async () => ++memoryValue
  }
}

export function useCounterStore(): CounterStore {
  store ??= createStore()
  return store
}

// 诊断用：只暴露变量名是否存在与命中的前缀，不返回任何密钥
export function envFlags() {
  return {
    detected: useCounterStore().source,
    UPSTASH_REDIS_REST_URL: Boolean(process.env.UPSTASH_REDIS_REST_URL),
    UPSTASH_REDIS_REST_TOKEN: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
    KV_REST_API_URL: Boolean(process.env.KV_REST_API_URL),
    KV_REST_API_TOKEN: Boolean(process.env.KV_REST_API_TOKEN),
    // 只列出变量名，不含值，方便确认 Vercel 实际注入了什么
    candidates: Object.keys(process.env)
      .filter(key => !key.startsWith('VERCEL_') && !/TELEMETRY/i.test(key) && /(UPSTASH|REDIS|STORAGE|KV)/i.test(key))
  }
}
