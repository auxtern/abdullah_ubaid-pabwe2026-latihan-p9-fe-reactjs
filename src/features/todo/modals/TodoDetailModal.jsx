import React from 'react'
import { IconSearch } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'

export default function TodoDetailModal({ isOpen, onClose, todo }) {
  if (!isOpen || !todo) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      data-testid="todo-detail-modal"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col my-auto transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/10 rounded-xl backdrop-blur-sm flex items-center justify-center">
              <IconSearch size={22} />
            </span>
            <div>
              <h2 className="text-lg font-bold">Detail Tugas Todolist</h2>
              <p className="text-xs text-primary-100">Informasi lengkap dan catatan tugas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold transition cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Judul</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{todo.title}</h3>
          </div>

          <div className="flex flex-wrap gap-4 py-3 border-y border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 block mb-1">Status</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50">
                {todo.status}
              </span>
            </div>
            {todo.due_date && (
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block mb-1">Tenggat Waktu</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {new Date(todo.due_date).toLocaleDateString('id-ID')}
                </span>
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Deskripsi / Catatan (Markdown)
            </span>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 leading-relaxed">
              <MarkdownViewer content={todo.description || '(Tidak ada deskripsi)'} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium text-sm transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
