import { describe, it, expect, vi, beforeEach } from 'vitest'
import authApi from './authApi'
import apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    fetchData: vi.fn(),
  },
}))

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls login, register, and getProfile successfully', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: { token: 't1', user: { id: 1 } } })
    const loginRes = await authApi.login('user', 'pass')
    expect(loginRes).toEqual({ token: 't1', user: { id: 1 } })
    expect(apiHelper.fetchData).toHaveBeenCalledWith('/auth/login', expect.objectContaining({ method: 'POST' }))

    apiHelper.fetchData.mockResolvedValueOnce({ data: { message: 'registered' } })
    const regRes = await authApi.register('user', 'email@delcom.org', 'pass')
    expect(regRes).toEqual({ message: 'registered' })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 1, username: 'user' } })
    const profRes = await authApi.getProfile()
    expect(profRes).toEqual({ id: 1, username: 'user' })
  })
})
