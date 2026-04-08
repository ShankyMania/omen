// In-memory cache replacing Redis — no Redis server needed
const store = new Map()

const redis = {
  async get(key) {
    const entry = store.get(key)
    if (!entry) return null
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      store.delete(key)
      return null
    }
    return entry.value
  },
  async set(key, value, opts = {}) {
    const expiresAt = opts.EX ? Date.now() + opts.EX * 1000 : null
    store.set(key, { value, expiresAt })
  },
  async del(key) {
    store.delete(key)
  },
}

module.exports = redis
