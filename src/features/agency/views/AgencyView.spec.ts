import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountPlugins } from '@/test-utils'
import { sessionStorageApi } from '@/shared/api/session-storage'
import AgencyView from './AgencyView.vue'

const settle = () => new Promise((resolve) => setTimeout(resolve, 600))

describe('AgencyView', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorageApi.save(
      'jwt',
      JSON.stringify({ email: 'advisor@test.pe', fullName: 'Test Advisor', role: 'advisor', companyName: 'Test Agency' }),
    )
  })

  it('shows the agency, the advisor account and the lead counts by status', async () => {
    const { plugins } = mountPlugins()
    const wrapper = mount(AgencyView, { global: { plugins } })
    await settle()

    expect(wrapper.text()).toContain('Test Agency')
    expect(wrapper.text()).toContain('Test Advisor')
    expect(wrapper.text()).toContain('advisor@test.pe')
    expect(wrapper.text()).toContain('Total leads')
    // One row per status of US25.
    expect(wrapper.findAll('.agency__counts li')).toHaveLength(5)
  })
})
