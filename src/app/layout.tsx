import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AEO Diagnostic — AI Visibility for Amazon Sellers',
  description: 'See how visible your brand is when shoppers ask ChatGPT, Claude, and Gemini for product recommendations.',
  openGraph: {
    title: 'AEO Diagnostic',
    description: 'Check your brand\'s AI visibility across ChatGPT, Claude & Gemini.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafaf9]">
        {children}
      </body>
    </html>
  )
}
