import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TodoStats from './TodoStats'

describe('TodoStats Component', () => {
  it('renders default zeroes when no stats passed', () => {
    render(<TodoStats />)
    expect(screen.getByTestId('stat-total')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-selesai')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-belum')).toHaveTextContent('0')
  })

  it('renders passed stats correctly', () => {
    render(<TodoStats stats={{ total: 10, total_selesai: 6, belum_selesai: 4 }} />)
    expect(screen.getByTestId('stat-total')).toHaveTextContent('10')
    expect(screen.getByTestId('stat-selesai')).toHaveTextContent('6')
    expect(screen.getByTestId('stat-belum')).toHaveTextContent('4')
  })
})
