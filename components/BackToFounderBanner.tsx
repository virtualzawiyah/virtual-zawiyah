'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function BackToFounderBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('from') === 'founder') {
        setShow(true)
      }
    }
  }, [])

  if (!show) return null

  return (
    <div className="bg-zinc-900 border-b border-[#C9A84C]/30 text-white px-8 py-2.5 flex justify-between items-center text-xs font-semibold z-40 relative animate-fade-in shadow-xs shrink-0 select-none">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-zinc-300 font-sans tracking-wide">Viewing Portal as Founder (Abu Sulaiman)</span>
      </div>
      <button 
        onClick={() => {
          window.location.href = '/founder/dashboard'
        }}
        className="flex items-center gap-1.5 px-3 py-1 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white rounded-lg border border-[#C9A84C]/25 transition-all font-bold active:scale-[0.98]"
      >
        <ArrowLeft className="h-3 w-3" />
        <span>Return to Founder Dashboard</span>
      </button>
    </div>
  )
}
