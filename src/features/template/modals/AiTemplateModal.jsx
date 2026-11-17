import React, { useState } from 'react'
import { IconSparkles, IconWorld, IconExternalLink, IconX, IconSearch, IconTrash } from '@tabler/icons-react'

export default function AiTemplateModal({
  isOpen,
  onClose,
  onGenerate,
  onSaveTemplate,
  loading = false,
}) {
  const [prompt, setPrompt] = useState('')
  const [count, setCount] = useState(4)
  const [includeWebSearch, setIncludeWebSearch] = useState(true)
  const [templateTitle, setTemplateTitle] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [generatedItems, setGeneratedItems] = useState([])
  const [searchSources, setSearchSources] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim() || !onGenerate) return

    setIsGenerating(true)
    try {
      const res = await onGenerate({
        prompt: prompt.trim(),
        count: Number(count),
        include_web_search: includeWebSearch,
      })

      if (res) {
        let items = []
        let sources = []
        if (Array.isArray(res)) {
          items = res
        } else {
          items = res.items || []
          sources = res.search_sources || []
        }

        setGeneratedItems(items)
        setSearchSources(sources)
        setTemplateTitle(prompt.trim())
        setTemplateDescription(`Paket template todolist untuk: ${prompt.trim()} (Dihasilkan dengan AI)`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRemoveItem = (index) => {
    setGeneratedItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSave = () => {
    if (!templateTitle.trim() || !onSaveTemplate) return

    onSaveTemplate({
      title: templateTitle.trim(),
      description: templateDescription.trim(),
      items: generatedItems,
    })

    setPrompt('')
    setTemplateTitle('')
    setTemplateDescription('')
    setGeneratedItems([])
    setSearchSources([])
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      data-testid="ai-template-modal"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col my-auto transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white px-6 sm:px-8 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm flex items-center justify-center">
              <IconSparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Generate Template Publik AI</h2>
              <p className="text-xs text-blue-100">
                Susun alur kerja template publik otomatis dengan kecerdasan buatan & penelusuran web
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold transition cursor-pointer"
            aria-label="Tutup Modal"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Form Generator Input */}
          <form
            onSubmit={handleGenerate}
            className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Topik / Panduan Template Publik <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                aria-label="Topik Template AI"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Contoh: Kurikulum Onboarding Karyawan Baru 1 Bulan"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
              />
            </div>

            {/* Toggle Web Search Engine */}
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-start gap-3">
              <input
                type="checkbox"
                id="toggle-ai-template-search"
                checked={includeWebSearch}
                onChange={(e) => setIncludeWebSearch(e.target.checked)}
                disabled={loading || isGenerating}
                data-testid="ai-template-toggle-search"
                className="mt-1 w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <label
                htmlFor="toggle-ai-template-search"
                className="text-xs text-blue-950 dark:text-blue-200 cursor-pointer select-none"
              >
                <span className="font-bold text-sm flex items-center gap-1.5 mb-0.5">
                  <IconWorld className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Gunakan Penelusuran Mesin Pencari Web
                </span>
                AI akan menelusuri data dan referensi faktual dari web agar checklist langkah template lebih akurat dan terstruktur.
              </label>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div className="w-36">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Jumlah Tugas
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  aria-label="Jumlah Tugas Template"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading || isGenerating}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {loading || isGenerating ? 'Sedang Menghasilkan...' : 'Hasilkan Template AI'}
              </button>
            </div>
          </form>

          {/* Search Citations */}
          {searchSources && searchSources.length > 0 && (
            <div
              className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2"
              data-testid="ai-template-search-sources"
            >
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <IconSearch size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Sumber Penelusuran Web:</span>
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc ml-5">
                {searchSources.map((src, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {src}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Result Preview & Template Configuration */}
          {generatedItems.length > 0 && (
            <div
              className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-4"
              data-testid="ai-template-result-preview"
            >
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Konfigurasi Template Publik yang Dihasilkan
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Template Publik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  aria-label="Judul Template Publik Hasil AI"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Template
                </label>
                <textarea
                  rows={2}
                  aria-label="Deskripsi Template Publik Hasil AI"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Daftar Item Tugas ({generatedItems.length})
                  </h5>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {generatedItems.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h6 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                            {idx + 1}. {item.title}
                          </h6>
                          {item.source_url && (
                            <a
                              href={item.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:underline px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/50"
                            >
                              <IconExternalLink className="w-3 h-3" />
                              Sumber
                            </a>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition cursor-pointer"
                        title="Hapus tugas ini"
                        aria-label={`Hapus tugas ${idx + 1}`}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition cursor-pointer"
          >
            Tutup
          </button>
          {generatedItems.length > 0 && (
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || !templateTitle.trim()}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow transition disabled:opacity-50 cursor-pointer"
            >
              Simpan Sebagai Template Publik
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
