import React, { useState } from 'react'
import { IconSearch, IconEye, IconTemplate, IconClipboardList } from '@tabler/icons-react'
import CreateTemplateModal from '../modals/CreateTemplateModal'
import AiTemplateModal from '../modals/AiTemplateModal'

export default function TemplateCatalog({
  templates,
  onClone,
  onCreateTemplate,
  onGenerateAi,
  user,
  onRequireLogin,
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  const handleCloneClick = (tpl) => {
    if (!user) {
      onRequireLogin()
      return
    }
    onClone(tpl.id)
  }

  const handleCreateClick = () => {
    if (!user) {
      onRequireLogin()
      return
    }
    setIsCreateModalOpen(true)
  }

  const handleAiClick = () => {
    if (!user) {
      onRequireLogin()
      return
    }
    setIsAiModalOpen(true)
  }

  const filteredTemplates = (templates || []).filter((tpl) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (tpl.title && tpl.title.toLowerCase().includes(q)) ||
      (tpl.description && tpl.description.toLowerCase().includes(q))
    )
  })

  return (
    <div className="w-full space-y-6" data-testid="template-catalog">
      {/* Header Banner - Matching Praktikum 8 */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
            Galeri Template Komunitas
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Template Todolist Publik
          </h1>
          <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
            Jelajahi berbagai paket todolist siap pakai dari komunitas. Anda dapat menyalin dan menggunakan template ini langsung ke akun Anda tanpa perlu menyusun dari nol!
          </p>
        </div>

        {/* Search Bar & Action Button inside Banner */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama template atau deskripsi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            />
            <span className="absolute left-3.5 top-3 text-slate-400">
              <IconSearch size={18} />
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCreateClick}
              className="px-4 py-2.5 bg-white hover:bg-blue-50 text-primary-700 font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center cursor-pointer shrink-0"
            >
              <span>Tambah Template Publik</span>
            </button>
            <button
              type="button"
              onClick={handleAiClick}
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center cursor-pointer shrink-0"
            >
              <span>Generate Template AI</span>
            </button>
          </div>
        </div>
      </div>

      {!templates || templates.length === 0 || filteredTemplates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center">
            <IconTemplate size={32} />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Belum ada template publik yang tersedia.
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Coba gunakan kata kunci pencarian yang lain atau buat template baru.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handleCreateClick}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-xs transition inline-flex items-center cursor-pointer"
            >
              <span>Tambah Template Publik Sekarang</span>
            </button>
            <button
              type="button"
              onClick={handleAiClick}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition inline-flex items-center cursor-pointer"
            >
              <span>Generate Template AI</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              data-testid={`template-card-${tpl.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40">
                    {tpl.todos ? tpl.todos.length : 0} Tugas
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    oleh <span className="font-medium text-slate-600 dark:text-slate-300">{tpl.user?.username || 'Komunitas'}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mb-2">
                  {tpl.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                  {tpl.description || 'Tidak ada deskripsi untuk template ini.'}
                </p>

                {/* Preview 3 items matching P8 */}
                {tpl.todos && tpl.todos.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 mb-4 space-y-1.5 border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Preview Item:</p>
                    {tpl.todos.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                        <span className="truncate">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
                >
                  <IconEye size={14} />
                  <span>Lihat Tugas</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCloneClick(tpl)}
                  className="px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Gunakan Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Detail Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col my-auto transition-all">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <span className="p-1.5 bg-white/10 rounded-lg flex items-center justify-center">
                  <IconClipboardList size={20} />
                </span>
                <div>
                  <h3 className="text-base font-bold">Detail Template: {selectedTemplate.title}</h3>
                  <p className="text-xs text-primary-100">Pratinjau struktur tugas sebelum kloning</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold transition cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">{selectedTemplate.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{selectedTemplate.description}</p>
                <h5 className="font-semibold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Daftar Tugas di Dalam Template
                </h5>
                <div className="divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                  {selectedTemplate.todos && selectedTemplate.todos.length > 0 ? (
                    selectedTemplate.todos.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-800">
                        <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-xs text-slate-400 text-center">Template ini belum memiliki tugas.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="px-5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const tplId = selectedTemplate.id
                  setSelectedTemplate(null)
                  handleCloneClick({ id: tplId })
                }}
                className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow transition cursor-pointer"
              >
                Gunakan Template Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => {
          if (onCreateTemplate) {
            onCreateTemplate(data)
          }
        }}
        onSwitchToAi={() => {
          setIsCreateModalOpen(false)
          setIsAiModalOpen(true)
        }}
      />

      {/* AI Public Template Modal */}
      <AiTemplateModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerate={onGenerateAi}
        onSaveTemplate={(data) => {
          if (onCreateTemplate) {
            onCreateTemplate(data)
          }
        }}
      />
    </div>
  )
}
