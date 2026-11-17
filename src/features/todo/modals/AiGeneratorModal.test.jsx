import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AiGeneratorModal from './AiGeneratorModal'

describe('AiGeneratorModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<AiGeneratorModal isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('handles generation with search engine integration and batch save', async () => {
    const onGenerate = vi.fn().mockResolvedValue({
      items: [
        { title: 'AI Task 1', description: 'Desc 1', source_url: 'https://example.com/guide' },
        { title: 'AI Task 2', description: 'Desc 2' },
      ],
      search_sources: ['https://example.com - Panduan Belajar Go & React'],
    })
    const onSaveBatch = vi.fn()
    const onClose = vi.fn()

    render(
      <AiGeneratorModal
        isOpen={true}
        onClose={onClose}
        onGenerate={onGenerate}
        onSaveBatch={onSaveBatch}
        loading={false}
      />
    )

    expect(screen.getByText(/AI Todolist Generator/i)).toBeInTheDocument()

    // Check search toggle is present and can be toggled
    const searchToggle = screen.getByTestId('ai-toggle-search')
    expect(searchToggle).toBeChecked()
    fireEvent.click(searchToggle)
    expect(searchToggle).not.toBeChecked()
    fireEvent.click(searchToggle)
    expect(searchToggle).toBeChecked()

    // Fill form
    fireEvent.change(screen.getByLabelText('Prompt AI'), {
      target: { value: 'Belajar React & Go' },
    })
    fireEvent.change(screen.getByLabelText('Jumlah Todo'), {
      target: { value: '2' },
    })

    // Submit generate
    fireEvent.click(screen.getByText('Hasilkan via AI'))
    expect(onGenerate).toHaveBeenCalledWith({
      prompt: 'Belajar React & Go',
      count: 2,
      include_web_search: true,
    })

    await waitFor(() => {
      expect(screen.getByText('AI Task 1')).toBeInTheDocument()
      expect(screen.getByText('AI Task 2')).toBeInTheDocument()
      expect(screen.getByTestId('ai-search-sources')).toBeInTheDocument()
      expect(screen.getByTestId('ai-todo-source-0')).toBeInTheDocument()
    })

    // Save all to database
    fireEvent.click(screen.getByText('Simpan Semua ke Daftar Todo'))
    expect(onSaveBatch).toHaveBeenCalledWith([
      { title: 'AI Task 1', description: 'Desc 1', source_url: 'https://example.com/guide' },
      { title: 'AI Task 2', description: 'Desc 2' },
    ])
    expect(onClose).toHaveBeenCalled()
  })

  it('handles response as direct array for backwards compatibility', async () => {
    const onGenerate = vi.fn().mockResolvedValue([
      { title: 'Legacy Array Task', description: 'Legacy Desc' },
    ])

    render(
      <AiGeneratorModal
        isOpen={true}
        onClose={vi.fn()}
        onGenerate={onGenerate}
        onSaveBatch={vi.fn()}
        loading={false}
      />
    )

    fireEvent.change(screen.getByLabelText('Prompt AI'), {
      target: { value: 'Legacy Prompt' },
    })
    fireEvent.click(screen.getByText('Hasilkan via AI'))

    await waitFor(() => {
      expect(screen.getByText('Legacy Array Task')).toBeInTheDocument()
    })
  })

  it('ignores empty prompt submit and closes via X or Tutup', () => {
    const onGenerate = vi.fn()
    const onClose = vi.fn()

    render(
      <AiGeneratorModal
        isOpen={true}
        onClose={onClose}
        onGenerate={onGenerate}
        onSaveBatch={vi.fn()}
        loading={false}
      />
    )

    fireEvent.change(screen.getByLabelText('Prompt AI'), { target: { value: '   ' } })
    fireEvent.click(screen.getByText('Hasilkan via AI'))
    expect(onGenerate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Tutup Modal'))
    expect(onClose).toHaveBeenCalled()

    fireEvent.click(screen.getByText('Tutup'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
