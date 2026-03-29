'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
  href?: string
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  className = '',
  href
}: ButtonProps) {
  const baseStyles = "relative overflow-hidden font-semibold rounded-full transition-all duration-300 inline-flex items-center justify-center gap-2"
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] border border-white/10",
    secondary: "bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20",
    outline: "bg-transparent border-2 border-white/30 text-white hover:border-white/60 hover:bg-white/5",
  }
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  const Component = href ? motion.a : motion.button
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Component>
  )
}