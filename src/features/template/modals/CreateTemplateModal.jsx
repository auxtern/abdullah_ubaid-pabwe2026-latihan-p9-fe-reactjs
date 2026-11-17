import React, { useState } from 'react'
import { IconTemplate, IconPlus, IconTrash } from '@tabler/icons-react'

export default function CreateTemplateModal({ isOpen, onClose, onSubmit, onSwitchToAi }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState([{ title: '', description: '' }])

  if (!isOpen) return null

  const handleAddItem = () => {
    setItems((prev) => [...prev, { title: '', description: '' }])
  }

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      items: items.filter((it) => it.title && it.title.trim()),
    })

    setTitle('')
    setDescription('')
    setItems([{ title: '', description: '' }])
    onClose()
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setItems([{ title: '', description: '' }])
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      data-testid="create-template-modal"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col my-auto transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/10 rounded-xl backdrop-blur-sm flex items-center justify-center">
              <IconTemplate size={24} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Tambah Template Publik Baru</h2>
              <p className="text-xs text-blue-100">
                Bagikan paket alur kerja todolist siap pakai kepada seluruh komunitas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold transition cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto flex-1">
            {onSwitchToAi && (
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between text-xs">
                <span className="text-indigo-900 dark:text-indigo-200 font-medium">
                  Ingin membuat template otomatis menggunakan AI?
                </span>
                <button
                  type="button"
                  onClick={onSwitchToAi}
                  className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs cursor-pointer"
                >
                  Gunakan AI
                </button>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Judul Template Publik <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                aria-label="Judul Template"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Checklist Onboarding Frontend Developer"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm shadow-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Deskripsi Template
              </label>
              <textarea
                rows={3}
                aria-label="Deskripsi Template"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan tujuan template, target pengguna, atau hasil yang diharapkan..."
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm shadow-xs"
              />
            </div>

            {/* Items Section */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Daftar Tugas Awal Template (Opsional)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tambahkan tugas-tugas awal yang akan didapatkan pengguna saat menyalin template ini
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <IconPlus size={14} />
                  <span>Tambah Tugas</span>
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-2">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        aria-label={`Judul Tugas ${index + 1}`}
                        placeholder="Nama tugas (contoh: Setup Node.js dan Bun)"
                        value={item.title}
                        onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        aria-label={`Deskripsi Tugas ${index + 1}`}
                        placeholder="Keterangan singkat / catatan (opsional)"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Hapus Tugas ${index + 1}`}
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer shrink-0 mt-1"
                      >
                        <IconTrash size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 px-6 sm:px-8 py-4 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition cursor-pointer"
            >
              Simpan Template Publik
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
