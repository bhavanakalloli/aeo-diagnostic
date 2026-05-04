'use client'
import { useState } from 'react'

interface Props {
  query: string
  keywords: string[]
}

export default function ImproveMyListing({ query, keywords }: Props) {
  const [open, setOpen] = useState(false)
  const [listing, setListing] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const improve = async () => {
    if (!listing.trim()) return
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing, query, keywords }),
      })
      const data = await res.json()
      setResult(data.improved || '')
    } catch { setResult('Error improving listing. Please try again.') }
    setLoading(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            ✨ Improve my Amazon listing
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Paste your listing → get an AI-optimized version using keywords AIs reward
          </p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs px-3 py-1.5 rounded-lg border border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE] transition-all"
        >
          {open ? 'Close ↑' : 'Try it →'}
        </button>
      </div>

      {open && (
        <div className="mt-4 animate-fade-up">
          {/* Input */}
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              Your current Amazon listing title + bullet points
            </label>
            <textarea
              value={listing}
              onChange={e => setListing(e.target.value)}
              placeholder={`Example:\nTitle: Nature's Best Magnesium 500mg\n• Supports muscle relaxation\n• 90 capsules per bottle\n• Made in USA`}
              rows={6}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 text-gray-700 placeholder-gray-300 resize-none focus:border-[#1D9E75] focus:outline-none transition-colors"
            />
          </div>

          {/* Keywords being used */}
          {keywords.length > 0 && (
            <div className="mb-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-400 mb-1.5">Using these AI-rewarded keywords:</div>
              <div className="flex flex-wrap gap-1">
                {keywords.slice(0, 8).map(kw => (
                  <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] border border-[#5DCAA5]">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={improve}
            disabled={loading || !listing.trim()}
            className="w-full py-2.5 rounded-xl bg-[#1D9E75] text-white text-sm font-medium hover:bg-[#0F6E56] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '✨ Optimizing your listing...' : '✨ Improve my listing'}
          </button>

          {/* Result */}
          {result && (
            <div className="mt-4 animate-fade-up">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-500">✅ AI-optimized version</div>
                <button
                  onClick={copyToClipboard}
                  className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-400 hover:text-[#1D9E75] hover:border-[#1D9E75] transition-all"
                >
                  Copy ↗
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-[#E1F5EE] border border-[#5DCAA5] text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                {result}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}