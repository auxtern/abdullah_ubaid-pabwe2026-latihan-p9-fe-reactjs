import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TodoDetailPage from './TodoDetailPage'

describe('TodoDetailPage Component', () => {
  const sampleTodo = {
    id: 10,
    title: 'Tugas Detail Belajar',
    description: '## Catatan Penting\n- Belajar Gin\n- Belajar React',
    status: 'in_progress',
    todo_group_id: 1,
    due_date: '2026-11-20T00:00:00.000Z',
    cover_image_path: 'https://example.com/cover.jpg',
  }

  const groups = [{ id: 1, title: 'Proyek Skripsi' }]

  it('renders not found fallback when todo is null', () => {
    const handleBack = vi.fn()
    render(<TodoDetailPage todo={null} onBack={handleBack} />)
    expect(screen.getByTestId('todo-detail-not-found')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Kembali ke Todolist'))
    expect(handleBack).toHaveBeenCalled()
  })

  it('renders todo details with cover image, actions, and triggers callbacks', () => {
    const handleBack = vi.fn()
    const handleEdit = vi.fn()
    const handleToggle = vi.fn()
    const handleDelete = vi.fn()
    const handleUpdateCover = vi.fn()

    const mockFileReader = {
      readAsDataURL: vi.fn(function () {
        this.onload({ target: { result: 'data:image/png;base64,mock' } })
      }),
    }
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader)

    render(
      <TodoDetailPage
        todo={sampleTodo}
        groups={groups}
        onBack={handleBack}
        onEdit={handleEdit}
        onToggleStatus={handleToggle}
        onDelete={handleDelete}
        onUpdateCover={handleUpdateCover}
      />
    )

    expect(screen.getByText('Tugas Detail Belajar')).toBeInTheDocument()
    expect(screen.getByText('Proyek Skripsi')).toBeInTheDocument()
    expect(screen.getByText('Tandai Selesai')).toBeInTheDocument()
    expect(screen.getByText('Foto Sampul')).toBeInTheDocument()

    // Test back button
    fireEvent.click(screen.getByText('Kembali ke Todolist'))
    expect(handleBack).toHaveBeenCalled()

    // Test toggle status
    fireEvent.click(screen.getByText('Tandai Selesai'))
    expect(handleToggle).toHaveBeenCalledWith(sampleTodo)

    // Test edit
    fireEvent.click(screen.getByText('Edit Todo'))
    expect(handleEdit).toHaveBeenCalledWith(sampleTodo)

    // Test delete
    fireEvent.click(screen.getByText('Hapus'))
    expect(handleDelete).toHaveBeenCalledWith(10)

    // Test delete cover
    fireEvent.click(screen.getByText('Hapus Cover'))
    expect(handleUpdateCover).toHaveBeenCalledWith(10, 'DELETE')

    // Test file change with mock reader
    const file = new File(['dummy content'], 'cover.png', { type: 'image/png' })
    const fileInput = screen.getByLabelText('Upload Cover')
    fireEvent.change(fileInput, { target: { files: [file] } })
    expect(handleUpdateCover).toHaveBeenCalledWith(10, 'data:image/png;base64,mock')

    vi.restoreAllMocks()
  })

  it('renders without cover image (completed status) and allows uploading or setting URL', async () => {
    const handleUpdateCover = vi.fn()
    const todoCompleted = {
      ...sampleTodo,
      status: 'completed',
      cover_image_path: '',
      todo_group_id: null,
      due_date: null,
    }

    render(
      <TodoDetailPage
        todo={todoCompleted}
        groups={groups}
        onBack={vi.fn()}
        onEdit={vi.fn()}
        onToggleStatus={vi.fn()}
        onDelete={vi.fn()}
        onUpdateCover={handleUpdateCover}
      />
    )

    expect(screen.getByText('Tandai Belum Selesai')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Belum ada foto sampul (cover). Anda dapat mengunggah gambar pendukung tugas.'
      )
    ).toBeInTheDocument()

    // Toggle URL input
    fireEvent.click(screen.getByText('URL Gambar'))
    const urlInput = screen.getByPlaceholderText('Masukkan URL Gambar (https://...)')
    fireEvent.change(urlInput, { target: { value: 'https://images.unsplash.com/sample.jpg' } })
    fireEvent.click(screen.getByText('Simpan URL'))
    expect(handleUpdateCover).toHaveBeenCalledWith(10, 'https://images.unsplash.com/sample.jpg')

    // Test file change empty
    const fileInput = screen.getByLabelText('Upload Cover')
    fireEvent.change(fileInput, { target: { files: [] } })
    expect(handleUpdateCover).toHaveBeenCalledTimes(1)
  })
})
