import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNotificationsStore } from './notifications.store'

describe('notifications store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('counts only the leads that are still new', async () => {
    const store = useNotificationsStore()

    await store.refresh()

    expect(store.count).toBeGreaterThan(0)
    expect(store.items.every((lead) => lead.status === 'new')).toBe(true)
    expect(store.hasError).toBe(false)
    expect(store.lastUpdated).toBeInstanceOf(Date)
  })

  it('clears everything on reset (used when the advisor signs out)', async () => {
    const store = useNotificationsStore()
    await store.refresh()

    store.reset()

    expect(store.count).toBe(0)
    expect(store.lastUpdated).toBeNull()
  })
})
