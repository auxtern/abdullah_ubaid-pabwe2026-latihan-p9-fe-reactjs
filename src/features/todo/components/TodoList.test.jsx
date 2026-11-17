import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TodoList from './TodoList'

describe('TodoList Component', () => {
  it('renders empty state when no todos', () => {
    render(<TodoList todos={[]} />)
    expect(screen.getByText('Belum ada tugas.')).toBeInTheDocument()
  })

  it('renders todos list and handles actions', () => {
    const onToggleStatus = vi.fn()
    const onDetail = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    const sampleTodos = [
      {
        id: 1,
        title: 'Task One',
        status: 'pending',
        due_date: '2026-12-01T00:00:00Z',
      },
      {
        id: 2,
        title: 'Task Two In Progress',
        status: 'in_progress',
      },
      {
        id: 3,
        title: 'Task Three Completed',
        status: 'completed',
      },
    ]

    render(
      <TodoList
        todos={sampleTodos}
        onToggleStatus={onToggleStatus}
        onDetail={onDetail}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText('Task One')).toBeInTheDocument()
    expect(screen.getByText('Task Two In Progress')).toBeInTheDocument()
    expect(screen.getByText('Task Three Completed')).toBeInTheDocument()

    // Toggle status via checkbox
    fireEvent.click(screen.getByLabelText('checkbox-1'))
    expect(onToggleStatus).toHaveBeenCalledWith(sampleTodos[0])

    // Click title to view detail
    fireEvent.click(screen.getByText('Task One'))
    expect(onDetail).toHaveBeenCalledWith(sampleTodos[0])

    // Open kebab menu
    const kebabBtn = screen.getByLabelText('kebab-1')
    fireEvent.click(kebabBtn)
    expect(screen.getByTestId('kebab-menu-1')).toBeInTheDocument()

    // Click Detail from kebab
    fireEvent.click(screen.getByText(/Detail/i))
    expect(onDetail).toHaveBeenCalledWith(sampleTodos[0])

    // Reopen and click Edit
    fireEvent.click(kebabBtn)
    fireEvent.click(screen.getByText(/Ubah Edit/i))
    expect(onEdit).toHaveBeenCalledWith(sampleTodos[0])

    // Reopen and click Delete (which closes kebab)
    fireEvent.click(kebabBtn)
    fireEvent.click(screen.getByText(/Hapus/i))
    expect(onDelete).toHaveBeenCalledWith(1)
    expect(screen.queryByTestId('kebab-menu-1')).not.toBeInTheDocument()
  })
})
