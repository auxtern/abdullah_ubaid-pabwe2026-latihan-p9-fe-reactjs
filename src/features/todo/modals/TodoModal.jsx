import React, { useState, useEffect } from 'react'
import { IconListCheck } from '@tabler/icons-react'
import MarkdownEditor from '../../../components/MarkdownEditor'

const getInitialTitle = (item) => item?.title || ''
const getInitialDesc = (item) => item?.description || ''
const getInitialStatus = (item) => (item?.status || 'pending').toLowerCase().trim()
const getInitialGroupId = (item) => {
  if (!item) return ''
  const gid = item.todo_group_id ?? item.group_id ?? item.todo_group?.id ?? item.group?.id
  return gid !== undefined && gid !== null && gid !== '' ? String(gid) : ''
}
const getInitialDueDate = (item) => {
  if (!item || !item.due_date) return ''
  const val = item.due_date
  if (typeof val === 'string') {
    const trimmed = val.trim()
    const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/)
    if (isoMatch) return isoMatch[1]
  }
  const d = new Date(val)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().substring(0, 10)
}

export default function TodoModal({ isOpen, onClose, onSave, todo, initialData, groups }) {
  const activeTodo = todo || initialData
  const [title, setTitle] = useState(() => getInitialTitle(activeTodo))
  const [description, setDescription] = useState(() => getInitialDesc(activeTodo))
  const [status, setStatus] = useState(() => getInitialStatus(activeTodo))
  const [groupId, setGroupId] = useState(() => getInitialGroupId(activeTodo))
  const [dueDate, setDueDate] = useState(() => getInitialDueDate(activeTodo))

  useEffect(() => {
    if (activeTodo) {
      setTitle(getInitialTitle(activeTodo))
      setDescription(getInitialDesc(activeTodo))
      setStatus(getInitialStatus(activeTodo))
      setGroupId(getInitialGroupId(activeTodo))
      setDueDate(getInitialDueDate(activeTodo))
    } else {
      setTitle('')
      setDescription('')
      setStatus('pending')
      setGroupId('')
      setDueDate('')
    }
  }, [activeTodo, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      title,
      description,
      status,
      todo_group_id: groupId ? Number(groupId) : null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col w-screen h-screen overflow-hidden animate-fadeIn"
      data-testid="todo-modal"
    >
      {/* Header with Distinct Theme Accent - Full Width */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 sm:px-8 py-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-white/10 rounded-xl backdrop-blur-sm flex items-center justify-center">
            <IconListCheck size={24} />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">
              {activeTodo ? 'Ubah Tugas Todolist' : 'Tambah Tugas Todolist Baru'}
            </h2>
            <p className="text-xs text-primary-100">
              Atur judul, kategori kelompok, status pengerjaan, dan tenggat waktu tugas
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold transition cursor-pointer"
        >
          &times;
        </button>
      </div>

      {/* Body / Content - Full Screen & Full Width */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        <form
          id="todo-form"
          onSubmit={handleSubmit}
          className="w-full space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              aria-label="Judul Tugas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Belajar Gin dan PostgreSQL"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kelompok Todo
              </label>
              <select
                aria-label="Kelompok Todo"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm shadow-xs"
              >
                <option value="">-- Tanpa Kelompok --</option>
                {groups &&
                  groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                aria-label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm shadow-xs"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tenggat Waktu
              </label>
              <input
                type="date"
                aria-label="Tenggat Waktu"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm shadow-xs"
              />
            </div>
          </div>

          <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Catatan & Deskripsi (Markdown)
            </label>
            <MarkdownEditor
              value={description}
              onChange={(val) => setDescription(val)}
              height="450px"
              placeholder="Tulis deskripsi detail, checklist tugas, link catatan, dll..."
            />
            <textarea
              aria-label="Deskripsi Markdown"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
          </div>
        </form>
      </div>

      {/* Footer - Full Width Bottom Bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 px-6 sm:px-8 py-4 flex justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          form="todo-form"
          className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition cursor-pointer"
        >
          Simpan Tugas
        </button>
      </div>
    </div>
  )
}
