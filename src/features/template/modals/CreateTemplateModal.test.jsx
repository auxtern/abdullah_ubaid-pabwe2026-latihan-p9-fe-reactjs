import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CreateTemplateModal from './CreateTemplateModal'

describe('CreateTemplateModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<CreateTemplateModal isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders form, adds/removes items, and submits valid template', () => {
    const onSubmit = vi.fn()
    const onClose = vi.fn()

    render(
      <CreateTemplateModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    )

    expect(screen.getByText('Tambah Template Publik Baru')).toBeInTheDocument()

    // Fill title & description
    fireEvent.change(screen.getByLabelText('Judul Template'), {
      target: { value: 'Belajar React & Go' },
    })
    fireEvent.change(screen.getByLabelText('Deskripsi Template'), {
      target: { value: 'Panduan lengkap dari dasar' },
    })

    // Fill initial task item
    fireEvent.change(screen.getByLabelText('Judul Tugas 1'), {
      target: { value: 'Setup Proyek' },
    })
    fireEvent.change(screen.getByLabelText('Deskripsi Tugas 1'), {
      target: { value: 'Inisialisasi repo' },
    })

    // Add another task item
    fireEvent.click(screen.getByText('Tambah Tugas'))
    expect(screen.getByLabelText('Judul Tugas 2')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Judul Tugas 2'), {
      target: { value: 'Tugas yang akan dihapus' },
    })
    fireEvent.change(screen.getByLabelText('Deskripsi Tugas 2'), {
      target: { value: 'Akan dihapus' },
    })

    // Remove task 2
    fireEvent.click(screen.getByLabelText('Hapus Tugas 2'))
    expect(screen.queryByLabelText('Judul Tugas 2')).not.toBeInTheDocument()

    // Submit form
    fireEvent.click(screen.getByText('Simpan Template Publik'))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Belajar React & Go',
      description: 'Panduan lengkap dari dasar',
      items: [{ title: 'Setup Proyek', description: 'Inisialisasi repo' }],
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('prevents submission when title is empty', () => {
    const onSubmit = vi.fn()
    const onClose = vi.fn()

    render(
      <CreateTemplateModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    )

    fireEvent.change(screen.getByLabelText('Judul Template'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByText('Simpan Template Publik'))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes and resets when clicking cancel or X button', () => {
    const onClose = vi.fn()

    const { rerender } = render(
      <CreateTemplateModal
        isOpen={true}
        onClose={onClose}
        onSubmit={vi.fn()}
      />
    )

    fireEvent.change(screen.getByLabelText('Judul Template'), {
      target: { value: 'Draft Title' },
    })

    // Click Batal
    fireEvent.click(screen.getByText('Batal'))
    expect(onClose).toHaveBeenCalledTimes(1)

    // Click X button
    rerender(
      <CreateTemplateModal
        isOpen={true}
        onClose={onClose}
        onSubmit={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('×'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('triggers onSwitchToAi when Gunakan AI button is clicked', () => {
    const onSwitchToAi = vi.fn()
    render(
      <CreateTemplateModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onSwitchToAi={onSwitchToAi}
      />
    )

    fireEvent.click(screen.getByText('Gunakan AI'))
    expect(onSwitchToAi).toHaveBeenCalledTimes(1)
  })
})
