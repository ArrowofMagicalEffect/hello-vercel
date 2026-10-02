<script setup lang="ts">
type CounterResponse = {
  count: number
  backend: 'vercel-kv' | 'memory'
  source: string | null
  env: Record<string, boolean | string | null | string[]>
}

const { data, refresh } = await useFetch<CounterResponse>('/api/counter')

const count = computed(() => data.value?.count ?? 0)
const backend = computed(() => data.value?.backend ?? '')
const pending = ref(false)
const error = ref('')
const missingEnv = computed(() =>
  Object.entries(data.value?.env ?? {})
    .filter(([, ok]) => ok === false)
    .map(([name]) => name)
)
const candidates = computed(() => {
  const raw = data.value?.env?.candidates
  return Array.isArray(raw) ? raw : []
})

async function increment() {
  pending.value = true
  error.value = ''
  try {
    data.value = await $fetch<CounterResponse>('/api/counter', { method: 'POST' })
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : '请求失败'
    await refresh()
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <main class="page">
      <section class="card">
        <h1 class="title">
          后端计数器
        </h1>
        <p class="count">
          {{ count }}
        </p>
        <button class="button" :disabled="pending" @click="increment">
          {{ pending ? '提交中…' : '+1' }}
        </button>
        <p v-if="error" class="error">
          {{ error }}
        </p>
        <p class="meta">
          存储后端：
          <code>{{ backend || 'unknown' }}</code>
          <template v-if="backend === 'memory'">
            <br>
            当前为进程内存计数，冷启动后会重置。缺失的环境变量：
            <code>{{ missingEnv.join(', ') || '无' }}</code>
            <br>
            检测到的相关变量名：
            <code>{{ candidates.join(', ') || '无' }}</code>
          </template>
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b0e14;
  color: #e6e8ee;
  font-family: system-ui, -apple-system, 'PingFang SC', sans-serif;
}

.card {
  width: 320px;
  padding: 32px;
  border-radius: 16px;
  background: #151a23;
  border: 1px solid #232a36;
  text-align: center;
}

.title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #9aa4b5;
}

.count {
  margin: 0 0 24px;
  font-size: 64px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #0b0e14;
  background: #4ade80;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  margin: 12px 0 0;
  color: #f87171;
  font-size: 13px;
}

.meta {
  margin: 20px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: #6b7480;
}
</style>
