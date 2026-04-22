import { AuroraBackground } from '@/components/effects/AuroraBackground'
import { ParticleField } from '@/components/effects/ParticleField'
import { FloatingOrbs } from '@/components/effects/FloatingOrbs'
import { Navbar } from '@/components/navigation/Navbar'
import { Hero } from '@/components/sections/Hero'
import { SentinelShowcase } from '@/components/sections/SentinelShowcase'
import { Problem } from '@/components/sections/Problems'
import { Solution } from '@/components/sections/Solutions'
import { Features } from '@/components/sections/Features'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { Footer } from '@/components/sections/Footer'

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Background Effects */}
      <AuroraBackground />
      <FloatingOrbs />
      <ParticleField />

      {/* Navigation */}
      <Navbar />

      {/* Sections */}
      <Hero />
      <SentinelShowcase />
      <Problem />
      <Solution />
      <Features />
      <FinalCTA />
      <Footer />
    </main>
  )
}
