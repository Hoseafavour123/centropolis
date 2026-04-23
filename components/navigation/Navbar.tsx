'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

const navLinks = [
  { href: '#product', label: 'Product' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isSignedIn } = useUser()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
          scrolled
            ? 'bg-[#0a0a0f]/85 backdrop-blur-md border-b border-white/5'
            : 'border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-sm overflow-hidden">
                <img src="/Binocs.jpg" alt="Binocs" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-white">Binocs</span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center h-8 rounded-md bg-white text-black text-xs font-medium px-3 hover:bg-white/90 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center h-8 rounded-md bg-white text-black text-xs font-medium px-3 hover:bg-white/90 transition-colors"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden text-white p-2 -mr-2"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#0a0a0f] md:hidden pt-14">
          <div className="px-6 py-8 flex flex-col gap-5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-xl font-semibold text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-white/10 my-2" />
            {isSignedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center h-10 rounded-md bg-white text-black text-sm font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="text-base text-white/80"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center h-10 rounded-md bg-white text-black text-sm font-medium"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
