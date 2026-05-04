'use client'

interface Props {
  responses: Record<string, string>
  query: string
}

const FILLER = new Set([
  'the','a','an','for','in','on','at','to','of','and','or','but','with',
  'from','by','as','is','are','was','were','be','been','have','has','had',
  'do','does','did','will','would','could','should','may','might','must',
  'can','if','when','where','how','why','what','which','who','that','this','unable','fetch','response','query','llama','results','right',
'now','available','currently','only','this','purchasing',
'researching','checking','certifications','third','party',
  'these','those','it','its','you','your','they','their','we','our','my',
  'also','both','each','few','more','most','other','some','such','than',
  'then','there','too','very','just','over','well','high','low','new','old',
  'one','two','three','first','second','last','many','much','only','same',
  'here','after','before','since','while','about','above','below','between',
  'through','during','however','therefore','although','because','whether',
  'without','within','along','across','plus','except','up','out','around',
  'down','off','again','all','any','no','nor','not','so','yet','i','he',
  'she','him','her','his','us','them','their','consider','brands','brand',
  'products','product','option','options','choice','choices','great','good',
  'best','top','popular','well','known','widely','available','offer','offers',
  'provide','provides','help','helps','include','includes','including',
  'recommend','recommends','recommended','use','used','using','make','makes',
])

function extractKeywords(responses: Record<string, string>): {
  phrase: string
  count: number
  ais: string[]
}[] {
  const allText = Object.values(responses).join(' ').toLowerCase()

  // Extract 2-3 word phrases
  const words = allText.match(/[a-z][a-z'-]*/g) || []
  const phrases: Record<string, { count: number; ais: string[] }> = {}

  // Single meaningful words
  words.forEach(word => {
    if (word.length < 4) return
    if (FILLER.has(word)) return
    if (!phrases[word]) phrases[word] = { count: 0, ais: [] }
    phrases[word].count++
  })

  // 2-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i], w2 = words[i + 1]
    if (FILLER.has(w1) || FILLER.has(w2)) continue
    if (w1.length < 3 || w2.length < 3) continue
    const phrase = `${w1} ${w2}`
    if (!phrases[phrase]) phrases[phrase] = { count: 0, ais: [] }
    phrases[phrase].count++
  }

  // Tag which AIs used each phrase
  Object.entries(responses).forEach(([ai, text]) => {
    const t = text.toLowerCase()
    Object.keys(phrases).forEach(phrase => {
      if (t.includes(phrase) && !phrases[phrase].ais.includes(ai)) {
        phrases[phrase].ais.push(ai)
      }
    })
  })

  return Object.entries(phrases)
    .map(([phrase, data]) => ({ phrase, ...data }))
    .filter(p => p.count >= 2 && p.phrase.length > 4)
    .sort((a, b) => (b.ais.length * 10 + b.count) - (a.ais.length * 10 + a.count))
    .slice(0, 20)
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

export default function KeywordExtractor({ responses, query }: Props) {
  const keywords = extractKeywords(responses)

  if (!keywords.length) return null

  const topKeywords = keywords.slice(0, 8)
  const allAIs = ['gpt', 'groq', 'gemini']

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4 animate-fade-up">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          🔑 Keywords AIs reward
        </h2>
        <span className="text-xs text-gray-400">add these to your listing</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        These are the exact words and phrases AI engines use when recommending top brands for <span className="text-gray-600 font-medium">"{query}"</span>
      </p>

      {/* Keyword tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {topKeywords.map((kw, i) => {
          const opacity = 1 - (i / topKeywords.length) * 0.5
          const isTopPhrase = kw.ais.length === 3
          return (
            <div
              key={kw.phrase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:scale-105 cursor-default"
              style={{
                background: isTopPhrase ? '#E1F5EE' : '#f9fafb',
                borderColor: isTopPhrase ? '#5DCAA5' : '#e5e7eb',
                color: isTopPhrase ? '#085041' : '#4b5563',
                opacity,
              }}
              title={`Used by: ${kw.ais.map(a => AI_LABELS[a]).join(', ')}`}
            >
              {kw.phrase}
              {isTopPhrase && <span className="text-[#1D9E75]">★</span>}
            </div>
          )
        })}
      </div>

      {/* Detailed table */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-400 col-span-2">Keyword / Phrase</div>
          {allAIs.map(ai => (
            <div key={ai} className="text-xs font-medium text-center" style={{ color: AI_COLORS[ai] }}>
              {AI_LABELS[ai]}
            </div>
          ))}
        </div>
        {keywords.slice(0, 12).map((kw, i) => (
          <div
            key={kw.phrase}
            className="grid grid-cols-4 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
          >
            <div className="col-span-2 text-xs text-gray-700 font-medium flex items-center gap-1.5">
              {kw.phrase}
              {kw.ais.length === 3 && (
                <span className="text-[10px] bg-[#E1F5EE] text-[#085041] px-1.5 py-0.5 rounded-full border border-[#5DCAA5]">
                  all 3 AIs
                </span>
              )}
            </div>
            {allAIs.map(ai => (
              <div key={ai} className="text-center text-xs">
                {kw.ais.includes(ai)
                  ? <span style={{ color: AI_COLORS[ai] }}>✓</span>
                  : <span className="text-gray-200">✗</span>
                }
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
        <div className="text-xs font-medium text-amber-800 mb-1">💡 How to use this</div>
        <div className="text-xs text-amber-700 leading-relaxed">
          Add the <span className="font-semibold">★ starred keywords</span> (used by all 3 AIs) to your Amazon listing title, bullet points, and A+ content. These are the exact attributes AI engines look for when recommending products in this category.
        </div>
      </div>
    </div>
  )
}