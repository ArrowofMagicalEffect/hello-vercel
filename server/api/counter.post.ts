export default defineEventHandler(async () => {
  const store = useCounterStore()
  return {
    count: await store.incr(),
    backend: store.backend
  }
})
