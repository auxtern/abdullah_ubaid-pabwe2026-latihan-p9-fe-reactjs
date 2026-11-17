import { describe, it, expect, vi, beforeEach } from 'vitest'
import todoApi from './todoApi'
import apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    fetchData: vi.fn(),
  },
}))

describe('todoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles all todo API endpoints successfully', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 1, title: 'Task' }] })
    expect(await todoApi.getTodos()).toEqual([{ id: 1, title: 'Task' }])

    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 1, title: 'New' } })
    expect(await todoApi.createTodo({ title: 'New' })).toEqual({ id: 1, title: 'New' })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 1, title: 'Updated' } })
    expect(await todoApi.updateTodo(1, { title: 'Updated' })).toEqual({ id: 1, title: 'Updated' })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { message: 'Deleted' } })
    expect(await todoApi.deleteTodo(1)).toEqual({ message: 'Deleted' })

    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ title: 'AI 1' }] })
    expect(await todoApi.generateAiTodos({ prompt: 'Learn Go' })).toEqual([{ title: 'AI 1' }])

    apiHelper.fetchData.mockResolvedValueOnce({ data: { total: 10, completed: 5, pending: 5 } })
    expect(await todoApi.getStats()).toEqual({ total: 10, completed: 5, pending: 5 })
  })
})
