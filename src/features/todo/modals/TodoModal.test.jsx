import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TodoModal from './TodoModal'

describe('TodoModal Component', () => {
  const groups = [
    { id: 10, title: 'Proyek Skripsi' },
    { id: 20, title: 'Belajar Go' },
  ]

  it('does not render when isOpen is false', () => {
    const { container } = render(<TodoModal isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders create mode with empty form and submits', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(
      <TodoModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        groups={groups}
      />
    )

    expect(screen.getByText('Tambah Tugas Todolist Baru')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Judul Tugas'), {
      target: { value: 'Belajar Vitest' },
    })
    fireEvent.change(screen.getByLabelText('Kelompok Todo'), {
      target: { value: '20' },
    })
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'in_progress' },
    })
    fireEvent.change(screen.getByLabelText('Tenggat Waktu'), {
      target: { value: '2026-11-20' },
    })
    fireEvent.change(screen.getByLabelText('Deskripsi Markdown'), {
      target: { value: '## Rencana Belajar\n- unit test\n- coverage' },
    })

    fireEvent.click(screen.getByText('Simpan Tugas'))
    expect(onSave).toHaveBeenCalledWith({
      title: 'Belajar Vitest',
      description: '## Rencana Belajar\n- unit test\n- coverage',
      status: 'in_progress',
      todo_group_id: 20,
      due_date: new Date('2026-11-20').toISOString(),
    })

    // Click cancel
    fireEvent.click(screen.getByText('Batal'))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders edit mode with prefilled values', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    const existingTodo = {
      id: 5,
      title: 'Existing Task',
      description: 'Existing Desc',
      status: 'completed',
      todo_group_id: 10,
      due_date: '2026-12-15T00:00:00.000Z',
    }

    render(
      <TodoModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        todo={existingTodo}
        groups={groups}
      />
    )

    expect(screen.getByText('Ubah Tugas Todolist')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul Tugas')).toHaveValue('Existing Task')
    expect(screen.getByLabelText('Deskripsi Markdown')).toHaveValue('Existing Desc')
    expect(screen.getByLabelText('Status')).toHaveValue('completed')
    expect(screen.getByLabelText('Kelompok Todo')).toHaveValue('10')

    // Close with top X button
    fireEvent.click(screen.getByText('×'))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders edit mode using initialData prop with prefilled values', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    const existingTodo = {
      id: 7,
      title: 'InitialData Task',
      description: 'InitialData Desc',
      status: 'in_progress',
      todo_group_id: 20,
      due_date: '2026-11-25T00:00:00.000Z',
    }

    render(
      <TodoModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        initialData={existingTodo}
        groups={groups}
      />
    )

    expect(screen.getByText('Ubah Tugas Todolist')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul Tugas')).toHaveValue('InitialData Task')
    expect(screen.getByLabelText('Deskripsi Markdown')).toHaveValue('InitialData Desc')
    expect(screen.getByLabelText('Status')).toHaveValue('in_progress')
    expect(screen.getByLabelText('Kelompok Todo')).toHaveValue('20')
    expect(screen.getByLabelText('Tenggat Waktu')).toHaveValue('2026-11-25')
  })

  it('handles alternative property names and date object/invalid formats', () => {
    const onSave = vi.fn()
    const todoWithAltProps = {
      id: 9,
      title: 'Alt Props Task',
      description: 'Alt Desc',
      status: 'pending',
      group_id: 10,
      due_date: new Date('2026-12-30T00:00:00.000Z'),
    }

    const { rerender } = render(
      <TodoModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        todo={todoWithAltProps}
        groups={groups}
      />
    )

    expect(screen.getByLabelText('Kelompok Todo')).toHaveValue('10')
    expect(screen.getByLabelText('Tenggat Waktu')).toHaveValue('2026-12-30')

    // Rerender with invalid date
    rerender(
      <TodoModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        todo={{ ...todoWithAltProps, due_date: 'invalid-date-string' }}
        groups={groups}
      />
    )
    expect(screen.getByLabelText('Tenggat Waktu')).toHaveValue('')

    // Rerender with null to reset
    rerender(
      <TodoModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        todo={null}
        initialData={null}
        groups={groups}
      />
    )
    expect(screen.getByLabelText('Judul Tugas')).toHaveValue('')
    expect(screen.getByLabelText('Tenggat Waktu')).toHaveValue('')
  })
})
