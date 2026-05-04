'use client'

import { MODELS } from '@/lib/utils'

interface Props {
  query: string
  loadingStates: Record<string, boolean>
  partialResponses: Record<string, string>
}

export default function AnalyzingScreen({ query, loadingStates, partialResponses }: Props) {
  const completed = Object.keys(MODELS).filter(k => !loadingStates[k]).length
  const total = Object.keys(MODELS).length

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">

        {/* Status */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-5 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin-slow" />
            <span className="text-lg font-medium text-gray-800">Querying AI engines...</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-[#1D9E75] bg-[#E1F5EE] px-3 py-1 rounded-full border border-[#5DCAA5] max-w-xs truncate">
              &ldquo;{query}&rdquo;
            </div>
            <span className="text-sm text-gray-400">{completed}/{total} complete</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-[#1D9E75] rounded-full transition-all duration-700"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4">
          {Object.values(MODELS).map((m, i) => {
            const isLoading = loadingStates[m.key]
            const hasResponse = !isLoading && (partialResponses[m.key] || true)

            return (
              <div
                key={m.key}
                className="bg-white rounded-2xl border transition-all duration-500 p-5"
                style={{
                  borderColor: !isLoading ? m.border : '#e5e7eb',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                {/* Card header */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                    style={{ background: !isLoading ? m.dot : '#d1d5db' }}
                  />
                  <span className="text-sm font-medium text-gray-700">{m.label}</span>
                  <span className="text-xs text-gray-400 ml-auto border border-gray-100 px-2 py-0.5 rounded">
                    {m.version}
                  </span>
                  {!isLoading && (
                    <span className="text-xs font-medium" style={{ color: m.dot }}>✓ Done</span>
                  )}
                  {isLoading && (
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin-slow"
                      style={{ borderColor: `${m.border} ${m.border} ${m.border} transparent` }}
                    />
                  )}
                </div>

                {/* Skeleton or response */}
                {isLoading ? (
                  <div className="space-y-2">
                    {[100, 85, 92, 68].map((w, j) => (
                      <div
                        key={j}
                        className="h-3 bg-gray-100 rounded animate-pulse-soft"
                        style={{ width: `${w}%`, animationDelay: `${j * 0.12}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 leading-relaxed animate-fade-up">
                    Response received...
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Querying all three AI engines simultaneously — this takes about 5-10 seconds
        </p>
      </div>
    </div>
  )
}
