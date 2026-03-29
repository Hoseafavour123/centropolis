import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <motion.div
      className={`relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden ${className}`}
      whileHover={hover ? { 
        y: -5,
        borderColor: 'rgba(255,255,255,0.2)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer" />
      {children}
    </motion.div>
  )
}