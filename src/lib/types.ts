export type DiagnosticState = 'input' | 'analyzing' | 'results'
export type ModelKey = 'gpt' | 'groq' | 'gemini'
export interface ModelConfig {
  key: ModelKey
  label: string
  version: string
  color: string
  bg: string
  border: string
  textColor: string
  dot: string
}
export interface Insight {
  title: string
  body: string
  action: string
}
export interface AnalysisResult {
  query: string
  brand: string
  responses: Record<string, string>
  insights: Insight[]
  timestamp: number
}
export interface BrandMention {
  name: string
  count: number
  ais: ModelKey[]
}
