'use client'
import { useState } from 'react'
import InputScreen from '@/components/InputScreen'
import AnalyzingScreen from '@/components/AnalyzingScreen'
import ResultsScreen from '@/components/ResultsScreen'
import { AnalysisResult, DiagnosticState } from '@/lib/types'

export interface HistoryEntry {
  query: string
  brand: string
  pct: number
  timestamp: number
}

export default function Home() {
  const [state, setState] = useState<DiagnosticState>('input')
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const runDiagnostic = async (q: string, b: string) => {
    setQuery(q); setBrand(b); setState('analyzing')
    setLoadingStates({ gpt: true, groq: true, gemini: true })
    setResult(null)
    const responses: Record<string, string> = {}
    await Promise.all(['gpt', 'groq', 'gemini'].map(async (model) => {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q, model }),
        })
        const data = await res.json()
        responses[model] = data.response || 'Error fetching response.'
      } catch { responses[model] = 'Error fetching response.' }
      setLoadingStates((prev) => ({ ...prev, [model]: false }))
    }))
    let insights: AnalysisResult['insights'] = []
    try {
      const insRes = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, brand: b, responses }),
      })
      const insData = await insRes.json()
      insights = insData.insights || []
    } catch {}

    const newResult = { query: q, brand: b, responses, insights, timestamp: Date.now() }
    setResult(newResult)
    setState('results')

    // Calculate score for history
    if (b.trim()) {
      const allBrands = Object.values(responses).join(' ')
      const found = ['gpt','groq','gemini'].filter(ai =>
        responses[ai]?.toLowerCase().includes(b.toLowerCase())
      )
      const pct = Math.round((found.length / 3) * 100)
      setHistory(prev => [{query: q, brand: b, pct, timestamp: Date.now()}, ...prev].slice(0, 10))
    }
  }

  const handleNewBrand = (newBrand: string) => {
    runDiagnostic(query, newBrand)
  }

  const reset = () => { setState('input'); setResult(null); setLoadingStates({}) }

  return (
    <main className="min-h-screen">
      {state === 'input' && <InputScreen onRun={runDiagnostic} history={history} />}
      {state === 'analyzing' && <AnalyzingScreen query={query} loadingStates={loadingStates} partialResponses={{}} />}
      {state === 'results' && result && (
        <ResultsScreen result={result} onReset={reset} onNewBrand={handleNewBrand} history={history} />
      )}
    </main>
  )
}