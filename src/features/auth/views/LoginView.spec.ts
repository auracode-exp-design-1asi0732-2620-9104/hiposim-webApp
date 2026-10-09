import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountPlugins, flush } from '@/test-utils'
import LoginView from './LoginView.vue'

async function mountLogin() {
  const { router, plugins } = mountPlugins()
  await router.push('/login')
  await router.isReady()
  const wrapper = mount(LoginView, { global: { plugins } })
  return { wrapper, router }
}

describe('LoginView', () => {
  beforeEach(() => localStorage.clear())

  it('asks for the email and the password when the form is empty', async () => {
    const { wrapper } = await mountLogin()

    await wrapper.find('form').trigger('submit')

    const alerts = wrapper.findAll('[role="alert"]').map((el) => el.text())
    expect(alerts).toContain('Email is required.')
    expect(alerts).toContain('Enter your password.')
  })

  it('rejects an email without a valid format', async () => {
    const { wrapper } = await mountLogin()

    await wrapper.find('#email').setValue('not-an-email')
    await wrapper.find('#email').trigger('blur')

    expect(wrapper.text()).toContain('Enter a valid email address.')
  })

  it('goes to the lead inbox after a successful login (US22 scenario 1)', async () => {
    const { wrapper, router } = await mountLogin()

    await wrapper.find('#email').setValue('advisor@test.pe')
    await wrapper.find('#password').setValue('any-password')
    await wrapper.find('form').trigger('submit')
    await new Promise((resolve) => setTimeout(resolve, 600)) // the sample login answers after 300 ms
    await flush()

    expect(router.currentRoute.value.name).toBe('leads')
    expect(localStorage.getItem('hiposim.accessToken')).toBeTruthy()
  })
})
