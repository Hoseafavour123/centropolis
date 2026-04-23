import { Navbar } from '@/components/navigation/Navbar'
import { Hero } from '@/components/sections/Hero'
import { WhatItDoes } from '@/components/sections/WhatItDoes'
import { SentinelShowcase } from '@/components/sections/SentinelShowcase'
import { PromptMarquee } from '@/components/sections/PromptMarquee'
import { Features } from '@/components/sections/Features'
import { Pricing } from '@/components/sections/Pricing'
import { Faq } from '@/components/sections/Faq'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { Footer } from '@/components/sections/Footer'

export default function Home() {
  return (
    <main className="relative min-h-screen landing-grid text-white">
      <Navbar />

      <Hero />
      <WhatItDoes />
      <SentinelShowcase />
      <PromptMarquee />
      <Features />
      <Pricing />
      <Faq />
      <FinalCTA />
      <Footer />
    </main>
  )
}
