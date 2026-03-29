'use client'

import { motion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

const links = {
  product: ['Features', 'Roadmap', 'Changelog', 'Pricing'],
  company: ['About', 'Blog', 'Careers', 'Contact'],
  legal: ['Privacy', 'Terms', 'Security'],
}

const socialLinks = [
  { icon: X, href: 'https://twitter.com/binocs_ai' },
  { icon: MessageCircle, href: 'https://t.me/binocs_ai' },
]

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#0a0a0f]/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-white">Binocs</span>
            </div>
            <p className="text-white/50 text-sm mb-6">
              AI-powered trading terminal for the next generation of crypto traders.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((link, i) => (
                <motion.a
                  key={i}
                  href={link.href}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <link.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4 capitalize">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-white/50 hover:text-white transition-colors text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © 2026 Binocs. All rights reserved.
          </p>
          <p className="text-white/40 text-sm">
            Built with 💜 on Solana
          </p>
        </div>
      </div>
    </footer>
  )
}