import { NextRequest, NextResponse } from 'next/server'

const MOCK_INSIGHTS = [
  {
    title: "Top brands win on third-party testing claims",
    body: "Brands like Optimum Nutrition and Garden of Life appear across all 3 AIs because they consistently emphasize third-party testing and clean ingredients. AI models reward brands with strong editorial coverage and verified quality claims.",
    action: "Add NSF Certified or Informed Sport badge prominently to your listing title and first bullet point",
  },
  {
    title: "Price-per-serving framing drives AI mentions",
    body: "The brands dominating AI responses all have strong price-per-serving positioning in their reviews and listings. AIs appear to surface brands that reviewers describe as 'best value' or 'worth the price'.",
    action: "Update your listing to include a price-per-serving comparison in your bullet points and A+ content",
  },
  {
    title: "Brand story and trust signals matter to AI",
    body: "Established brands with decades of history (Optimum Nutrition since 1986) get mentioned more across all AIs. AI models weight editorial content, longevity mentions, and trust signals heavily when forming recommendations.",
    action: "Add your brand founding story and any awards or certifications to your Amazon brand story section",
  },
]

export async function POST(req: NextRequest) {
  try {
    const { query, brand, responses } = await req.json()

    if (!process.env.GROQ_API_KEY) {
      await new Promise(r => setTimeout(r, 2000))
      return NextResponse.json({ insights: MOCK_INSIGHTS, mock: true })
    }

    const Groq = (await import('groq-sdk')).default
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const prompt = `You are an AEO (Answer Engine Optimization) strategist for Amazon sellers.

Product query: "${query}"
Brand being tracked: "${brand || 'not specified'}"

AI engine responses:
ChatGPT: ${responses.gpt || 'No response'}
Llama 3: ${responses.groq || 'No response'}
Gemini: ${responses.gemini || 'No response'}

Give exactly 3 sharp actionable insights for this Amazon seller about improving their AI search visibility.
Focus on: why certain brands dominate, what attributes AIs reward, specific listing optimization actions.

Return ONLY a valid JSON array, no markdown:
[{"title":"...","body":"...","action":"..."}]`

    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    })

    const text = res.choices[0].message.content || '[]'
    let insights = []
    try {
      insights = JSON.parse(text.replace(/```json|```/g, '').trim())
    } catch {
      insights = MOCK_INSIGHTS
    }

    return NextResponse.json({ insights, mock: false })
  } catch (error: any) {
    console.error('[insights error]', error?.message)
    return NextResponse.json({ insights: MOCK_INSIGHTS, mock: true })
  }
}
