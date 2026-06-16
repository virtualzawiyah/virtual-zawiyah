'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Menu, X, LogIn } from 'lucide-react'

export default function PublicNavbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Enrollment', path: '/enrollment' },
    { name: 'Free Trial', path: '/trial-request' },
    { name: 'Contact', path: '/contact' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/30 group-hover:scale-105 transition-all">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent font-sans">
                Virtual Zawiyah
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-emerald-400 font-semibold leading-none mt-0.5">
                Islamic Academy
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.path
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-xs font-semibold uppercase tracking-wider transition-colors hover:text-emerald-400 ${
                    isActive ? 'text-emerald-400 font-bold border-b border-emerald-500 pb-1' : 'text-zinc-400'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>

          {/* Login Button */}
          <div className="hidden md:flex items-center">
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 px-4 text-xs font-bold text-zinc-200 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 transition-all active:scale-[0.98]"
            >
              <LogIn className="h-4.5 w-4.5" />
              Portal Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-950 px-4 py-4 space-y-2.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.path
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-500' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          <div className="border-t border-white/5 pt-4">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow shadow-emerald-500/5 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all"
            >
              <LogIn className="h-4 w-4" />
              Portal Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
