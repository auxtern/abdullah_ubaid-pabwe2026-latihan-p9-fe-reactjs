import React, { useRef, useState } from 'react'
import {
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconPencil,
  IconTrash,
  IconPhoto,
  IconFolder,
  IconCalendar,
} from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { formatDate } from '../../../helpers/toolsHelper'

export default function TodoDetailPage({
  todo,
  groups = [],
  onBack,
  onEdit,
  onToggleStatus,
  onDelete,
  onUpdateCover,
}) {
  const fileInputRef = useRef(null)
  const [urlInputOpen, setUrlInputOpen] = useState(false)
  const [coverUrl, setCoverUrl] = useState('')

  if (!todo) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 text-center" data-testid="todo-detail-not-found">
        <p className="text-slate-500 dark:text-slate-400">Tugas tidak ditemukan atau sedang dimuat...</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold cursor-pointer"
        >
          Kembali ke Todolist
        </button>
      </div>
    )
  }

  const isCompleted = todo.status === 'completed'
  const group = groups.find((g) => g.id === todo.todo_group_id)

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result
      if (base64 && onUpdateCover) {
        onUpdateCover(todo.id, base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUrlSubmit = (e) => {
    e.preventDefault()
    if (coverUrl.trim() && onUpdateCover) {
      onUpdateCover(todo.id, coverUrl.trim())
      setCoverUrl('')
      setUrlInputOpen(false)
    }
  }

  const handleDeleteCover = () => {
    if (onUpdateCover) {
      onUpdateCover(todo.id, 'DELETE')
    }
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn" data-testid="todo-detail-page">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <IconArrowLeft size={20} />
          <span>Kembali ke Todolist</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleStatus(todo)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition flex items-center space-x-1.5 cursor-pointer ${
              isCompleted
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <IconCheck size={16} />
            <span>{isCompleted ? 'Tandai Belum Selesai' : 'Tandai Selesai'}</span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(todo)}
            className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <IconPencil size={16} />
            <span>Edit Todo</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
          >
            <IconTrash size={16} />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Cover Section */}
        {todo.cover_image_path ? (
          <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-900 group overflow-hidden">
            <img
              src={todo.cover_image_path}
              alt={todo.title}
              className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-6">
              <div className="text-white">
                <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider">
                  Foto Sampul
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer px-3.5 py-2 bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold rounded-xl shadow-sm backdrop-blur-xs transition flex items-center gap-1.5">
                  <IconPhoto size={16} />
                  <span>Ganti Cover</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    aria-label="Upload Cover"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleDeleteCover}
                  className="px-3.5 py-2 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-sm backdrop-blur-xs transition cursor-pointer"
                >
                  Hapus Cover
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                <IconPhoto size={22} />
              </div>
              <span>Belum ada foto sampul (cover). Anda dapat mengunggah gambar pendukung tugas.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label className="cursor-pointer px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5">
                <IconPhoto size={16} />
                <span>+ Unggah Cover</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Upload Cover"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setUrlInputOpen(!urlInputOpen)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium rounded-xl transition cursor-pointer"
              >
                URL Gambar
              </button>
            </div>
          </div>
        )}

        {/* Optional URL Input Dropdown */}
        {urlInputOpen && (
          <form onSubmit={handleUrlSubmit} className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex gap-2">
            <input
              type="url"
              placeholder="Masukkan URL Gambar (https://...)"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Simpan URL
            </button>
          </form>
        )}

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                isCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                  : todo.status === 'in_progress'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {todo.status}
            </span>

            {group && (
              <span className="inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                <IconFolder size={14} />
                <span>{group.title}</span>
              </span>
            )}

            {todo.due_date && (
              <span className="inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                <IconCalendar size={14} />
                <span>Tenggat: {formatDate(todo.due_date)}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {todo.title}
          </h1>

          {/* Markdown Content Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Catatan & Deskripsi (Markdown)
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200">
              <MarkdownViewer content={todo.description || '(Tidak ada deskripsi pada tugas ini)'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
