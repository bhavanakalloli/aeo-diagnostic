'use client'

import { useState } from 'react'
import { MODELS, EXAMPLE_QUERIES } from '@/lib/utils'

interface Props {
  onRun: (query: string, brand: string) => void
  history?: { query: string; brand: string; pct: number; timestamp: number }[]
}

export default function InputScreen({ onRun, history = [] }: Props) {
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('')

  const handleRun = () => {
    if (!query.trim()) return
    onRun(query.trim(), brand.trim())
  }

  const handleExample = (q: string) => {
    setQuery(q)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Header */}
      <div className="mb-10 text-center animate-fade-up">
        <div className="inline-flex items-center gap-2.5 mb-5 px-3.5 py-1.5 rounded-full border border-[#5DCAA5] bg-[#E1F5EE]">
          <div className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
          <span className="text-xs font-medium text-[#085041] tracking-wide uppercase">
            AEO Diagnostic
          </span>
        </div>
        <h1 className="text-4xl font-semibold text-gray-900 leading-tight mb-3 tracking-tight">
          How visible is your brand<br />
          <span className="text-[#1D9E75]">in AI search?</span>
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
          Shoppers are asking AI instead of Google. See exactly where you rank 
          across ChatGPT, Claude, and Gemini — side by side.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

          {/* Query Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              What would a customer ask AI?
            </label>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRun()}
              placeholder="best magnesium supplement for seniors"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 transition-all bg-gray-50"
            />
          </div>

          {/* Brand Input */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Your brand name{' '}
              <span className="font-normal text-gray-400">(optional — to track your visibility)</span>
            </label>
            <input
              type="text"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRun()}
              placeholder="e.g. Nature Made, Ritual, Garden of Life"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 transition-all bg-gray-50"
            />
          </div>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={!query.trim()}
            className="w-full py-3 px-6 rounded-xl bg-[#1D9E75] text-white text-sm font-medium
                       transition-all hover:bg-[#0F6E56] active:scale-[0.98]
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Run diagnostic →
          </button>

          {/* Model tags */}
          <div className="flex items-center gap-2 mt-4 justify-center flex-wrap">
            {Object.values(MODELS).map(m => (
              <span
                key={m.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                style={{ background: m.bg, borderColor: m.border, color: m.textColor }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.dot }} />
                {m.label} · {m.version}
              </span>
            ))}
          </div>
        </div>

        {/* Example queries */}
        <div className="mt-5">
          <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wide">
            Try an example
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_QUERIES.slice(0, 5).map(q => (
              <button
                key={q}
                onClick={() => handleExample(q)}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500
                           hover:border-[#1D9E75] hover:text-[#1D9E75] hover:bg-[#E1F5EE]
                           transition-all bg-white"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Session History */}
{history.length > 0 && (
  <div className="mt-6 w-full max-w-lg">
    <p className="text-xs text-gray-400 uppercase tracking-wide text-center mb-3">
      This session
    </p>
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {history.map((h, i) => {
        const color = h.pct === 100 ? '#3B6D11' : h.pct >= 67 ? '#1D9E75' : h.pct >= 34 ? '#BA7517' : '#A32D2D'
        const label = h.pct === 100 ? 'Dominant' : h.pct >= 67 ? 'Visible' : h.pct >= 34 ? 'Partial' : 'Invisible'
        return (
          <div
            key={i}
            onClick={() => onRun(h.query, h.brand)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">{h.query}</div>
              <div className="text-xs text-gray-400 truncate">Brand: {h.brand}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-semibold" style={{ color }}>{h.pct}%</div>
              <div className="text-xs" style={{ color }}>{label}</div>
            </div>
            <div className="text-gray-300 text-xs">→</div>
          </div>
        )
      })}
    </div>
  </div>
)}

      {/* Footer */}
      <p className="mt-10 text-xs text-gray-400 text-center">
        Built for Amazon sellers — the Google Search Console for AI · Powered by OpenAI, Anthropic, Google
      </p>
    </div>
  )
}
