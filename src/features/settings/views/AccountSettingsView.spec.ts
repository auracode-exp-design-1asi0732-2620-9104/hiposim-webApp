import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountPlugins, flush } from '@/test-utils'
import { sessionStorageApi } from '@/shared/api/session-storage'
import AccountSettingsView from './AccountSettingsView.vue'

describe('AccountSettingsView', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorageApi.save(
      'jwt',
      JSON.stringify({ email: 'advisor@test.pe', fullName: 'Test Advisor', role: 'advisor', companyName: 'Test Agency' }),
    )
  })

  it('shows the account data and the legal links', async () => {
    const { plugins } = mountPlugins()
    const wrapper = mount(AccountSettingsView, { global: { plugins } })

    expect(wrapper.text()).toContain('advisor@test.pe')
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs.some((href) => href?.endsWith('#terminos'))).toBe(true)
    expect(hrefs.some((href) => href?.endsWith('#privacidad'))).toBe(true)
  })

  it('signs out and goes back to the login', async () => {
    const { router, plugins } = mountPlugins()
    await router.push('/leads')
    const wrapper = mount(AccountSettingsView, { global: { plugins } })

    await wrapper.find('.settings__signout').trigger('click')
    await flush()

    expect(router.currentRoute.value.name).toBe('login')
    expect(sessionStorageApi.getToken()).toBeNull()
  })
})
