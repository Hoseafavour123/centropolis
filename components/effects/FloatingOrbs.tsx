'use client'

import { motion } from 'framer-motion'

const orbs = [
  { size: 300, color: 'bg-purple-500', delay: 0, x: '10%', y: '20%' },
  { size: 200, color: 'bg-cyan-500', delay: 2, x: '80%', y: '60%' },
  { size: 250, color: 'bg-pink-500', delay: 4, x: '60%', y: '80%' },
  { size: 180, color: 'bg-indigo-500', delay: 1, x: '30%', y: '70%' },
]

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${orb.color} opacity-20 blur-3xl`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}