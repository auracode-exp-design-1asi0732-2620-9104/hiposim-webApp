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

  it('exports the visible leads as a CSV file', async () => {
    const created: Blob[] = []
    URL.createObjectURL = (blob: Blob | MediaSource) => {
      created.push(blob as Blob)
      return 'blob:test'
    }
    URL.revokeObjectURL = () => undefined
    HTMLAnchorElement.prototype.click = () => undefined // jsdom cannot navigate to a download
    const { router, plugins } = mountPlugins()
    await router.push('/leads')
    const wrapper = mount(LeadsInboxView, { global: { plugins } })
    await settle()

    const button = wrapper.findAll('button').find((b) => b.text() === 'Export CSV')
    expect(button).toBeDefined()
    await button!.trigger('click')

    expect(created).toHaveLength(1)
    expect(await created[0]!.text()).toContain('Ana Torres')
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
