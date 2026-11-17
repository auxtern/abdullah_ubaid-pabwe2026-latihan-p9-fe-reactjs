import { describe, it, expect, vi, beforeEach } from 'vitest'
import adminApi from './adminApi'
import apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    fetchData: vi.fn(),
  },
}))

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches users and user todos', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 1, username: 'admin' }] })
    expect(await adminApi.getUsers()).toEqual([{ id: 1, username: 'admin' }])

    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 10, title: 'Task' }] })
    expect(await adminApi.getUserTodos(1)).toEqual([{ id: 10, title: 'Task' }])
  })
})
