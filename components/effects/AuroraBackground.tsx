'use client'

import { motion } from 'framer-motion'

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]" />
      
      {/* Animated aurora blobs */}
      <motion.div
        className="absolute top-0 -left-1/4 w-[800px] h-[800px] rounded-full bg-purple-600/20 aurora-blob"
        style={{ animationDelay: '0s' }}
      />
      <motion.div
        className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/20 aurora-blob"
        style={{ animationDelay: '-7s' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-[700px] h-[700px] rounded-full bg-cyan-600/15 aurora-blob"
        style={{ animationDelay: '-14s' }}
      />
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}