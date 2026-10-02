import { createClient } from '@vercel/kv'

const COUNTER_KEY = 'demo:counter'

type CounterStore = {
  backend: 'vercel-kv' | 'memory'
  get: () => Promise<number>
  incr: () => Promise<number>
}

let memoryValue = 0
let store: CounterStore | null = null

function createStore(): CounterStore {
  // 兼容旧版 Vercel KV 与新版 Upstash Marketplace 两套变量名
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token) {
    const kv = createClient({ url, token })
    return {
      backend: 'vercel-kv',
      get: async () => Number((await kv.get<number>(COUNTER_KEY)) ?? 0),
      incr: async () => kv.incr(COUNTER_KEY)
    }
  }

  return {
    backend: 'memory',
    get: async () => memoryValue,
    incr: async () => ++memoryValue
  }
}

export function useCounterStore(): CounterStore {
  store ??= createStore()
  return store
}

// 只返回布尔值，用于排查环境变量是否注入，不暴露任何密钥
export function envFlags() {
  return {
    UPSTASH_REDIS_REST_URL: Boolean(process.env.UPSTASH_REDIS_REST_URL),
    UPSTASH_REDIS_REST_TOKEN: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
    KV_REST_API_URL: Boolean(process.env.KV_REST_API_URL),
    KV_REST_API_TOKEN: Boolean(process.env.KV_REST_API_TOKEN)
  }
}
