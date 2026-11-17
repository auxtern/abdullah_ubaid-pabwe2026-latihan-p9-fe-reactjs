import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AdminDashboard from './AdminDashboard'

describe('AdminDashboard Component', () => {
  it('renders empty table when no users', () => {
    render(<AdminDashboard users={[]} onLoadUserTodos={vi.fn()} />)
    expect(screen.getByText('Tidak ada data pengguna.')).toBeInTheDocument()
  })

  it('renders users list and inspects user todos in read-only modal', async () => {
    const onLoadUserTodos = vi.fn().mockImplementation((userId) => {
      if (userId === 2) {
        return Promise.resolve([
          { id: 101, title: 'Task Milik Member', description: 'Desc task', status: 'completed' },
        ])
      }
      return Promise.resolve([])
    })

    const users = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@delcom.org',
        role: 'admin',
        total_todos: 5,
        total_selesai: 3,
      },
      {
        id: 2,
        username: 'member1',
        email: 'member1@delcom.org',
        role: 'member',
        total_todos: 2,
        total_selesai: 1,
      },
    ]

    render(<AdminDashboard users={users} onLoadUserTodos={onLoadUserTodos} />)

    expect(screen.getAllByText('admin')[0]).toBeInTheDocument()
    expect(screen.getByText('member1')).toBeInTheDocument()

    // Click monitoring todo on member1
    const buttons = screen.getAllByText('Monitoring Todo')
    fireEvent.click(buttons[1])

    expect(onLoadUserTodos).toHaveBeenCalledWith(2)

    await waitFor(() => {
      expect(screen.getByText('Monitoring Tugas Pengguna: member1 (Read-Only)')).toBeInTheDocument()
      expect(screen.getByText('Task Milik Member')).toBeInTheDocument()
    })

    // Close inspected modal
    fireEvent.click(screen.getByText('Tutup Pemantauan'))
    expect(screen.queryByText('Monitoring Tugas Pengguna: member1 (Read-Only)')).not.toBeInTheDocument()

    // Inspect user with empty todos
    fireEvent.click(buttons[0])
    await waitFor(() => {
      expect(screen.getByText('Pengguna ini belum memiliki tugas.')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('×'))
  })
})
