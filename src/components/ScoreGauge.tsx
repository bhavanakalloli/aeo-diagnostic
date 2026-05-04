'use client'

import { ModelKey } from '@/lib/types'
import { MODELS } from '@/lib/utils'

interface Props {
  pct: number
  found: ModelKey[]
  total: number
  brand: string
  label: { label: string; color: string }
}

export default function ScoreGauge({ pct, found, total, brand, label }: Props) {
  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  const message =
    found.length === 0
      ? `${brand} wasn't mentioned by any AI engine. You're invisible in AI search.`
      : found.length === total
      ? `${brand} appears across all ${total} AI engines. You're dominating AI search!`
      : `${brand} was mentioned by ${found.length} of ${total} AI engines.`

  return (
    <div className="flex items-center gap-8 flex-wrap">
      {/* Circular gauge */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="48" cy="48" r={r} fill="none" stroke="#f0f0f0" strokeWidth="7" />
          <circle
            cx="48" cy="48" r={r}
            fill="none"
            stroke={label.color}
            strokeWidth="7"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold leading-none" style={{ color: label.color }}>
            {pct}%
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5">visible</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-semibold text-gray-900">AI visibility score</span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full border"
            style={{
              background: `${label.color}18`,
              color: label.color,
              borderColor: `${label.color}40`,
            }}
          >
            {label.label}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">{message}</p>

        {/* Model badges */}
        <div className="flex gap-2 flex-wrap">
          {Object.values(MODELS).map(m => {
            const mentioned = found.includes(m.key)
            return (
              <span
                key={m.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all"
                style={{
                  background: mentioned ? m.bg : '#f9fafb',
                  borderColor: mentioned ? m.border : '#e5e7eb',
                  color: mentioned ? m.textColor : '#9ca3af',
                }}
              >
                {m.label} {mentioned ? '✓' : '✗'}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
