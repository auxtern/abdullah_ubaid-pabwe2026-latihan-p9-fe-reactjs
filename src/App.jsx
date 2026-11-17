import React, { useState, useEffect } from 'react'
import {
  IconListCheck,
  IconTemplate,
  IconUsers,
  IconLogout,
  IconMenu2,
  IconX,
  IconSparkles,
  IconPlus,
  IconSun,
  IconMoon,
  IconSearch,
} from '@tabler/icons-react'
import {
  apiRequest,
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
} from './services/api'
import TodoStats from './features/todo/components/TodoStats'
import TodoList from './features/todo/components/TodoList'
import TodoDetailPage from './features/todo/components/TodoDetailPage'
import TodoModal from './features/todo/modals/TodoModal'
import AiGeneratorModal from './features/todo/modals/AiGeneratorModal'
import TemplateCatalog from './features/template/components/TemplateCatalog'
import AdminDashboard from './features/admin/components/AdminDashboard'
import AuthModal from './features/auth/modals/AuthModal'
import AuthPage from './features/auth/components/AuthPage'
import useTheme from './hooks/useTheme'
import { showErrorAlert, showConfirmDialog } from './helpers/toolsHelper'

export default function App() {
  const { mode, accent, toggleMode, changeAccent, accents } = useTheme()
  const [currentUser, setCurrentUser] = useState(getUser())
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/')
  const [activeTab, setActiveTab] = useState('todos') // todos, templates, admin
  const [todos, setTodos] = useState([])
  const [groups, setGroups] = useState([])
  const [stats, setStats] = useState({ total: 0, total_selesai: 0, belum_selesai: 0 })
  const [templates, setTemplates] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Filter
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState(null)

  // Loading indicator
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const showNotification = (msg) => {
    setStatusMessage(msg)
    setTimeout(() => setStatusMessage(''), 3000)
  }

  // Load Initial Data
  const loadInitialData = async () => {
    // Load public templates
    const tplRes = await apiRequest('/templates').catch(() => ({ data: [] }))
    setTemplates(tplRes.data || [])

    // If user logged in, load user todos, groups, and stats
    if (getToken()) {
      const query = selectedGroupId ? `?todo_group_id=${selectedGroupId}` : ''
      const [tdRes, grpRes, stRes] = await Promise.all([
        apiRequest(`/todos${query}`).catch(() => ({ data: [] })),
        apiRequest('/todo-groups').catch(() => ({ data: [] })),
        apiRequest('/todos/stats').catch(() => ({ data: null })),
      ])
      setTodos(tdRes.data || [])
      setGroups(grpRes.data || [])
      setStats(stRes.data || { total: 0, total_selesai: 0, belum_selesai: 0 })

      // If admin, load admin users
      const u = getUser()
      if (u && u.role === 'admin') {
        const admRes = await apiRequest('/admin/users').catch(() => ({ data: [] }))
        setAdminUsers(admRes.data || [])
      }
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [currentUser, selectedGroupId])

  useEffect(() => {
    const match = currentPath.match(/^\/todos\/(\d+)$/)
    if (match && getToken()) {
      const id = match[1]
      apiRequest(`/todos/${id}`)
        .then((res) => {
          if (res.data) setSelectedTodo(res.data)
        })
        .catch(() => {})
    }
  }, [currentPath])

  // Auth Handlers
  const handleLogin = async (credentials) => {
    const res = await apiRequest('/auth/login', 'POST', credentials)
    setToken(res.data.token)
    setUser(res.data.user)
    setCurrentUser(res.data.user)
    showNotification('Berhasil masuk!')
    navigate('/')
  }

  const handleRegister = async (data) => {
    const res = await apiRequest('/auth/register', 'POST', data)
    setToken(res.data.token)
    setUser(res.data.user)
    setCurrentUser(res.data.user)
    showNotification('Pendaftaran berhasil!')
    navigate('/')
  }

  const handleLogout = async () => {
    await apiRequest('/auth/logout', 'POST').catch(() => {})
    removeToken()
    removeUser()
    setCurrentUser(null)
    setTodos([])
    setGroups([])
    setStats({ total: 0, total_selesai: 0, belum_selesai: 0 })
    setActiveTab('todos')
    showNotification('Berhasil keluar.')
    navigate('/')
  }

  // Todo Handlers
  const handleToggleStatus = async (todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed'
    try {
      await apiRequest(`/todos/${todo.id}/status`, 'PATCH', { status: newStatus })
      setSelectedTodo((prev) => (prev && prev.id === todo.id ? { ...prev, status: newStatus } : prev))
      loadInitialData()
      showNotification('Status tugas diperbarui.')
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const handleSaveTodo = async (todoData) => {
    try {
      if (selectedTodo && selectedTodo.id) {
        const res = await apiRequest(`/todos/${selectedTodo.id}`, 'PUT', todoData)
        showNotification('Tugas berhasil diperbarui!')
        const updated = res.data || { ...selectedTodo, ...todoData }
        setSelectedTodo(updated)
        setTodos((prev) => prev.map((t) => (t.id === selectedTodo.id ? { ...t, ...updated } : t)))
      } else {
        await apiRequest('/todos', 'POST', todoData)
        showNotification('Tugas baru berhasil ditambahkan!')
      }
      setIsTodoModalOpen(false)
      loadInitialData()
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const handleUpdateCover = async (todoId, coverData) => {
    try {
      const res = await apiRequest(`/todos/${todoId}`, 'PUT', {
        cover_image_path: coverData,
      })
      const updated = res.data || { cover_image_path: coverData === 'DELETE' ? '' : coverData }
      setSelectedTodo((prev) => (prev ? { ...prev, ...updated } : prev))
      setTodos((prev) => prev.map((t) => (t.id === todoId ? { ...t, ...updated } : t)))
      showNotification(coverData === 'DELETE' ? 'Cover berhasil dihapus.' : 'Cover berhasil diperbarui!')
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const handleDeleteTodo = async (id) => {
    const confirmed = await showConfirmDialog('Apakah Anda yakin ingin menghapus tugas ini?')
    if (!confirmed) return
    try {
      await apiRequest(`/todos/${id}`, 'DELETE')
      showNotification('Tugas berhasil dihapus.')
      loadInitialData()
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const handleCloneTemplate = async (templateId) => {
    try {
      await apiRequest(`/templates/${templateId}/clone`, 'POST')
      showNotification('Template berhasil dikloning ke tugas Anda!')
      setActiveTab('todos')
      loadInitialData()
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const handleCreateTemplate = async (templateData) => {
    try {
      const groupRes = await apiRequest('/todo-groups', 'POST', {
        title: templateData.title,
        description: templateData.description,
        is_public: true,
      })

      const newGroup = groupRes?.data
      if (newGroup && newGroup.id && templateData.items && templateData.items.length > 0) {
        for (const item of templateData.items) {
          if (item.title && item.title.trim()) {
            await apiRequest('/todos', 'POST', {
              title: item.title.trim(),
              description: item.description || '',
              todo_group_id: newGroup.id,
              status: 'pending',
            })
          }
        }
      }

      showNotification('Template publik baru berhasil ditambahkan!')
      loadInitialData()
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const handleGenerateAi = async (params) => {
    setLoading(true)
    try {
      const res = await apiRequest('/todos/ai-generate', 'POST', params)
      return res.data ? res.data : { items: [], search_sources: [] }
    } catch (err) {
      showErrorAlert(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBatchAi = async (items) => {
    for (const item of items) {
      await apiRequest('/todos', 'POST', {
        title: item.title,
        description: item.description,
        status: item.status || 'pending',
      })
    }
    showNotification(`${items.length} tugas AI berhasil disimpan!`)
    loadInitialData()
  }

  const handleLoadUserTodos = async (targetUserId) => {
    try {
      const res = await apiRequest(`/admin/users/${targetUserId}/todos`)
      return res.data || []
    } catch (err) {
      showErrorAlert(err.message)
      return []
    }
  }

  const filteredTodos = todos.filter((todo) => {
    if (!searchQuery.trim()) return true
    return todo.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Full page polos Login
  if (currentPath === '/login') {
    return (
      <div data-testid="app-container">
        <AuthPage
          mode="login"
          onLogin={handleLogin}
          onRegister={handleRegister}
          onNavigate={navigate}
        />
      </div>
    )
  }

  // Full page polos Register
  if (currentPath === '/register') {
    return (
      <div data-testid="app-container">
        <AuthPage
          mode="register"
          onLogin={handleLogin}
          onRegister={handleRegister}
          onNavigate={navigate}
        />
      </div>
    )
  }

  // Halaman Umum (Public View when !currentUser) - GAK ADA SIDEBAR!
  if (!currentUser) {
    return (
      <div
        className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors"
        data-testid="app-container"
      >
        {/* Public Header - Tanpa Sidebar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div
            onClick={() => {
              setActiveTab('templates')
              navigate('/')
            }}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              T
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight block">
                Todolist Pro
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-1.5 py-0.5 rounded">
                P9 Go & React
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('templates')
                navigate('/')
              }}
              className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 transition cursor-pointer"
            >
              Template Publik
            </button>

            {/* Mode toggle */}
            <button
              type="button"
              onClick={toggleMode}
              aria-label="Toggle Mode Gelap Terang"
              title={`Ganti ke Mode ${mode === 'dark' ? 'Terang' : 'Gelap'}`}
              className="p-1.5 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm cursor-pointer"
            >
              {mode === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </button>

            {/* Color Accent Picker */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              {accents.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => changeAccent(item.id)}
                  aria-label={`Tema ${item.name}`}
                  title={`Tema ${item.name}`}
                  className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                    accent === item.id ? 'scale-125 ring-2 ring-primary-500' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: item.hex }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-3.5 py-1.5 rounded-xl text-sm font-semibold border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition cursor-pointer"
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="px-3.5 py-1.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition cursor-pointer"
            >
              Daftar
            </button>
          </div>
        </header>

        {/* Flash Notifications */}
        {statusMessage && (
          <div className="m-4 mb-0 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-xs animate-fadeIn">
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Main Content Area - Memenuhi Layar Langsung Template Todolist Publik */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          <TemplateCatalog
            templates={templates}
            onClone={handleCloneTemplate}
            onCreateTemplate={handleCreateTemplate}
            onGenerateAi={handleGenerateAi}
            user={currentUser}
            onRequireLogin={() => navigate('/login')}
          />
        </main>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </div>
    )
  }

  // Authenticated Member/Admin Dashboard - ADA SIDEBAR
  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors"
      data-testid="app-container"
    >
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            T
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">Todolist</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMode}
            className="p-1.5 text-slate-600 dark:text-slate-300 rounded-lg text-sm"
          >
            {mode === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation - HANYA MUNCUL JIKA USER LOGIN */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:sticky md:top-0 md:h-screen md:max-h-screen md:self-start shrink-0 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div
            onClick={() => {
              setActiveTab('todos')
              setSelectedTodo(null)
              navigate('/')
              setMobileMenuOpen(false)
            }}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              T
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight block cursor-pointer">
                Todolist Pro
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-1.5 py-0.5 rounded">
                P9 Go & React
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-600 text-white font-bold flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            <span>{currentUser.username?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Halo, <strong className="text-slate-800 dark:text-slate-200">{currentUser.username}</strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{currentUser.username}</p>
            <span
              className={`inline-block text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full ${
                currentUser.role === 'admin'
                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {currentUser.role?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 min-h-0 px-4 space-y-1.5 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('todos')
              setSelectedTodo(null)
              navigate('/')
              setMobileMenuOpen(false)
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer text-left ${
              activeTab === 'todos'
                ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <IconListCheck size={20} className="shrink-0" />
            <span>Tugasku</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('templates')
              setSelectedTodo(null)
              navigate('/')
              setMobileMenuOpen(false)
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer text-left ${
              activeTab === 'templates'
                ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <IconTemplate size={20} className="shrink-0" />
            <span>Template Publik</span>
          </button>

          {currentUser.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Admin Area
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin')
                  setSelectedTodo(null)
                  navigate('/')
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer text-left ${
                  activeTab === 'admin'
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <IconUsers size={20} className="shrink-0" />
                <span>Panel Admin</span>
              </button>
            </div>
          )}
        </nav>

        {/* Theme & Mode Switcher Controls in Sidebar */}
        <div className="p-4 mx-4 mb-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2.5 shrink-0 mt-auto">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Tema Warna</span>
            <button
              type="button"
              onClick={toggleMode}
              aria-label="Toggle Mode Gelap Terang"
              title={`Ganti ke Mode ${mode === 'dark' ? 'Terang' : 'Gelap'}`}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-xs"
            >
              {mode === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </button>
          </div>
          <div className="flex items-center justify-between pt-1">
            {accents.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changeAccent(item.id)}
                aria-label={`Tema ${item.name}`}
                title={`Tema ${item.name}`}
                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                  accent === item.id
                    ? 'scale-125 ring-2 ring-offset-2 ring-primary-500'
                    : 'opacity-60 hover:opacity-100 hover:scale-110'
                }`}
                style={{ backgroundColor: item.hex }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Auth Action */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
          >
            <IconLogout size={20} className="text-rose-500 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Flash Notifications */}
        {statusMessage && (
          <div className="m-4 mb-0 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-xs animate-fadeIn">
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {activeTab === 'templates' ? (
            <TemplateCatalog
              templates={templates}
              onClone={handleCloneTemplate}
              onCreateTemplate={handleCreateTemplate}
              onGenerateAi={handleGenerateAi}
              user={currentUser}
              onRequireLogin={() => navigate('/login')}
            />
          ) : activeTab === 'admin' && currentUser.role === 'admin' ? (
            <AdminDashboard
              users={adminUsers}
              onLoadUserTodos={handleLoadUserTodos}
            />
          ) : currentPath.match(/^\/todos\/(\d+)$/) ? (
            <TodoDetailPage
              todo={selectedTodo || todos.find((t) => t.id === Number(currentPath.match(/^\/todos\/(\d+)$/)[1]))}
              groups={groups}
              onBack={() => {
                setSelectedTodo(null)
                navigate('/')
              }}
              onEdit={(todoToEdit) => {
                const detailId = Number(currentPath.match(/^\/todos\/(\d+)$/)[1])
                const target = todoToEdit || selectedTodo || todos.find((t) => t.id === detailId)
                setSelectedTodo(target)
                setIsTodoModalOpen(true)
              }}
              onToggleStatus={handleToggleStatus}
              onDelete={async (id) => {
                await handleDeleteTodo(id)
                navigate('/')
              }}
              onUpdateCover={handleUpdateCover}
            />
          ) : (
            <div className="w-full space-y-6">
              {/* Header Title (Full Width) */}
              <div className="w-full">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Daftar Tugas & Kelompok
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Kelola aktivitas harian, kelompokkan ke dalam proyek, dan publikasikan sebagai template siap pakai.
                </p>
              </div>

              {/* Actions Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTodo(null)
                    setIsTodoModalOpen(true)
                  }}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  <IconPlus size={16} />
                  <span>Tambah Todo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  <IconSparkles size={16} className="text-purple-600 dark:text-purple-400" />
                  <span>AI Generator</span>
                </button>
              </div>

              {/* Statistics Summary Bar */}
              <TodoStats stats={stats} />

              {/* Groups Navigation Tabs */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Kelompok Todo:
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('templates')}
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Lihat Galeri Template Publik</span>
                    <span>&rarr;</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedGroupId('')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
                      !selectedGroupId
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Semua Kelompok Todo
                  </button>
                  {groups.map((grp) => (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => setSelectedGroupId(String(grp.id))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center space-x-1.5 cursor-pointer ${
                        selectedGroupId === String(grp.id)
                          ? 'bg-primary-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{grp.title}</span>
                      {grp.is_public && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            selectedGroupId === String(grp.id)
                              ? 'bg-primary-800 text-primary-100'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          Template
                        </span>
                      )}
                    </button>
                  ))}

                  {/* Filter Select for compatibility */}
                  <div className="ml-auto shrink-0">
                    <select
                      aria-label="Filter Kelompok"
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="px-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">Semua Kelompok</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Cari judul..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <IconSearch size={16} />
                  </span>
                </div>
              </div>

              {/* Todo List View */}
              <TodoList
                todos={filteredTodos}
                onToggleStatus={handleToggleStatus}
                onDetail={(todo) => {
                  setSelectedTodo(todo)
                  navigate(`/todos/${todo.id}`)
                }}
                onEdit={(todo) => {
                  setSelectedTodo(todo)
                  setIsTodoModalOpen(true)
                }}
                onDelete={handleDeleteTodo}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <TodoModal
        key={selectedTodo ? `edit-${selectedTodo.id}` : 'create'}
        isOpen={isTodoModalOpen}
        onClose={() => {
          setIsTodoModalOpen(false)
          if (!currentPath.match(/^\/todos\/(\d+)$/)) {
            setSelectedTodo(null)
          }
        }}
        onSave={handleSaveTodo}
        groups={groups}
        todo={selectedTodo || (currentPath.match(/^\/todos\/(\d+)$/) ? todos.find((t) => t.id === Number(currentPath.match(/^\/todos\/(\d+)$/)[1])) : null)}
        initialData={selectedTodo || (currentPath.match(/^\/todos\/(\d+)$/) ? todos.find((t) => t.id === Number(currentPath.match(/^\/todos\/(\d+)$/)[1])) : null)}
      />

      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerate={handleGenerateAi}
        onSaveBatch={handleSaveBatchAi}
        loading={loading}
      />
    </div>
  )
}
