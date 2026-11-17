import React, { useState } from 'react'
import { IconSparkles, IconWorld, IconExternalLink, IconX, IconSearch } from '@tabler/icons-react'

export default function AiGeneratorModal({ isOpen, onClose, onGenerate, onSaveBatch, loading }) {
  const [prompt, setPrompt] = useState('')
  const [count, setCount] = useState(3)
  const [includeWebSearch, setIncludeWebSearch] = useState(true)
  const [generatedItems, setGeneratedItems] = useState([])
  const [searchSources, setSearchSources] = useState([])

  if (!isOpen) return null

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return
    const res = await onGenerate({
      prompt: prompt.trim(),
      count: Number(count),
      include_web_search: includeWebSearch,
    })
    if (res) {
      if (Array.isArray(res)) {
        setGeneratedItems(res)
        setSearchSources([])
      } else {
        setGeneratedItems(res.items || [])
        setSearchSources(res.search_sources || [])
      }
    }
  }

  const handleSaveAll = () => {
    if (generatedItems.length > 0) {
      onSaveBatch(generatedItems)
      setGeneratedItems([])
      setSearchSources([])
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      data-testid="ai-modal"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col my-auto transition-all">
        {/* Header with Primary Gradient Theme */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <IconSparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                AI Todolist Generator (OpenAI)
              </h2>
              <p className="text-xs text-primary-100">
                Hasilkan daftar tugas otomatis dikombinasikan dengan penelusuran mesin pencari
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
          <form onSubmit={handleGenerate} className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Prompt Permintaan Tugas AI
              </label>
              <input
                type="text"
                required
                aria-label="Prompt AI"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Contoh: Rencana belajar Go Gin dan React selama 3 hari"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
              />
            </div>

            {/* Search Engine Integration Toggle */}
            <div className="p-4 rounded-xl bg-primary-50/70 dark:bg-primary-950/40 border border-primary-200/80 dark:border-primary-800/60 flex items-start gap-3">
              <input
                type="checkbox"
                id="toggle-search-engine"
                checked={includeWebSearch}
                onChange={(e) => setIncludeWebSearch(e.target.checked)}
                disabled={loading}
                data-testid="ai-toggle-search"
                className="mt-1 w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <label htmlFor="toggle-search-engine" className="text-xs text-primary-950 dark:text-primary-200 cursor-pointer select-none">
                <span className="font-bold text-sm flex items-center gap-1.5 mb-0.5">
                  <IconWorld className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  Integrasi Penelusuran Mesin Pencari Open-Source
                </span>
                AI akan melakukan penelusuran fakta melalui open-source search tools (Wikipedia / Open Search) dan menyertakan rujukan atau tautan sumber relevan pada tugas todo yang dihasilkan.
              </label>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div className="w-36">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Jumlah Todo
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  aria-label="Jumlah Todo"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {loading ? 'Sedang Menghasilkan...' : 'Hasilkan via AI'}
              </button>
            </div>
          </form>

          {/* Search Citations Display */}
          {searchSources && searchSources.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2" data-testid="ai-search-sources">
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <IconSearch size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Sumber Rujukan Mesin Pencari:</span>
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

          {/* Generated Result Preview */}
          {generatedItems.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3" data-testid="ai-result-preview">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Pratinjau Hasil AI ({generatedItems.length} item)
                </h4>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Simpan Semua ke Daftar Todo
                </button>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {generatedItems.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{item.title}</h5>
                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800"
                          data-testid={`ai-todo-source-${idx}`}
                        >
                          <IconExternalLink className="w-3 h-3" />
                          Buka Sumber Web
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
