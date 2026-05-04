'use client'
import { Insight } from '@/lib/types'
interface Props { insights: Insight[] }
export default function InsightsPanel({ insights }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Strategic insights</h2>
      {insights.length === 0 ? (
        <div className="flex items-center gap-2.5 text-sm text-gray-400">Generating insights...</div>
      ) : (
        <div className="space-y-3">
          {insights.map((ins, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm font-medium text-green-700 mb-1.5">{ins.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed mb-2">{ins.body}</div>
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs text-blue-600 font-medium flex-1">→ {ins.action}</div>
                <a href={"https://www.google.com/search?q=" + encodeURIComponent(ins.title + " amazon seller")} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-400">Learn more ↗</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}