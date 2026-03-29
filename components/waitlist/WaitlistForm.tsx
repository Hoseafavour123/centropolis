'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export function WaitlistForm() {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setStatus('loading')

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, source: 'landing_page' }),
            })

            const data = await res.json()

            if (res.ok) {
                if (data.status === 'duplicate') {
                    setStatus('duplicate')
                } else {
                    setStatus('success')
                }
                setMessage(data.message)
            } else {
                setStatus('error')
                setMessage(data.error || 'Something went wrong.')
            }
        } catch (error) {
            setStatus('error')
            setMessage('Network error. Please try again.')
        }
    }

    if (status === 'success' || status === 'duplicate') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
            >
                <div className="flex justify-center mb-4">
                    <CheckCircle2 size={48} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-emerald-100/70">{message}</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-sm text-emerald-400 font-medium hover:underline transition-all"
                >
                    Join with another email
                </button>
            </motion.div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">
                    Your Name (Optional)
                </label>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-lg px-4 py-3 w-full focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                />
            </div>

            <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">
                    Email Address
                </label>
                <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-lg px-4 py-3 w-full focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                />
            </div>

            <AnimatePresence>
                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm"
                    >
                        <AlertCircle size={16} />
                        <span>{message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
                {status === 'loading' ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5" />
                        Join Waitlist
                    </>
                )}
            </button>

            <div className="flex items-center justify-center gap-6 mt-6 opacity-40">
                <div className="flex items-center gap-1.5 grayscale">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">No Spam</span>
                </div>
                <div className="flex items-center gap-1.5 grayscale">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Priority Access</span>
                </div>
            </div>
        </form>
    )
}
