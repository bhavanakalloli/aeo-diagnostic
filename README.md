# AEO Diagnostic 🔍

> The Google Search Console — but for AI.

See exactly how visible your brand is when shoppers ask ChatGPT, Claude, and Gemini for product recommendations. Built for Amazon sellers navigating the shift from Google to AI search.

---

## What it does

1. You type a customer query: *"best magnesium supplement for seniors"*
2. The app hits **GPT-4o**, **Claude 3.5 Sonnet**, and **Gemini 1.5 Pro** simultaneously
3. You get:
   - Side-by-side AI responses with brand names highlighted
   - A **visibility score** showing what % of AIs mentioned your brand
   - A **brand leaderboard** ranking every competitor automatically
   - **3 strategic insights** on how to improve your AI visibility

---

## Tech stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router)           |
| Language    | TypeScript                        |
| Styling     | Tailwind CSS                      |
| AI 1        | OpenAI GPT-4o                     |
| AI 2        | Anthropic Claude 3.5 Sonnet       |
| AI 3        | Google Gemini 1.5 Flash           |
| Deploy      | Vercel (one click)                |

---

## Local setup (5 minutes)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/aeo-diagnostic.git
cd aeo-diagnostic
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up API keys

Copy the example env file:
```bash
cp .env.example .env.local
```

Then fill in your keys in `.env.local`:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AI...
```

**Where to get API keys:**
- **OpenAI** → https://platform.openai.com/api-keys (add $5 credit)
- **Anthropic** → https://console.anthropic.com/settings/keys (add $5 credit)
- **Gemini** → https://aistudio.google.com/app/apikey (free tier available)

### 4. Run locally
```bash
npm run dev
```

Open http://localhost:3000 — you're live!

---

## Deploy to Vercel (3 minutes)

### Option A: One-click deploy (easiest)
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repo
4. Add environment variables (OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY)
5. Click Deploy → done!

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel
# Follow the prompts
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add GEMINI_API_KEY
vercel --prod
```

---

## Project structure

```
aeo-diagnostic/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts   ← Calls GPT, Claude, Gemini
│   │   │   └── insights/route.ts  ← Generates strategic insights
│   │   ├── layout.tsx
│   │   ├── page.tsx               ← Main app logic + state
│   │   └── globals.css
│   ├── components/
│   │   ├── InputScreen.tsx        ← Query input + examples
│   │   ├── AnalyzingScreen.tsx    ← Loading state with live progress
│   │   ├── ResultsScreen.tsx      ← Main results layout
│   │   ├── ScoreGauge.tsx         ← Circular visibility score
│   │   ├── Leaderboard.tsx        ← Brand ranking table
│   │   └── InsightsPanel.tsx      ← AI-generated strategic tips
│   └── lib/
│       ├── types.ts               ← TypeScript interfaces
│       └── utils.ts               ← Brand extraction, scoring, helpers
├── .env.example
├── package.json
├── tailwind.config.js
└── README.md
```

---

## How the brand extraction works

When we get responses from each AI, we:
1. Use a regex to find all capitalized words/phrases (potential brand names)
2. Filter out a stop-word list (common words that start sentences)
3. De-duplicate across all 3 responses
4. Build a leaderboard ranked by how many AIs mentioned each brand

This isn't perfect — but it's impressively accurate for product recommendation queries.

---

## If I had more time

- **Weekly tracking** — run the same query every week, chart your visibility over time
- **Prompt recommendations** — "Here's how to rewrite your listing to rank better in AI"
- **Browser extension** — check AI visibility from any Amazon product page
- **More AI engines** — Perplexity, Grok, Meta AI, Microsoft Copilot
- **Category reports** — bulk-run 50 queries for an entire product category

---

## Video script (3 min)

**0:00 – 0:15** — Hi, I'm [name], [school], [CGPA]. Built this for the Pixii.ai assignment.

**0:15 – 0:35** — The problem: Amazon sellers obsess over SEO. But shoppers are now asking AI instead of Googling. This tool answers: *"Does AI recommend me?"*

**0:35 – 1:45** — Live demo:
- Type: "best magnesium supplement for seniors"
- Enter brand: "Nature Made"
- Hit analyze — watch the 3 columns load simultaneously
- Walk through: GPT says this, Claude says that, Gemini says this
- Show the visibility score gauge
- Show the brand leaderboard — competitor intel in 30 seconds
- Show the 3 strategic insights

**1:45 – 2:15** — Why I built it this way: dead simple UI because the insight is powerful enough. Sellers should be able to run this in 30 seconds, not read a manual.

**2:15 – 2:45** — Tech: Next.js, 3 real AI APIs called in parallel, brand extraction with NLP-lite regex + stop-words, animated score gauge, AI-generated insights using a 4th Claude call.

**2:45 – 3:00** — If I had more time: weekly tracking, listing optimization recommendations, browser extension, more AI engines.

---

Built with ❤️ for Pixii.ai founding engineer application.
