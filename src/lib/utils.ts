import { ModelConfig, ModelKey, BrandMention } from './types'

export const MODELS: Record<ModelKey, ModelConfig> = {
  gpt: {
    key: 'gpt',
    label: 'ChatGPT',
    version: 'GPT-4o',
    color: '#10a37f',
    bg: '#E1F5EE',
    border: '#5DCAA5',
    textColor: '#085041',
    dot: '#0F6E56',
  },
  groq: {
    key: 'groq',
    label: 'Llama 3',
    version: 'via Groq',
    color: '#7c3aed',
    bg: '#EEEDFE',
    border: '#AFA9EC',
    textColor: '#26215C',
    dot: '#534AB7',
  },
  gemini: {
    key: 'gemini',
    label: 'Gemini',
    version: 'Gemini 1.5',
    color: '#4285F4',
    bg: '#E6F1FB',
    border: '#85B7EB',
    textColor: '#042C53',
    dot: '#185FA5',
  },
}

const STOP_WORDS = new Set([
  'the','a','an','for','in','on','at','to','of','and','or','but','with',
  'from','by','as','is','are','was','were','be','been','having','have',
  'has','had','do','does','did','will','would','could','should','may',
  'might','must','can','if','when','where','how','why','what','which',
  'who','that','this','these','those','it','its','you','your','they',
  'their','we','our','my','i','he','she','him','her','his','us',
  'also','both','each','few','more','most','other','some','such',
  'than','then','there','these','they','too','very','just','over',
  'great','good','best','top','well','high','low','new','old','one',
  'two','three','four','five','six','seven','eight','nine','ten',
  'first','second','third','last','many','much','only','same','own',
  'here','after','before','since','while','about','above','below',
  'between','through','during','including','however','therefore',
  'although','because','unless','whether','without','within','along',
  'following','across','behind','beyond','plus','except','up','out',
  'around','down','off','again','further','once','all','any','both',
  'each','no','nor','not','so','yet',
])

export function extractBrands(text: string, query: string = ''): string[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const matches = text.match(/\b[A-Z][a-zA-Z&'-]+(?:\s+[A-Z][a-zA-Z&'-]+)?\b/g) || []
  const unique = Array.from(new Set(matches))
  const GENERIC = new Set([
    'These','Those','There','Their','They','This','When','What','While',
    'With','From','After','Also','Both','Each','Some','Many','More','Most',
    'Such','Than','Then','Here','However','Therefore','Including','Looking',
    'Taking','Based','Analyzing','Amazon','Additionally','Alternatively',
    'Furthermore','Moreover','For','Capsules','Tablets','Softgels','Gummies',
    'Powder','Supplement','Supplements','Vitamin','Vitamins','Mineral',
    'Minerals','Extract','Formula','Complex','Blend','Natural','Organic',
    'Premium','Advanced','Ultra','Super','Maximum','Extra','High','Pure',
    'Daily','Regular','Original','Classic','Standard','Basic','Essential',
    'Plus','Pro','Max','Mini','Lite','Support','Health','Care','Life',
    'Living','Wellness','Medical','Clinical','Professional','Grade','Quality',
    'Certified','Tested','Verified','Approved','Recommended','Doctor','Doctors',
    'Research','Studies','Study','Evidence','Science','Scientific',
    'Magnesium','Calcium','Potassium','Zinc','Iron','Omega','Collagen',
    'Protein','Probiotic','Prebiotic','Fiber','Biotin','Folate','Turmeric',
    'Unable','Only','Llama','Error','Fetch','Response','Results','Other',
    'Indian','Brands','Products','Options','Some','Additionally',
  ])
  return unique.filter(w => {
    if (GENERIC.has(w)) return false
    if (STOP_WORDS.has(w.toLowerCase())) return false
    if (w.length < 3) return false
    // Filter if all words in brand name come from query
    const nameWords = w.toLowerCase().split(/\s+/)
    if (nameWords.every(nw => queryWords.includes(nw))) return false
    return true
  })
}

export function buildLeaderboard(brandMap: Record<string, string[]>): BrandMention[] {
  const tally: Record<string, BrandMention> = {}
  Object.entries(brandMap).forEach(([ai, brands]) => {
    brands.forEach(brand => {
      const key = brand.toLowerCase()
      if (!tally[key]) tally[key] = { name: brand, count: 0, ais: [] }
      if (!tally[key].ais.includes(ai as ModelKey)) {
        tally[key].ais.push(ai as ModelKey)
        tally[key].count++
      }
    })
  })
  return Object.values(tally).sort((a, b) => b.count - a.count).slice(0, 10)
}

function fuzzyMatch(a: string, b: string): boolean {
  a = a.toLowerCase().trim()
  b = b.toLowerCase().trim()
  if (a === b) return true
  if (a.includes(b) || b.includes(a)) return true

  // Check word by word for multi-word brands
  const aWords = a.split(/\s+/)
  const bWords = b.split(/\s+/)
  const matchedWords = aWords.filter(aw =>
    bWords.some(bw => {
      if (aw === bw) return true
      if (Math.abs(aw.length - bw.length) > 2) return false
      let mismatches = 0
      const shorter = aw.length < bw.length ? aw : bw
      const longer  = aw.length < bw.length ? bw : aw
      for (let i = 0; i < shorter.length; i++) {
        if (shorter[i] !== longer[i]) mismatches++
        if (mismatches > 1) return false
      }
      return true
    })
  )
  // If more than half the words match, it's a match
  return matchedWords.length >= Math.ceil(aWords.length / 2)
}

export function getBrandVisibility(
  brand: string,
  brandMap: Record<string, string[]>
): { found: ModelKey[]; pct: number; total: number } | null {
  if (!brand.trim()) return null
  const ais = Object.keys(brandMap) as ModelKey[]
  if (!ais.length) return null
  const found = ais.filter(ai =>
    (brandMap[ai] || []).some(b => fuzzyMatch(brand, b))
  )
  return { found, total: ais.length, pct: Math.round((found.length / ais.length) * 100) }
}

export function highlightBrands(text: string, brands: string[], userBrand?: string): string {
  if (!text || !brands.length) return text
  const escaped = brands.map(b => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
  return text.replace(regex, (match) => {
    const isUser = userBrand && match.toLowerCase() === userBrand.toLowerCase().trim()
    return isUser ? `<mark class="user-brand">${match}</mark>` : `<mark>${match}</mark>`
  })
}

export function getScoreLabel(pct: number): { label: string; color: string } {
  if (pct === 100) return { label: 'Dominant',  color: '#3B6D11' }
  if (pct >= 67)   return { label: 'Visible',   color: '#1D9E75' }
  if (pct >= 34)   return { label: 'Partial',   color: '#BA7517' }
  return                  { label: 'Invisible', color: '#A32D2D' }
}

export const EXAMPLE_QUERIES = [
  'best magnesium supplement for seniors',
  'best protein powder for weight loss',
  'best collagen supplement for skin',
  'best omega 3 fish oil supplement',
  'best probiotic for gut health',
  'best vitamin d3 supplement',
  'best creatine monohydrate powder',
  'best electrolyte supplement for athletes',
]