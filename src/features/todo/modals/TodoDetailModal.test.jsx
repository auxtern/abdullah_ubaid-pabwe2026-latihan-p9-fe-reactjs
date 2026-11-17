import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TodoDetailModal from './TodoDetailModal'

describe('TodoDetailModal Component', () => {
  it('does not render when isOpen is false or todo is null', () => {
    const { container: c1 } = render(<TodoDetailModal isOpen={false} todo={{ title: 'test' }} />)
    expect(c1.firstChild).toBeNull()

    const { container: c2 } = render(<TodoDetailModal isOpen={true} todo={null} />)
    expect(c2.firstChild).toBeNull()
  })

  it('renders todo details and closes on buttons', () => {
    const onClose = vi.fn()
    const todo = {
      title: 'Setup Database PostgreSQL',
      status: 'completed',
      due_date: '2026-11-25T00:00:00Z',
      description: 'Gunakan psql atau docker.',
    }

    render(<TodoDetailModal isOpen={true} onClose={onClose} todo={todo} />)

    expect(screen.getByText('Setup Database PostgreSQL')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
    expect(screen.getByText('Gunakan psql atau docker.')).toBeInTheDocument()

    // Click Close bottom button
    fireEvent.click(screen.getByText('Tutup'))
    expect(onClose).toHaveBeenCalled()

    // Click Close top X button
    fireEvent.click(screen.getByText('×'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('renders fallback description when description is empty', () => {
    const todo = { title: 'No desc task', status: 'pending' }
    render(<TodoDetailModal isOpen={true} onClose={vi.fn()} todo={todo} />)
    expect(screen.getByText('(Tidak ada deskripsi)')).toBeInTheDocument()
  })
})
