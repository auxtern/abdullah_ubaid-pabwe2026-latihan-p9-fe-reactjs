import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Swal from 'sweetalert2'
import App from './App'
import * as api from './services/api'

describe('App Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true })
    window.history.pushState({}, '', '/')
  })

  it('renders guest view with hero CTA, browses templates without sidebar and navigates to login/register', async () => {
    vi.spyOn(api, 'apiRequest').mockImplementation((endpoint) => {
      if (endpoint === '/templates') {
        return Promise.resolve({
          data: [
            { id: 1, title: 'Template Publik Pertama', description: 'Desc tpl', todos: [] },
          ],
        })
      }
      return Promise.resolve({ data: [] })
    })

    render(<App />)

    // Verify Halaman Umum has NO sidebar and directly renders TemplateCatalog
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(screen.getByText('Todolist Pro')).toBeInTheDocument()
    expect(screen.getByText('Template Todolist Publik')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Daftar' })).toBeInTheDocument()

    // Template items are displayed directly on public page
    await waitFor(() => {
      expect(screen.getByText('Template Publik Pertama')).toBeInTheDocument()
    })

    // Header buttons (Todolist Pro & Template Publik) keep user on template catalog
    fireEvent.click(screen.getByText('Todolist Pro'))
    expect(screen.getByText('Template Todolist Publik')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Template Publik'))
    expect(screen.getByText('Template Todolist Publik')).toBeInTheDocument()

    // Toggle theme & accent in guest header
    fireEvent.click(screen.getByLabelText('Toggle Mode Gelap Terang'))
    fireEvent.click(screen.getByLabelText('Tema Emerald'))

    // Click Masuk to navigate to /login
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(screen.getByText('Masuk ke Todolist')).toBeInTheDocument()

    // From /login return to /
    fireEvent.click(screen.getByText('← Kembali ke Halaman Utama'))
    expect(screen.getByText('Template Todolist Publik')).toBeInTheDocument()

    // Test popstate
    window.history.pushState({}, '', '/')
    fireEvent(window, new PopStateEvent('popstate'))
    expect(screen.getByText('Template Todolist Publik')).toBeInTheDocument()

    // Click Daftar to navigate to /register
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(screen.getByText('Daftar Akun Todolist')).toBeInTheDocument()
  })

  it('handles user login, registration, and logout flows via /login and /register', async () => {
    vi.spyOn(api, 'apiRequest').mockImplementation((endpoint, method, data) => {
      if (endpoint === '/auth/login') {
        return Promise.resolve({
          data: {
            token: 'jwt-123',
            user: { id: 1, username: 'loginuser', role: 'member' },
          },
        })
      }
      if (endpoint === '/auth/register') {
        return Promise.resolve({
          data: {
            token: 'jwt-456',
            user: { id: 2, username: 'reguser', role: 'member' },
          },
        })
      }
      if (endpoint === '/auth/logout') {
        return Promise.resolve({ success: true })
      }
      return Promise.resolve({ data: [] })
    })

    window.history.pushState({}, '', '/login')
    render(<App />)

    // Perform Login on /login
    expect(screen.getByText('Masuk ke Todolist')).toBeInTheDocument()
    fireEvent.change(document.getElementById('login-username'), { target: { value: 'loginuser' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'password123' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(screen.getByText('Halo,')).toBeInTheDocument()
      expect(screen.getByText('loginuser')).toBeInTheDocument()
    })

    // Now sidebar is rendered for logged-in user
    expect(screen.getByRole('complementary')).toBeInTheDocument()

    // Open and close mobile menu
    fireEvent.click(screen.getByLabelText('Toggle Navigation'))
    const overlay = document.querySelector('.bg-slate-900\\/40')
    if (overlay) fireEvent.click(overlay)

    // Click Tugasku in sidebar nav
    fireEvent.click(screen.getByText('Tugasku'))

    // Click brand logo in sidebar to reset tab
    fireEvent.click(screen.getByText('Todolist Pro'))

    // Logout
    fireEvent.click(screen.getByText('Keluar'))
    await waitFor(() => {
      // Returned to public view without sidebar
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument()
    })

    // Navigate to /register and perform registration
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(screen.getByText('Daftar Akun Todolist')).toBeInTheDocument()

    fireEvent.change(document.getElementById('register-username'), { target: { value: 'reguser' } })
    fireEvent.change(document.getElementById('register-email'), { target: { value: 'reg@example.com' } })
    fireEvent.change(document.getElementById('register-password'), { target: { value: 'password123' } })
    fireEvent.click(document.getElementById('register-submit'))

    await waitFor(() => {
      expect(screen.getByText('reguser')).toBeInTheDocument()
      expect(screen.getByRole('complementary')).toBeInTheDocument()
    })
  })

  it('renders logged in member dashboard with todos, stats, modals, and actions', async () => {
    api.setToken('test-token')
    api.setUser({ id: 10, username: 'johndoe', role: 'member' })

    const sampleTodos = [
      { id: 1, title: 'Tugas Pertama', status: 'pending', due_date: null, description: 'Catatan pertama' },
    ]
    const sampleGroups = [
      { id: 100, title: 'Kelompok Utama', is_public: true },
      { id: 101, title: 'Kelompok Kedua', is_public: false },
    ]
    const sampleStats = { total: 1, total_selesai: 0, belum_selesai: 1 }

    vi.spyOn(api, 'apiRequest').mockImplementation((endpoint, method = 'GET', data) => {
      if (endpoint === '/templates') return Promise.resolve({ data: [{ id: 10, title: 'Tpl Test', todos: [] }] })
      if (endpoint.startsWith('/todos?')) return Promise.resolve({ data: sampleTodos })
      if (endpoint === '/todos' && method === 'GET') return Promise.resolve({ data: sampleTodos })
      if (endpoint === '/todo-groups' && method === 'GET') return Promise.resolve({ data: sampleGroups })
      if (endpoint === '/todos/stats') return Promise.resolve({ data: sampleStats })
      if (endpoint === '/todos/1/status') return Promise.resolve({ success: true })
      if (endpoint === '/todos' && method === 'POST') return Promise.resolve({ data: { id: 2, ...data } })
      if (endpoint === '/todos/1' && method === 'PUT') return Promise.resolve({ data: { id: 1, ...data } })
      if (endpoint === '/todos/1' && method === 'DELETE') return Promise.resolve({ success: true })
      if (endpoint === '/templates/10/clone') return Promise.resolve({ success: true })
      if (endpoint === '/todo-groups' && method === 'POST') return Promise.resolve({ data: { id: 77, title: data.title, is_public: true } })
      if (endpoint === '/todos/ai-generate') {
        return Promise.resolve({
          data: {
            items: [{ title: 'AI Generated 1', description: 'AI Desc' }],
          },
        })
      }
      return Promise.resolve({ data: [] })
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Tugas Pertama')).toBeInTheDocument()
      expect(screen.getByTestId('stat-total')).toHaveTextContent('1')
    })

    // Toggle status
    fireEvent.click(screen.getByLabelText('checkbox-1'))

    // Open detail on new page via clicking title
    fireEvent.click(screen.getByText('Tugas Pertama'))
    await waitFor(() => {
      expect(screen.getByTestId('todo-detail-page')).toBeInTheDocument()
    })

    // Update cover on detail page
    fireEvent.click(screen.getByText('URL Gambar'))
    fireEvent.change(screen.getByPlaceholderText('Masukkan URL Gambar (https://...)'), {
      target: { value: 'https://example.com/cover.jpg' },
    })
    fireEvent.click(screen.getByText('Simpan URL'))

    // Return to list
    fireEvent.click(screen.getByText('Kembali ke Todolist'))
    await waitFor(() => {
      expect(screen.queryByTestId('todo-detail-page')).not.toBeInTheDocument()
    })

    // Re-open detail to test actions on detail page
    fireEvent.click(screen.getByText('Tugas Pertama'))
    await waitFor(() => {
      expect(screen.getByTestId('todo-detail-page')).toBeInTheDocument()
    })

    // Edit from detail page
    fireEvent.click(screen.getByText('Edit Todo'))
    expect(screen.getByTestId('todo-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Batal'))

    // Toggle status from detail page
    fireEvent.click(screen.getByText('Tandai Selesai'))

    // Return to list
    fireEvent.click(screen.getByText('Kembali ke Todolist'))
    await waitFor(() => {
      expect(screen.queryByTestId('todo-detail-page')).not.toBeInTheDocument()
    })

    // Open Edit modal via kebab
    fireEvent.click(screen.getByLabelText('kebab-1'))
    fireEvent.click(screen.getByText(/Ubah Edit/i))
    expect(screen.getByTestId('todo-modal')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Judul Tugas'), { target: { value: 'Tugas Pertama Diubah' } })
    fireEvent.click(screen.getByText('Simpan Tugas'))

    // Delete todo via kebab
    fireEvent.click(screen.getByLabelText('kebab-1'))
    fireEvent.click(screen.getByText(/Hapus/i))

    // Open AI Generator Modal and close it
    fireEvent.click(screen.getByText('AI Generator'))
    expect(screen.getByTestId('ai-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Tutup'))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()

    // Open AI Generator Modal and trigger generate
    fireEvent.click(screen.getByText('AI Generator'))
    expect(screen.getByTestId('ai-modal')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Prompt AI'), { target: { value: 'Belajar Go' } })
    fireEvent.click(screen.getByText('Hasilkan via AI'))

    await waitFor(() => {
      expect(screen.getByText('AI Generated 1')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Simpan Semua ke Daftar Todo'))

    // Open Create Todo Modal & Cancel
    fireEvent.click(screen.getByText('Tambah Todo'))
    expect(screen.getByTestId('todo-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Batal'))
    expect(screen.queryByTestId('todo-modal')).not.toBeInTheDocument()

    // Open Create Todo Modal & Submit
    fireEvent.click(screen.getByText('Tambah Todo'))
    expect(screen.getByTestId('todo-modal')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Judul Tugas'), { target: { value: 'Tugas Tambah Baru' } })
    fireEvent.click(screen.getByText('Simpan Tugas'))
    await waitFor(() => {
      expect(screen.queryByTestId('todo-modal')).not.toBeInTheDocument()
    })

    // Search input change
    fireEvent.change(screen.getByPlaceholderText('Cari judul...'), { target: { value: 'Tugas' } })
    fireEvent.change(screen.getByPlaceholderText('Cari judul...'), { target: { value: '' } })

    // Filter group change
    fireEvent.change(screen.getByLabelText('Filter Kelompok'), { target: { value: '100' } })
    fireEvent.click(screen.getAllByText('Kelompok Utama')[0])
    fireEvent.click(screen.getAllByText('Semua Kelompok Todo')[0])

    // Clone template test
    fireEvent.click(screen.getByText('Template Publik'))
    await waitFor(() => {
      expect(screen.getByTestId('template-catalog')).toBeInTheDocument()
    })
    // Clone template directly
    fireEvent.click(screen.getByText('Gunakan Template'))

    // Create public template test
    fireEvent.click(screen.getByText('Tambah Template Publik'))
    expect(screen.getByText('Tambah Template Publik Baru')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Judul Template'), { target: { value: 'Template Baru' } })
    fireEvent.change(screen.getByLabelText('Judul Tugas 1'), { target: { value: 'Item Baru' } })
    fireEvent.click(screen.getByText('Simpan Template Publik'))
    await waitFor(() => {
      expect(screen.getByText('Template publik baru berhasil ditambahkan!')).toBeInTheDocument()
    })

    // Switch to Template Publik tab and create public template via AI
    fireEvent.click(screen.getByText('Template Publik'))
    fireEvent.click(screen.getAllByText('Generate Template AI')[0])
    expect(screen.getByTestId('ai-template-modal')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Topik Template AI'), { target: { value: 'Template AI Topic' } })
    fireEvent.click(screen.getByText('Hasilkan Template AI'))
    await waitFor(() => {
      expect(screen.getByTestId('ai-template-result-preview')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Simpan Sebagai Template Publik'))
    await waitFor(() => {
      expect(screen.getByText('Template publik baru berhasil ditambahkan!')).toBeInTheDocument()
    })
  }, 20000)

  it('navigates away from detail page when clicking menu tabs', async () => {
    api.setToken('test-token')
    api.setUser({ id: 10, username: 'johndoe', role: 'member' })

    const sampleTodos = [
      { id: 1, title: 'Tugas Detail Nav', status: 'pending', due_date: null, description: 'Catatan nav' },
    ]
    vi.spyOn(api, 'apiRequest').mockImplementation((endpoint) => {
      if (endpoint === '/templates') return Promise.resolve({ data: [{ id: 10, title: 'Tpl Test', todos: [] }] })
      if (endpoint === '/todos') return Promise.resolve({ data: sampleTodos })
      return Promise.resolve({ data: [] })
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Tugas Detail Nav')).toBeInTheDocument()
    })

    // Open detail
    fireEvent.click(screen.getByText('Tugas Detail Nav'))
    await waitFor(() => {
      expect(screen.getByTestId('todo-detail-page')).toBeInTheDocument()
    })

    // Click "Template Publik" in sidebar
    fireEvent.click(screen.getByText('Template Publik'))
    await waitFor(() => {
      expect(screen.queryByTestId('todo-detail-page')).not.toBeInTheDocument()
      expect(screen.getByTestId('template-catalog')).toBeInTheDocument()
    })

    // Click "Tugasku" in sidebar to return
    fireEvent.click(screen.getByText('Tugasku'))
    await waitFor(() => {
      expect(screen.queryByTestId('todo-detail-page')).not.toBeInTheDocument()
      expect(screen.getByText('Tugas Detail Nav')).toBeInTheDocument()
    })
  })

  it('handles error branches on actions', async () => {
    api.setToken('test-token')
    api.setUser({ id: 10, username: 'johndoe', role: 'member' })

    const sampleTodos = [{ id: 1, title: 'Tugas Fail', status: 'pending' }]

    vi.spyOn(api, 'apiRequest').mockImplementation((endpoint, method = 'GET') => {
      if (endpoint === '/templates') return Promise.resolve({ data: [{ id: 99, title: 'Tpl Fail', todos: [] }] })
      if (endpoint === '/todos' && method === 'GET') return Promise.resolve({ data: sampleTodos })
      if (endpoint === '/todos/1/status') return Promise.reject(new Error('Gagal update status'))
      if (endpoint === '/todos' && method === 'POST') return Promise.reject(new Error('Gagal simpan'))
      if (endpoint === '/todos/1' && method === 'DELETE') return Promise.reject(new Error('Gagal hapus'))
      if (endpoint === '/todos/ai-generate') return Promise.reject(new Error('AI API Error'))
      if (endpoint === '/templates/99/clone' && method === 'POST') return Promise.reject(new Error('Gagal clone'))
      if (endpoint === '/todo-groups' && method === 'POST') return Promise.reject(new Error('Gagal buat template'))
      return Promise.resolve({ data: [] })
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Tugas Fail')).toBeInTheDocument()
    })

    // Toggle status error
    fireEvent.click(screen.getByLabelText('checkbox-1'))
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Gagal update status' })
      )
    })

    // Create Todo error
    fireEvent.click(screen.getByText('Tambah Todo'))
    fireEvent.change(screen.getByLabelText('Judul Tugas'), { target: { value: 'New task' } })
    fireEvent.click(screen.getByText('Simpan Tugas'))
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Gagal simpan' })
      )
    })

    // Delete todo cancelled
    vi.spyOn(Swal, 'fire').mockResolvedValueOnce({ isConfirmed: false })
    fireEvent.click(screen.getByLabelText('kebab-1'))
    fireEvent.click(screen.getByText(/Hapus/i))

    // Delete todo error
    vi.spyOn(Swal, 'fire').mockResolvedValueOnce({ isConfirmed: true })
    fireEvent.click(screen.getByLabelText('kebab-1'))
    fireEvent.click(screen.getByText(/Hapus/i))
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Gagal hapus' })
      )
    })

    // AI generator error
    fireEvent.click(screen.getByText('AI Generator'))
    fireEvent.change(screen.getByLabelText('Prompt AI'), { target: { value: 'fail prompt' } })
    fireEvent.click(screen.getByText('Hasilkan via AI'))
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'AI API Error' })
      )
    })

    // Clone template error
    fireEvent.click(screen.getByText('Template Publik'))
    await waitFor(() => {
      expect(screen.getByText('Tpl Fail')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Gunakan Template'))
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Gagal clone' })
      )
    })

    // Create template error
    fireEvent.click(screen.getByText('Tambah Template Publik'))
    fireEvent.change(screen.getByLabelText('Judul Template'), { target: { value: 'Template Error' } })
    fireEvent.click(screen.getByText('Simpan Template Publik'))
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Gagal buat template' })
      )
    })

    // Return to todos tab
    fireEvent.click(screen.getByText('Tugasku'))
    await waitFor(() => {
      expect(screen.getByText('Tugas Fail')).toBeInTheDocument()
    })

    // Open detail page
    fireEvent.click(screen.getByText('Tugas Fail'))
    await waitFor(() => {
      expect(screen.getByTestId('todo-detail-page')).toBeInTheDocument()
    })

    // Update cover error branch
    vi.spyOn(api, 'apiRequest').mockRejectedValueOnce(new Error('Gagal update cover'))
    fireEvent.click(screen.getByText('URL Gambar'))
    fireEvent.change(screen.getByPlaceholderText('Masukkan URL Gambar (https://...)'), {
      target: { value: 'https://bad.url/image.png' },
    })
    fireEvent.click(screen.getByText('Simpan URL'))
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Gagal update cover' })
      )
    })

    // Delete from detail page
    vi.spyOn(api, 'apiRequest').mockResolvedValueOnce({ success: true })
    fireEvent.click(screen.getByText('Hapus'))
    await waitFor(() => {
      expect(screen.queryByTestId('todo-detail-page')).not.toBeInTheDocument()
    })
  })

  it('renders admin dashboard tab and inspects user todos with error handling', async () => {
    api.setToken('admin-token')
    api.setUser({ id: 1, username: 'admin', role: 'admin' })

    vi.spyOn(api, 'apiRequest').mockImplementation((endpoint) => {
      if (endpoint === '/admin/users') {
        return Promise.resolve({
          data: [
            { id: 2, username: 'memberuser', email: 'mem@delcom.org', role: 'member', total_todos: 3, total_selesai: 1 },
          ],
        })
      }
      if (endpoint.startsWith('/admin/users/2/todos')) {
        return Promise.resolve({
          data: [{ id: 50, title: 'Tugas Member 2', description: 'Desc', status: 'pending' }],
        })
      }
      return Promise.resolve({ data: [] })
    })

    render(<App />)

    expect(screen.getByText('Panel Admin')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Panel Admin'))

    await waitFor(() => {
      expect(screen.getByText('Panel Pengawasan Administrator')).toBeInTheDocument()
      expect(screen.getByText('memberuser')).toBeInTheDocument()
    })

    // Inspect user todos success
    fireEvent.click(screen.getByText('Monitoring Todo'))
    await waitFor(() => {
      expect(screen.getByText('Monitoring Tugas Pengguna: memberuser (Read-Only)')).toBeInTheDocument()
      expect(screen.getByText('Tugas Member 2')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Tutup Pemantauan'))

    // Inspect user todos error branch
    vi.spyOn(api, 'apiRequest').mockImplementation((endpoint) => {
      if (endpoint.startsWith('/admin/users/2/todos')) {
        return Promise.reject(new Error('Gagal load user todos'))
      }
      return Promise.resolve({ data: [] })
    })
    fireEvent.click(screen.getByText('Monitoring Todo'))
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Gagal load user todos' })
      )
    })
  })
})
