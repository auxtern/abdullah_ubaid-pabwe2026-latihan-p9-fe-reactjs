import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TemplateCatalog from './TemplateCatalog'

describe('TemplateCatalog Component', () => {
  it('renders empty message when no templates', () => {
    render(<TemplateCatalog templates={[]} />)
    expect(screen.getByText('Belum ada template publik yang tersedia.')).toBeInTheDocument()
  })

  it('renders template list and triggers login requirement for guest', () => {
    const onClone = vi.fn()
    const onRequireLogin = vi.fn()

    const templates = [
      {
        id: 1,
        title: 'Template Belajar Web',
        description: 'Checklist belajar frontend & backend',
        todos: [{ title: 'Belajar HTML', description: 'HTML5 semantik' }],
      },
    ]

    render(
      <TemplateCatalog
        templates={templates}
        onClone={onClone}
        user={null}
        onRequireLogin={onRequireLogin}
      />
    )

    expect(screen.getByText('Template Belajar Web')).toBeInTheDocument()

    // Guest clicks Gunakan Template
    fireEvent.click(screen.getByText('Gunakan Template'))
    expect(onRequireLogin).toHaveBeenCalled()
    expect(onClone).not.toHaveBeenCalled()

    // Open detail preview modal
    fireEvent.click(screen.getByText('Lihat Tugas'))
    expect(screen.getByText('Detail Template: Template Belajar Web')).toBeInTheDocument()
    expect(screen.getAllByText('Belajar HTML')[0]).toBeInTheDocument()

    // Close preview modal via Tutup button
    fireEvent.click(screen.getByText('Tutup'))
    expect(screen.queryByText('Detail Template: Template Belajar Web')).not.toBeInTheDocument()
  })

  it('allows logged in user to clone from card or modal and shows empty todos notice', () => {
    const onClone = vi.fn()
    const templates = [
      {
        id: 2,
        title: 'Template Onboarding',
        description: 'Proses onboarding dev',
        todos: [],
      },
    ]

    render(
      <TemplateCatalog
        templates={templates}
        onClone={onClone}
        user={{ id: 1, username: 'tester' }}
        onRequireLogin={vi.fn()}
      />
    )

    // Direct clone from card
    fireEvent.click(screen.getByText('Gunakan Template'))
    expect(onClone).toHaveBeenCalledWith(2)

    // Filter by search
    const searchInput = screen.getByPlaceholderText('Cari nama template atau deskripsi...')
    fireEvent.change(searchInput, { target: { value: 'Onboarding' } })
    expect(screen.getByText('Template Onboarding')).toBeInTheDocument()
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } })
    expect(screen.queryByText('Template Onboarding')).not.toBeInTheDocument()
    fireEvent.change(searchInput, { target: { value: '' } })

    // Clone from modal with empty todos notice
    fireEvent.click(screen.getByText('Lihat Tugas'))
    expect(screen.getByText('Template ini belum memiliki tugas.')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Gunakan Template Ini'))
    expect(onClone).toHaveBeenCalledWith(2)
  })

  it('triggers onRequireLogin when guest clicks add template button', () => {
    const onRequireLogin = vi.fn()
    render(
      <TemplateCatalog
        templates={[]}
        user={null}
        onRequireLogin={onRequireLogin}
      />
    )

    fireEvent.click(screen.getByText('Tambah Template Publik'))
    expect(onRequireLogin).toHaveBeenCalled()
  })

  it('allows logged in user to open create modal and submit new template', () => {
    const onCreateTemplate = vi.fn()
    render(
      <TemplateCatalog
        templates={[]}
        user={{ id: 1, username: 'tester' }}
        onCreateTemplate={onCreateTemplate}
      />
    )

    // Click empty state add button
    fireEvent.click(screen.getByText('Tambah Template Publik Sekarang'))
    expect(screen.getByText('Tambah Template Publik Baru')).toBeInTheDocument()

    // Fill form
    fireEvent.change(screen.getByLabelText('Judul Template'), {
      target: { value: 'Template Desain UI' },
    })
    fireEvent.change(screen.getByLabelText('Deskripsi Template'), {
      target: { value: 'Langkah mendesain wireframe dan mockup' },
    })
    fireEvent.change(screen.getByLabelText('Judul Tugas 1'), {
      target: { value: 'Riset Moodboard' },
    })

    // Submit
    fireEvent.click(screen.getByText('Simpan Template Publik'))

    expect(onCreateTemplate).toHaveBeenCalledWith({
      title: 'Template Desain UI',
      description: 'Langkah mendesain wireframe dan mockup',
      items: [{ title: 'Riset Moodboard', description: '' }],
    })
  })

  it('triggers onRequireLogin when guest clicks Generate Template AI', () => {
    const onRequireLogin = vi.fn()
    render(
      <TemplateCatalog
        templates={[]}
        user={null}
        onRequireLogin={onRequireLogin}
      />
    )

    const aiButtons = screen.getAllByText('Generate Template AI')
    fireEvent.click(aiButtons[0])
    expect(onRequireLogin).toHaveBeenCalled()
  })

  it('allows logged in user to generate template via AI and switch from create modal to AI', async () => {
    const onGenerateAi = vi.fn().mockResolvedValue([
      { title: 'AI Item 1', description: 'Desc 1' },
    ])
    const onCreateTemplate = vi.fn()

    render(
      <TemplateCatalog
        templates={[]}
        user={{ id: 1, username: 'tester' }}
        onGenerateAi={onGenerateAi}
        onCreateTemplate={onCreateTemplate}
      />
    )

    // Open Create Modal first, then switch to AI
    fireEvent.click(screen.getByText('Tambah Template Publik'))
    expect(screen.getByText('Tambah Template Publik Baru')).toBeInTheDocument()

    // Click Gunakan AI inside Create modal
    fireEvent.click(screen.getByText('Gunakan AI'))
    expect(screen.getByTestId('ai-template-modal')).toBeInTheDocument()

    // Generate in AI modal
    fireEvent.change(screen.getByLabelText('Topik Template AI'), {
      target: { value: 'Belajar Next.js' },
    })
    fireEvent.click(screen.getByText('Hasilkan Template AI'))

    await waitFor(() => {
      expect(screen.getByTestId('ai-template-result-preview')).toBeInTheDocument()
    })

    // Save template
    fireEvent.click(screen.getByText('Simpan Sebagai Template Publik'))
    expect(onCreateTemplate).toHaveBeenCalledWith({
      title: 'Belajar Next.js',
      description: 'Paket template todolist untuk: Belajar Next.js (Dihasilkan dengan AI)',
      items: [{ title: 'AI Item 1', description: 'Desc 1' }],
    })
  })

  it('allows opening AI template modal from empty state button', () => {
    render(
      <TemplateCatalog
        templates={[]}
        user={{ id: 1, username: 'tester' }}
      />
    )

    const aiButtons = screen.getAllByText('Generate Template AI')
    fireEvent.click(aiButtons[1]) // empty state button
    expect(screen.getByTestId('ai-template-modal')).toBeInTheDocument()
  })
})
