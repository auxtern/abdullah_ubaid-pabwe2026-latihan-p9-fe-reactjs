import { describe, it, expect, vi, beforeEach } from 'vitest'
import templateApi from './templateApi'
import apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    fetchData: vi.fn(),
  },
}))

describe('templateApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches templates, clones template, and creates template', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 1, title: 'Template' }] })
    expect(await templateApi.getTemplates()).toEqual([{ id: 1, title: 'Template' }])

    apiHelper.fetchData.mockResolvedValueOnce({ data: { message: 'Cloned' } })
    expect(await templateApi.cloneTemplate(1)).toEqual({ message: 'Cloned' })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 2, title: 'New Public Template' } })
    expect(await templateApi.createTemplate({ title: 'New Public Template' })).toEqual({
      id: 2,
      title: 'New Public Template',
    })
  })
})
