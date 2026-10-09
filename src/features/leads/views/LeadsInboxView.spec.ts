import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountPlugins } from '@/test-utils'
import LeadsInboxView from './LeadsInboxView.vue'

const settle = () => new Promise((resolve) => setTimeout(resolve, 600)) // sample data answers after 250 ms

describe('LeadsInboxView', () => {
  it('lists the leads with the columns of US23', async () => {
    const { router, plugins } = mountPlugins()
    await router.push('/leads')
    const wrapper = mount(LeadsInboxView, { global: { plugins } })
    await settle()

    const headers = wrapper.findAll('th').map((th) => th.text())
    expect(headers).toEqual(
      expect.arrayContaining(['Buyer', 'Simulated property', 'Estimated installment', 'TCEA', 'Status', 'Received']),
    )
    expect(wrapper.findAll('tbody tr').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('Ana Torres')
  })

  it('does not show data that is out of scope (DNI, SBS score, inventory)', async () => {
    const { router, plugins } = mountPlugins()
    await router.push('/leads')
    const wrapper = mount(LeadsInboxView, { global: { plugins } })
    await settle()

    expect(wrapper.text()).not.toMatch(/DNI|SBS|BBP/i)
  })

  it('opens the lead card from its row', async () => {
    const { router, plugins } = mountPlugins()
    await router.push('/leads')
    const wrapper = mount(LeadsInboxView, { global: { plugins } })
    await settle()

    await wrapper.find('tbody tr button').trigger('click')
    await settle()

    expect(router.currentRoute.value.name).toBe('lead-detail')
  })
})
