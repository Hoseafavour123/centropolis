'use client'

import { motion } from 'framer-motion'

const orbs = [
  { size: 320, color: '#1a6bff', delay: 0, x: '8%', y: '18%', opacity: 0.08 },
  { size: 240, color: '#0a3bcc', delay: 3, x: '78%', y: '55%', opacity: 0.07 },
]

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
            opacity: orb.opacity,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, 12, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 10,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}