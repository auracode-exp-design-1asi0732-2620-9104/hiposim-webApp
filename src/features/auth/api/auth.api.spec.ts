import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '@/shared/api/http'
import { agencyIdFromToken, agencyNameFor } from './auth.api'

// The tests run with the sample data on; this file needs the real-API branch.
vi.mock('@/shared/api/config', () => ({ useMockApi: false, apiBaseUrl: 'http://localhost:5000' }))

const AGENCY_ID = 'a3e32c74-3e12-43e2-b609-3189294ff3e5'

/** A token with the payload an advisor receives; the signature is not checked in the browser. */
function tokenWith(claims: Record<string, unknown>) {
  const payload = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `header.${payload}.signature`
}

describe('agency of the advisor', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('reads the agencyId claim from the token', () => {
    expect(agencyIdFromToken(tokenWith({ sub: 'u1', agencyId: AGENCY_ID }))).toBe(AGENCY_ID)
  })

  it('returns null for a token without the claim or one that is not a JWT', () => {
    expect(agencyIdFromToken(tokenWith({ sub: 'u1' }))).toBeNull()
    expect(agencyIdFromToken('not-a-token')).toBeNull()
  })

  it('finds the agency name in the public catalogue', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({
      data: [
        { id: 'other', name: 'Otra' },
        { id: AGENCY_ID, name: 'HipoSim Demo Agency' },
      ],
    })

    await expect(agencyNameFor(tokenWith({ agencyId: AGENCY_ID }))).resolves.toBe('HipoSim Demo Agency')
  })

  it('answers with an empty name when the catalogue fails', async () => {
    vi.spyOn(http, 'get').mockRejectedValue(new Error('network'))

    await expect(agencyNameFor(tokenWith({ agencyId: AGENCY_ID }))).resolves.toBe('')
  })
})
