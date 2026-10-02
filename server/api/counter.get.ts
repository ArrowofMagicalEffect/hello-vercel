export default defineEventHandler(async () => {
  const store = useCounterStore()
  return {
    count: await store.get(),
    backend: store.backend
  }
})
