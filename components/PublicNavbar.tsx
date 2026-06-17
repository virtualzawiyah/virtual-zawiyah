'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Menu, X, LogIn, ChevronRight } from 'lucide-react'

export default function PublicNavbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Compass className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent font-sans">
                Virtual Zawiyah
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-[#c19b4c] font-bold leading-none mt-0.5">
                Islamic Academy
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.path
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-emerald-400 ${
                    isActive 
                      ? 'text-emerald-400 border-b-2 border-emerald-500 pb-1.5' 
                      : 'text-zinc-400'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 px-4.5 text-xs font-bold text-zinc-200 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
            >
              <LogIn className="h-4 w-4" />
              Portal Login
            </Link>
            <Link
              href="/enrollment"
              className="flex items-center gap-1 rounded-xl bg-[#c19b4c] hover:bg-[#b08b3e] text-slate-950 py-2.5 px-4.5 text-xs font-bold transition-all shadow-lg shadow-[#c19b4c]/10 active:scale-[0.98]"
            >
              Apply Now
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-450 hover:bg-white/5 hover:text-white transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-950 px-4 py-5 space-y-3 shadow-2xl animate-fade-in-up">
          {navLinks.map((link) => {
            const isActive = pathname === link.path
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-550' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-zinc-200 hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              <LogIn className="h-4 w-4" />
              Portal Login
            </Link>
            <Link
              href="/enrollment"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#c19b4c] hover:bg-[#b08b3e] text-slate-950 py-3 text-sm font-bold shadow-lg active:scale-[0.98] transition-all"
            >
              Apply Now
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
