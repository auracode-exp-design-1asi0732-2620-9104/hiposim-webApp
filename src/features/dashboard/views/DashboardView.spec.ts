import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountPlugins } from '@/test-utils'
import DashboardView from './DashboardView.vue'

const settle = () => new Promise((resolve) => setTimeout(resolve, 600)) // sample data answers after 250 ms

describe('DashboardView', () => {
  it('summarises the leads and links the latest ones to their card', async () => {
    const { router, plugins } = mountPlugins()
    await router.push('/dashboard')
    const wrapper = mount(DashboardView, { global: { plugins } })
    await settle()

    // Four KPI tiles and one bar per status.
    expect(wrapper.findAll('.kpi')).toHaveLength(4)
    expect(wrapper.findAll('[role="progressbar"]')).toHaveLength(5)

    const recent = wrapper.findAll('.recent li')
    expect(recent.length).toBeGreaterThan(0)
    expect(recent.length).toBeLessThanOrEqual(5)

    await recent[0]!.find('button').trigger('click')
    await settle()
    expect(router.currentRoute.value.name).toBe('lead-detail')
  })
})
