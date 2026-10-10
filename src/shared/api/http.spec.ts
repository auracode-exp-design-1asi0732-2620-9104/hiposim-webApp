import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'
import { http, setUnauthorizedHandler } from './http'
import { sessionStorageApi } from './session-storage'

const originalAdapter = http.defaults.adapter

/** Makes every request fail with the given status, without touching the network. */
function failWith(status: number): AxiosAdapter {
  return (config: InternalAxiosRequestConfig) =>
    Promise.reject(
      new AxiosError('failed', 'ERR_BAD_RESPONSE', config, null, {
        status,
        statusText: '',
        headers: {},
        config,
        data: {},
      }),
    )
}

describe('http client', () => {
  afterEach(() => {
    http.defaults.adapter = originalAdapter
    localStorage.clear()
  })

  it('sends the saved token as a Bearer header', async () => {
    sessionStorageApi.save('abc123', '{}')
    let sent: string | undefined
    http.defaults.adapter = (config) => {
      sent = config.headers.Authorization as string
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config })
    }

    await http.get('/api/leads')

    expect(sent).toBe('Bearer abc123')
  })

  it('ends the session when the API answers 401 on a protected call', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    http.defaults.adapter = failWith(401)

    await expect(http.get('/api/leads')).rejects.toBeTruthy()

    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not end the session when the login call itself returns 401 (wrong credentials)', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    http.defaults.adapter = failWith(401)

    await expect(http.post('/api/auth/login', {})).rejects.toBeTruthy()

    expect(handler).not.toHaveBeenCalled()
  })
})
