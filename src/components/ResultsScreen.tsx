'use client'
import ConsistencyScore from './ConsistencyScore'
import ImproveMyListing from './ImproveMyListing'
import KeywordExtractor from './KeywordExtractor'
import { useMemo, useState } from 'react'
import { AnalysisResult } from '@/lib/types'
import {
  MODELS,
  extractBrands,
  buildLeaderboard,
  getBrandVisibility,
  highlightBrands,
  getScoreLabel,
} from '@/lib/utils'
import ScoreGauge from './ScoreGauge'
import Leaderboard from './Leaderboard'
import InsightsPanel from './InsightsPanel'

interface Props {
  result: AnalysisResult
  onReset: () => void
  onNewBrand?: (brand: string) => void
  history?: { query: string; brand: string; pct: number; timestamp: number }[]
}

const JUNK_BRANDS = [
  'unable','error','fetch','response','llama','only','results',
  'right','now','additionally','alternatively','furthermore',
  'moreover','amazon','loading','fetching','please','wait',
  'only llama','fetch response','right now',
]

export default function ResultsScreen({ result, onReset, onNewBrand, history }: Props) {
  const { query, brand, responses, insights } = result
  const [copied, setCopied] = useState(false)

  const brandMap = useMemo(() => {
  const map: Record<string, string[]> = {}
  Object.entries(responses).forEach(([ai, text]) => {
    map[ai] = extractBrands(text, query)
  })
  return map
}, [responses, query])

  const allBrands = useMemo(() => {
    return [...new Set(Object.values(brandMap).flat())]
  }, [brandMap])

  const leaderboard = useMemo(() => buildLeaderboard(brandMap), [brandMap])
  const visibility = useMemo(() => getBrandVisibility(brand, brandMap), [brand, brandMap])
  const scoreLabel = visibility ? getScoreLabel(visibility.pct) : null

  const cleanLeaderboard = useMemo(() => {
  // Extract words from the query to filter out
  const queryWords = query.toLowerCase().split(/\s+/)
  
  return leaderboard.filter(item => {
    const n = item.name.toLowerCase().trim()
    
    // Filter static junk
    const staticJunk = ['unable','error','fetch','response','llama','only',
      'results','right','now','additionally','alternatively','furthermore',
      'moreover','amazon','loading','fetching','please','wait']
    if (staticJunk.some(j => n.includes(j))) return false
    
    // Filter if name is just query words
    const nameWords = n.split(/\s+/)
    const allWordsFromQuery = nameWords.every(w => queryWords.includes(w))
    if (allWordsFromQuery) return false
    
    // Filter if name contains mostly query words
    const queryWordMatches = nameWords.filter(w => queryWords.includes(w)).length
    if (queryWordMatches >= nameWords.length) return false
    
    return true
  })
}, [leaderboard, query])

  const keywords = useMemo(() => {
    const JUNK = new Set([
      'unable','fetch','response','query','llama','results','right','now',
      'available','currently','only','purchasing','researching','checking',
      'certifications','third','party','consider','brands','brand','products',
      'product','option','options','great','good','best','top','popular',
      'offer','offers','provide','provides','help','helps','include','includes',
      'recommend','recommends','recommended','additionally','alternatively',
      'furthermore','moreover','amazon','error',
    ])
    const allText = Object.values(responses).join(' ').toLowerCase()
    const words = allText.match(/[a-z][a-z'-]*/g) || []
    const freq: Record<string, number> = {}
    words.forEach(w => {
      if (w.length > 4 && !JUNK.has(w)) freq[w] = (freq[w] || 0) + 1
    })
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i+1]}`
      if (!JUNK.has(words[i]) && !JUNK.has(words[i+1]) && words[i].length > 3 && words[i+1].length > 3) {
        freq[phrase] = (freq[phrase] || 0) + 1
      }
    }
    return Object.entries(freq)
      .filter(([_, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([phrase]) => phrase)
      .slice(0, 15)
  }, [responses])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">AEO Report Card</div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
              Visibility analysis
              <span className="text-sm font-normal text-[#0F6E56] bg-[#E1F5EE] border border-[#5DCAA5] px-2.5 py-0.5 rounded-full">
                &ldquo;{query}&rdquo;
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 text-xs rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 transition-all bg-white"
            >
              {copied ? '✓ Copied!' : 'Share link'}
            </button>
            <button
              onClick={onReset}
              className="px-3.5 py-2 text-xs rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 transition-all bg-white"
            >
              ← New query
            </button>
          </div>
        </div>

        {/* Score gauge */}
        {visibility && scoreLabel && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 animate-fade-up">
            <ScoreGauge
              pct={visibility.pct}
              found={visibility.found}
              total={visibility.total}
              brand={brand}
              label={scoreLabel}
            />
            {visibility.pct === 0 && cleanLeaderboard.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">💡 Did you mean one of these?</p>
                <div className="flex flex-wrap gap-2">
                  {cleanLeaderboard.slice(0, 4).map(item => (
                    <button
                      key={item.name}
                      onClick={() => onNewBrand && onNewBrand(item.name)}
                      className="text-xs px-3 py-1.5 rounded-full border border-[#5DCAA5] bg-[#E1F5EE] text-[#085041] hover:bg-[#5DCAA5] hover:text-white transition-all"
                    >
                      {item.name} · {item.count}/3 AIs
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Click any brand to check their AI visibility score.</p>
              </div>
            )}
          </div>
        )}

        {/* AI Response columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {Object.values(MODELS).map((m, i) => {
            const html = highlightBrands(responses[m.key] || '', allBrands, brand)
            return (
              <div
                key={m.key}
                className="bg-white rounded-2xl border border-gray-200 p-5 animate-fade-up relative overflow-hidden"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: m.dot }} />
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  <div className="w-2 h-2 rounded-full" style={{ background: m.dot }} />
                  <span className="text-sm font-medium text-gray-800">{m.label}</span>
                  <span className="text-xs text-gray-400 ml-auto border border-gray-100 px-1.5 py-0.5 rounded">
                    {m.version}
                  </span>
                </div>
                <div
                  className="text-sm text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
                {brandMap[m.key]?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-400 mb-1.5">Brands mentioned</div>
                    <div className="flex flex-wrap gap-1">
                      {brandMap[m.key].slice(0, 6).map(b => (
                        <span
                          key={b}
                          className="text-xs px-2 py-0.5 rounded-full border"
                          style={{
                            background: brand && b.toLowerCase().includes(brand.toLowerCase()) ? '#fef9c3' : m.bg,
                            borderColor: brand && b.toLowerCase().includes(brand.toLowerCase()) ? '#fde047' : m.border,
                            color: brand && b.toLowerCase().includes(brand.toLowerCase()) ? '#713f12' : m.textColor,
                          }}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Keyword Extractor */}
        <KeywordExtractor responses={result.responses} query={query} />

        {/* Improve My Listing */}
        <ImproveMyListing query={query} keywords={keywords} />

        {/* Consistency Score */}
        <ConsistencyScore query={query} />

        {/* Bottom row: Leaderboard + Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Leaderboard data={cleanLeaderboard} userBrand={brand} />
          <InsightsPanel insights={insights} />
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-8">
          AEO Diagnostic · Queries run simultaneously across ChatGPT (GPT-4o), Llama 3 (via Groq), Gemini
        </p>
      </div>
    </div>
  )
}