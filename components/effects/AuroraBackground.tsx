'use client'

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep navy-black base */}
      <div className="absolute inset-0 bg-[#050d1a]" />

      {/* Subtle vertical gradient — lighter at top */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#071428] via-[#050d1a] to-[#030810]" />

      {/* Electric-blue aurora blobs */}
      <div
        className="absolute -top-32 -left-48 w-[700px] h-[700px] rounded-full bg-[#1a6bff]/[0.12] aurora-blob"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="absolute top-1/3 -right-64 w-[600px] h-[600px] rounded-full bg-[#0a3bcc]/[0.10] aurora-blob"
        style={{ animationDelay: '-9s' }}
      />

      {/* Very faint bottom glow to ground the page */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-[#1a6bff]/[0.06] blur-3xl" />

      {/* Scanlines — ultra-subtle */}
      <div className="absolute inset-0 scanlines opacity-100" />
    </div>
  )
}