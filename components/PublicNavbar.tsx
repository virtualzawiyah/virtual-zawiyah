'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronRight, LogIn } from 'lucide-react'

export default function PublicNavbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Teachers', path: '/teachers' },
    { name: 'Fee', path: '/fee' },
    { name: 'Contact', path: '/contact' },
    { name: 'Feedback', path: '/feedback' }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/40 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo / Wordmark */}
        <Link 
          href="/" 
          aria-label="Virtual Zawiyah — Go to homepage" 
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1"
        >
          <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl text-primary leading-none">
              Virtual Zawiyah
            </span>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5 font-bold font-sans">
              Live Islamic Learning
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.path
              return (
                <li key={link.path}>
                  <Link 
                    href={link.path}
                    className={`text-sm font-semibold transition-colors py-2 px-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded ${
                      isActive 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-gray-650 hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              )
            })}
          </ul>
          
          <div className="flex items-center gap-3 border-l border-gray-200 pl-6 ml-1">
            <Link 
              href="/login"
              className="text-gray-650 hover:text-primary px-3 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
            <Link 
              href="/admission"
              className="bg-primary hover:bg-primary/95 text-white active:scale-[0.98] px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-1"
            >
              Admission
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button 
          className="lg:hidden p-2 text-gray-750 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-200 shadow-xl z-40 animate-fade-in-up">
          <nav className="flex flex-col p-6 gap-4">
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.path
                return (
                  <li key={link.path}>
                    <Link 
                      key={link.path} 
                      href={link.path}
                      className={`text-base font-semibold block p-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                        isActive 
                          ? 'bg-primary/10 text-primary border-l-4 border-primary pl-4' 
                          : 'text-gray-750 hover:bg-gray-50 hover:text-primary'
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
            
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              <Link 
                href="/login"
                className="border border-gray-300 text-gray-750 hover:bg-gray-50 py-3 rounded-lg font-semibold text-center transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setMobileOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                Portal Login
              </Link>
              <Link 
                href="/admission"
                className="bg-primary hover:bg-primary/95 text-white py-3 rounded-lg font-bold text-center shadow-md flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setMobileOpen(false)}
              >
                Admission
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
