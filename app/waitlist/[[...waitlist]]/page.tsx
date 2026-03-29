import { WaitlistForm } from '@/components/waitlist/WaitlistForm'
import { AuroraBackground } from '@/components/effects/AuroraBackground'
import { FloatingOrbs } from '@/components/effects/FloatingOrbs'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function WaitlistPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <AuroraBackground />
      <FloatingOrbs />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to home
        </Link>

        <div className="bg-[#0f0f1a]/80 backdrop-blur-2xl rounded-2xl border border-white/10 p-8">
          <WaitlistForm />
        </div>
      </div>
    </main>
  )
}