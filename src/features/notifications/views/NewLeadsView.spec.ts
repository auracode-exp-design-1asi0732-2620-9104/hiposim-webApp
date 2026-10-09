import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountPlugins } from '@/test-utils'
import NewLeadsView from './NewLeadsView.vue'

const settle = () => new Promise((resolve) => setTimeout(resolve, 600)) // sample data answers after 250 ms

describe('NewLeadsView', () => {
  it('lists the new leads and links each one to its card', async () => {
    const { router, plugins } = mountPlugins()
    await router.push('/leads')
    const wrapper = mount(NewLeadsView, { global: { plugins } })
    await settle()

    const items = wrapper.findAll('li')
    expect(items.length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('Ana Torres shared a simulation')

    await items[0]!.find('button').trigger('click')
    await settle()
    expect(router.currentRoute.value.name).toBe('lead-detail')

    wrapper.unmount() // stops the refresh timer
  })
})
