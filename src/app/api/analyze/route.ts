import { NextRequest, NextResponse } from 'next/server'

async function callGPT(query: string): Promise<string> {
  const { default: OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful product recommendation assistant. Recommend 4-6 specific brands by name relevant to the query. Keep to 3-4 sentences.' },
      { role: 'user', content: query },
    ],
    max_tokens: 350,
  })
  return res.choices[0].message.content || ''
}

async function callGroq(query: string): Promise<string> {
  const Groq = (await import('groq-sdk')).default
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a knowledgeable product advisor. Recommend 4-6 specific brands by name relevant to the query. Keep to 3-4 sentences.' },
      { role: 'user', content: query },
    ],
    max_tokens: 350,
  })
  return res.choices[0].message.content || ''
}

async function callGemini(query: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
  const res = await model.generateContent(query)
  return res.response.text()
}

async function getMockResponse(query: string): Promise<string> {
  const { default: OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful product recommendation assistant. Recommend 4-6 specific brands by name relevant to the query. Keep to 3-4 sentences.' },
      { role: 'user', content: query },
    ],
    max_tokens: 350,
  })
  return res.choices[0].message.content || ''
}

export async function POST(req: NextRequest) {
  const { query, model } = await req.json()
  if (!query || !model) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }
  try {
    let response = ''
    if      (model === 'gpt')    response = await callGPT(query)
    else if (model === 'groq')   response = await callGroq(query)
    else if (model === 'gemini') response = await callGemini(query)
    return NextResponse.json({ response, model, mock: false })
  } catch (error: any) {
    console.error(`[${model} error]`, error?.message)
    try {
      // Fallback — use GPT to generate a real relevant response
      const fallback = await getMockResponse(query)
      return NextResponse.json({ response: fallback, model, mock: true })
    } catch {
      return NextResponse.json({
        response: `Unable to fetch response for this query. Only Llama 3 results are available right now.`,
        model, mock: true
      })
    }
  }
}