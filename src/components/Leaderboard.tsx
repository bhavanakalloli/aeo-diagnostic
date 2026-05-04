'use client'
import { BrandMention } from '@/lib/types'
import { MODELS } from '@/lib/utils'

interface Props {
  data: BrandMention[]
  userBrand: string
}

export default function Leaderboard({ data, userBrand }: Props) {
  const winner = data[0]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '0.32s' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Brand leaderboard</h2>
        <span className="text-xs text-gray-400">across 3 AIs</span>
      </div>

      {/* Winner callout — shown when no brand entered */}
      {!userBrand && (() => {
  const JUNK = ['unable','only llama','only','llama','error','fetch','response',
  'additionally','alternatively','for magnesium','capsules','tablets',
  'softgels','gummies','powder','supplement','vitamin','mineral','extract',
  'formula','complex','blend','natural','organic','premium','advanced',
  'garden','life','magnesium','calcium','protein','collagen']
  const realWinner = data.find(d => !JUNK.includes(d.name.toLowerCase()))
  if (!realWinner) return null
  const aiNames = realWinner.ais.map(ai =>
    ai === 'gpt' ? 'ChatGPT' : ai === 'groq' ? 'Llama 3' : 'Gemini'
  ).join(', ')
  const label = realWinner.count === 3
    ? 'Recommended by all 3 AI engines'
    : realWinner.count === 2
    ? `Recommended by 2/3 AIs — ${aiNames}`
    : `Recommended by 1/3 AIs — based on ${aiNames} only`
  return (
    <div className="mb-4 p-3 rounded-xl bg-[#E1F5EE] border border-[#5DCAA5]">
      <div className="text-xs text-[#085041] font-medium mb-0.5">🏆 AI's top pick</div>
      <div className="text-sm font-semibold text-[#0F6E56]">{realWinner.name}</div>
      <div className="text-xs text-[#1D9E75] mt-0.5">{label}</div>
    </div>
  )
})()}

      {data.length === 0 ? (
        <p className="text-sm text-gray-400">No brands detected.</p>
      ) : (
        <div className="space-y-2.5">
          {data.filter(item => !['unable','only llama','only','llama','error','fetch','response','additionally','alternatively'].includes(item.name.toLowerCase())).map((item, i) => {
            const isUser = userBrand &&
              (item.name.toLowerCase().includes(userBrand.toLowerCase()) ||
               userBrand.toLowerCase().includes(item.name.toLowerCase()))
            const isWinner = !userBrand && i === 0
            const barPct = Math.round((item.count / 3) * 100)

            return (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4 text-right flex-shrink-0">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <span className="text-sm flex-1 truncate"
                  style={{
                    fontWeight: isUser || isWinner ? 600 : 400,
                    color: isUser ? '#1D9E75' : isWinner ? '#0F6E56' : '#374151',
                  }}>
                  {item.name}
                  {isUser && <span className="ml-1.5 text-xs text-[#1D9E75] bg-[#E1F5EE] px-1.5 py-0.5 rounded-full border border-[#5DCAA5]">you</span>}
                  {isWinner && !isUser && <span className="ml-1.5 text-xs text-[#0F6E56] bg-[#E1F5EE] px-1.5 py-0.5 rounded-full border border-[#5DCAA5]">top pick</span>}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  {Object.values(MODELS).map(m => (
                    <div key={m.key} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: item.ais.includes(m.key) ? m.dot : '#e5e7eb' }}
                      title={`${m.label}: ${item.ais.includes(m.key) ? 'mentioned' : 'not mentioned'}`}
                    />
                  ))}
                </div>
                <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${barPct}%`, background: isUser ? '#1D9E75' : isWinner ? '#0F6E56' : '#d1d5db' }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-6 text-right flex-shrink-0">{item.count}/3</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4">
        {Object.values(MODELS).map(m => (
          <div key={m.key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: m.dot }} />
            <span className="text-xs text-gray-400">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
