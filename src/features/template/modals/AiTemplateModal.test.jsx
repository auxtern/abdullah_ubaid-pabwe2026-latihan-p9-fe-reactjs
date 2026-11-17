import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AiTemplateModal from './AiTemplateModal'

describe('AiTemplateModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<AiTemplateModal isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders modal, toggles web search, handles count change, and closes via close button', () => {
    const onClose = vi.fn()
    render(
      <AiTemplateModal
        isOpen={true}
        onClose={onClose}
        onGenerate={vi.fn()}
        onSaveTemplate={vi.fn()}
      />
    )

    expect(screen.getByTestId('ai-template-modal')).toBeInTheDocument()
    expect(screen.getByText('Generate Template Publik AI')).toBeInTheDocument()

    // Test toggle search
    const toggle = screen.getByTestId('ai-template-toggle-search')
    expect(toggle).toBeChecked()
    fireEvent.click(toggle)
    expect(toggle).not.toBeChecked()

    // Test count change
    const countInput = screen.getByLabelText('Jumlah Tugas Template')
    fireEvent.change(countInput, { target: { value: '5' } })
    expect(countInput.value).toBe('5')

    // Close with top close button
    fireEvent.click(screen.getByLabelText('Tutup Modal'))
    expect(onClose).toHaveBeenCalled()
  })

  it('handles empty prompt submission and empty onGenerate gracefully', () => {
    const onGenerate = vi.fn()
    render(
      <AiTemplateModal
        isOpen={true}
        onClose={vi.fn()}
        onGenerate={onGenerate}
        onSaveTemplate={vi.fn()}
      />
    )

    // Submit empty prompt
    fireEvent.click(screen.getByText('Hasilkan Template AI'))
    expect(onGenerate).not.toHaveBeenCalled()
  })

  it('generates template with array result, edits metadata, removes item, and saves template', async () => {
    const onGenerate = vi.fn().mockResolvedValue([
      { title: 'Tugas 1', description: 'Desc 1', source_url: 'https://example.com' },
      { title: 'Tugas 2', description: 'Desc 2' },
    ])
    const onSaveTemplate = vi.fn()
    const onClose = vi.fn()

    render(
      <AiTemplateModal
        isOpen={true}
        onClose={onClose}
        onGenerate={onGenerate}
        onSaveTemplate={onSaveTemplate}
      />
    )

    // Enter prompt
    const promptInput = screen.getByLabelText('Topik Template AI')
    fireEvent.change(promptInput, { target: { value: 'Belajar React & Go' } })

    // Submit generation
    fireEvent.click(screen.getByText('Hasilkan Template AI'))

    await waitFor(() => {
      expect(screen.getByTestId('ai-template-result-preview')).toBeInTheDocument()
    })

    expect(screen.getByText('1. Tugas 1')).toBeInTheDocument()
    expect(screen.getByText('2. Tugas 2')).toBeInTheDocument()
    expect(screen.getByText('Sumber')).toBeInTheDocument()

    // Edit title & description
    const titleInput = screen.getByLabelText('Judul Template Publik Hasil AI')
    fireEvent.change(titleInput, { target: { value: 'Template React Go Custom' } })

    const descInput = screen.getByLabelText('Deskripsi Template Publik Hasil AI')
    fireEvent.change(descInput, { target: { value: 'Deskripsi custom' } })

    // Remove item 2
    fireEvent.click(screen.getByLabelText('Hapus tugas 2'))
    expect(screen.queryByText('2. Tugas 2')).not.toBeInTheDocument()

    // Save template
    fireEvent.click(screen.getByText('Simpan Sebagai Template Publik'))
    expect(onSaveTemplate).toHaveBeenCalledWith({
      title: 'Template React Go Custom',
      description: 'Deskripsi custom',
      items: [
        { title: 'Tugas 1', description: 'Desc 1', source_url: 'https://example.com' },
      ],
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('generates template with object response containing search_sources and items', async () => {
    const onGenerate = vi.fn().mockResolvedValue({
      items: [{ title: 'Item Obj', description: 'Desc Obj' }],
      search_sources: ['https://wikipedia.org/wiki/Golang'],
    })
    const onSaveTemplate = vi.fn()

    render(
      <AiTemplateModal
        isOpen={true}
        onClose={vi.fn()}
        onGenerate={onGenerate}
        onSaveTemplate={onSaveTemplate}
      />
    )

    fireEvent.change(screen.getByLabelText('Topik Template AI'), {
      target: { value: 'Golang Basics' },
    })
    fireEvent.click(screen.getByText('Hasilkan Template AI'))

    await waitFor(() => {
      expect(screen.getByTestId('ai-template-search-sources')).toBeInTheDocument()
    })
    expect(screen.getByText('https://wikipedia.org/wiki/Golang')).toBeInTheDocument()
    expect(screen.getByText('1. Item Obj')).toBeInTheDocument()

    // If title is cleared, save is disabled
    const titleInput = screen.getByLabelText('Judul Template Publik Hasil AI')
    fireEvent.change(titleInput, { target: { value: '' } })
    fireEvent.click(screen.getByText('Simpan Sebagai Template Publik'))
    expect(onSaveTemplate).not.toHaveBeenCalled()
  })
})
