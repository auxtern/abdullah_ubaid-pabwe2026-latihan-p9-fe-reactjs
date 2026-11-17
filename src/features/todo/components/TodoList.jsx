import React, { useState } from 'react'
import { IconDotsVertical, IconEye, IconPencil, IconTrash } from '@tabler/icons-react'

export default function TodoList({ todos, onToggleStatus, onDetail, onEdit, onDelete }) {
  const [openKebabId, setOpenKebabId] = useState(null)

  if (!todos || todos.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-800 my-4 text-slate-500 dark:text-slate-400">
        <p className="text-base font-medium">Belum ada tugas.</p>
        <p className="text-sm mt-1">Klik tombol "Tambah Todo" atau "AI Generator" untuk memulai.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:border-slate-800">
      {todos.map((todo) => {
        const isCompleted = todo.status === 'completed'
        const isMenuOpen = openKebabId === todo.id

        return (
          <div
            key={todo.id}
            data-testid={`todo-row-${todo.id}`}
            className={`flex items-center justify-between p-4 first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
              isMenuOpen ? 'relative z-30' : 'relative z-0'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
              <input
                type="checkbox"
                aria-label={`checkbox-${todo.id}`}
                checked={isCompleted}
                onChange={() => onToggleStatus(todo)}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <div className="min-w-0 flex-1">
                <span
                  className={`text-base font-medium truncate block cursor-pointer ${
                    isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
                  }`}
                  onClick={() => onDetail(todo)}
                >
                  {todo.title}
                </span>
                {todo.due_date && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">
                    Tenggat: {new Date(todo.due_date).toLocaleDateString('id-ID')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  isCompleted
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : todo.status === 'in_progress'
                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {todo.status}
              </span>

              {/* Kebab Action Menu */}
              <button
                type="button"
                aria-label={`kebab-${todo.id}`}
                onClick={() => setOpenKebabId(isMenuOpen ? null : todo.id)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              >
                <IconDotsVertical size={18} />
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 z-50 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1"
                  data-testid={`kebab-menu-${todo.id}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenKebabId(null)
                      onDetail(todo)
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <IconEye size={15} className="text-primary-600 dark:text-primary-400" />
                    <span>Detail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenKebabId(null)
                      onEdit(todo)
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <IconPencil size={15} className="text-primary-600 dark:text-primary-400" />
                    <span>Ubah Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenKebabId(null)
                      onDelete(todo.id)
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <IconTrash size={15} />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
