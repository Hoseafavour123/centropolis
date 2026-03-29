'use client'

import { motion } from 'framer-motion'
import { ScrollReveal } from '../effects/ScrollReveal'


export function Features() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">
              Why Binocs{' '}
              <span className="text-gradient">Wins</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Feature Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Speed",
              desc: "Every action completes in under 3 seconds",
              icon: "⚡",
            },
            {
              title: "Simplicity",
              desc: "Interface requires zero learning curve",
              icon: "💬",
            },
            {
              title: "Trust",
              desc: "Clear disclaimers, educational content, no false promises",
              icon: "🛡️",
            },
          ].map((feature, i) => (
            <ScrollReveal key={i} delay={i * 0.2}>
              <motion.div
                className="text-center p-8"
                whileHover={{ y: -10 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/60">{feature.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}