import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  apiRequest,
} from './api'

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('manages token and user in localStorage', () => {
    expect(getToken()).toBe('')
    setToken('jwt-token-123')
    expect(getToken()).toBe('jwt-token-123')
    removeToken()
    expect(getToken()).toBe('')

    expect(getUser()).toBeNull()
    setUser({ id: 1, username: 'testuser' })
    expect(getUser()).toEqual({ id: 1, username: 'testuser' })
    removeUser()
    expect(getUser()).toBeNull()
  })

  it('performs successful GET apiRequest without token', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'ok' }),
    })

    const res = await apiRequest('/test')
    expect(res).toEqual({ data: 'ok' })
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:7071/api/test', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('performs POST, PUT, PATCH apiRequest with token and data', async () => {
    setToken('sample-token')
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })

    // POST
    const resPost = await apiRequest('/create', 'POST', { name: 'Item' })
    expect(resPost).toEqual({ success: true })

    // PUT
    const resPut = await apiRequest('/update/1', 'PUT', { name: 'Item Updated' })
    expect(resPut).toEqual({ success: true })

    // PATCH
    const resPatch = await apiRequest('/patch/1', 'PATCH', { status: 'done' })
    expect(resPatch).toEqual({ success: true })
  })

  it('throws error when response is not ok with error message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad Request Parameter' }),
    })

    await expect(apiRequest('/fail')).rejects.toThrow('Bad Request Parameter')
  })

  it('throws fallback error when json cannot be parsed', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Not JSON')
      },
    })

    await expect(apiRequest('/crash')).rejects.toThrow('Request failed with status 500')
  })
})
