'use client'
import { useState } from 'react'

interface Props {
  query: string
}

const AI_COLORS: Record<string, string> = {
  gpt: '#0F6E56',
  groq: '#534AB7',
  gemini: '#185FA5',
}

const AI_LABELS: Record<string, string> = {
  gpt: 'ChatGPT',
  groq: 'Llama 3',
  gemini: 'Gemini',
}

function extractBrands(text: string, query: string = ''): string[] {
  const queryWords = query.toLowerCase().split(/\s+/)
  const JUNK = ['unable','error','fetch','response','only llama','only','llama',
    'some','other','others','these','those','additionally','alternatively',
    'furthermore','moreover','amazon','loading','fetching','please','wait',
    'in india','india','brands','products','options']
  
  const matches = text.match(/\b[A-Z][a-zA-Z&'-]+(?:\s+[A-Z][a-zA-Z&'-]+)?\b/g) || []
  return Array.from(new Set(matches)).filter(w => {
    const lower = w.toLowerCase()
    if (w.length < 3) return false
    if (JUNK.some(j => lower.includes(j))) return false
    // Filter query words
    const nameWords = lower.split(/\s+/)
    const allFromQuery = nameWords.every(nw => queryWords.includes(nw))
    if (allFromQuery) return false
    return true
  })
}

function jaccardSimilarity(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 1
  const setA = new Set(a.map(x => x.toLowerCase()))
  const setB = new Set(b.map(x => x.toLowerCase()))
  const intersection = [...setA].filter(x => setB.has(x)).length
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : Math.round((intersection / union) * 100)
}

export default function ConsistencyScore({ query }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [runs, setRuns] = useState<Record<string, string[][]>>({})
  const [done, setDone] = useState(false)

  const runConsistency = async () => {
    setLoading(true)
    setDone(false)
    setRuns({})

    const allRuns: Record<string, string[][]> = {
      gpt: [], groq: [], gemini: []
    }

    // Run 3 times for each model in parallel
    await Promise.all([0, 1, 2].map(async (attempt) => {
      await Promise.all(['gpt', 'groq', 'gemini'].map(async (model) => {
        try {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, model }),
          })
          const data = await res.json()
          const brands = extractBrands(data.response || '', query)
          allRuns[model][attempt] = brands
        } catch {
          allRuns[model][attempt] = []
        }
      }))
      // Small delay between runs
      await new Promise(r => setTimeout(r, 500))
    }))

    setRuns(allRuns)
    setLoading(false)
    setDone(true)
  }

  const getConsistencyScore = (modelRuns: string[][]): number => {
    if (modelRuns.length < 2) return 0
    const scores = []
    for (let i = 0; i < modelRuns.length; i++) {
      for (let j = i + 1; j < modelRuns.length; j++) {
        scores.push(jaccardSimilarity(modelRuns[i] || [], modelRuns[j] || []))
      }
    }
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  const getConsistencyLabel = (score: number) => {
    if (score >= 70) return { label: 'Very consistent', color: '#3B6D11' }
    if (score >= 50) return { label: 'Mostly consistent', color: '#1D9E75' }
    if (score >= 30) return { label: 'Somewhat variable', color: '#BA7517' }
    return { label: 'Highly variable', color: '#A32D2D' }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            🔄 AI Consistency Score
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Does AI always recommend the same brands? Run 3x to find out
          </p>
        </div>
        <button
          onClick={() => { setOpen(!open); if (!open && !done) runConsistency() }}
          className="text-xs px-3 py-1.5 rounded-lg border border-[#534AB7] text-[#534AB7] hover:bg-[#EEEDFE] transition-all"
        >
          {open ? 'Close ↑' : 'Run 3x →'}
        </button>
      </div>

      {open && (
        <div className="mt-4 animate-fade-up">
          {loading && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-400 text-center">
                Running the same query 3 times across all AIs...
              </p>
              {['gpt','groq','gemini'].map(model => (
                <div key={model} className="flex items-center gap-3">
                  <span className="text-xs w-20 font-medium" style={{ color: AI_COLORS[model] }}>
                    {AI_LABELS[model]}
                  </span>
                  <div className="flex gap-2 flex-1">
                    {[0,1,2].map(i => (
                      <div
                        key={i}
                        className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden"
                      >
                        <div
                          className="h-full rounded-full animate-pulse"
                          style={{ background: AI_COLORS[model], width: '60%' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {done && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 text-center">
                Ran <strong>3 times</strong> for each AI — here's how consistent their recommendations are
              </p>

              {['gpt','groq','gemini'].map(model => {
                const modelRuns = runs[model] || []
                const score = getConsistencyScore(modelRuns)
                const { label, color } = getConsistencyLabel(score)
                const allBrands = [...new Set(modelRuns.flat().map(b => b.toLowerCase()))]

                return (
                  <div key={model} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: AI_COLORS[model] }} />
                        <span className="text-sm font-medium" style={{ color: AI_COLORS[model] }}>
                          {AI_LABELS[model]}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold" style={{ color }}>{score}%</span>
                        <span className="text-xs ml-1.5" style={{ color }}>{label}</span>
                      </div>
                    </div>

                    {/* 3 runs */}
                    <div className="space-y-2 mb-3">
                      {modelRuns.map((runBrands, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-xs text-gray-400 w-10 flex-shrink-0 pt-0.5">
                            Run {i + 1}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {(runBrands || []).slice(0, 5).map(b => (
                              <span
                                key={b}
                                className="text-xs px-2 py-0.5 rounded-full border"
                                style={{
                                  background: `${AI_COLORS[model]}15`,
                                  borderColor: `${AI_COLORS[model]}40`,
                                  color: AI_COLORS[model],
                                }}
                              >
                                {b}
                              </span>
                            ))}
                            {(!runBrands || runBrands.length === 0) && (
                              <span className="text-xs text-gray-300">No brands detected</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Consistency bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-24">Consistency</span>
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${score}%`, background: color }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8" style={{ color }}>{score}%</span>
                    </div>
                  </div>
                )
              })}

              {/* Key insight */}
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <div className="text-xs font-medium text-purple-800 mb-1">💡 What this means</div>
                <div className="text-xs text-purple-700 leading-relaxed">
                  If an AI has low consistency, its recommendations vary run-to-run — making it harder to
                  optimize for. High consistency means the AI has a strong opinion about which brands win
                  in this category. Focus your AEO efforts on the most consistent AI engines first.
                </div>
              </div>

              <button
                onClick={runConsistency}
                className="w-full py-2 text-xs rounded-xl border border-gray-200 text-gray-400 hover:border-[#534AB7] hover:text-[#534AB7] transition-all"
              >
                Run again ↺
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}