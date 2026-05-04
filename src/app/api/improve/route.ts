import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { listing, query, keywords } = await req.json()

    const prompt = `You are an Amazon listing optimization expert specializing in AEO (Answer Engine Optimization).

A seller wants to improve their Amazon listing for the query: "${query}"

These are the keywords that AI engines like ChatGPT, Gemini, and Llama reward when recommending products in this category:
${keywords.slice(0, 10).join(', ')}

Here is their current listing:
${listing}

Rewrite their listing to:
1. Naturally incorporate the AI-rewarded keywords
2. Keep the same product facts but make it more compelling
3. Use language that AI engines recognize as high-quality
4. Format as: Title: [title]\n• [bullet 1]\n• [bullet 2]\n• [bullet 3]\n• [bullet 4]\n• [bullet 5]

Be specific, benefit-focused, and natural. Don't keyword stuff.`

    const Groq = (await import('groq-sdk')).default
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    })

    const improved = res.choices[0].message.content || ''
    return NextResponse.json({ improved })
  } catch (error: any) {
    console.error('[improve error]', error?.message)
    return NextResponse.json({ improved: 'Error improving listing. Please try again.' })
  }
}