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
    { name: 'About Us', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Tuition & Fees', path: '/pricing' },
    { name: 'Teachers', path: '/teachers' },
    { name: 'Contact', path: '/contact' }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" aria-label="Virtual Zawiyah — Go to homepage" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-2 rounded-md transition-transform duration-300 group-hover:scale-105">
            <span className="font-serif font-bold text-xl">VZ</span>
          </div>
          <span className="font-serif font-bold text-2xl text-primary hidden sm:inline-block">
            Virtual Zawiyah
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.path
            return (
              <Link 
                key={link.path} 
                href={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-foreground/80 hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          
          <div className="flex items-center gap-3 ml-4">
            <Link 
              href="/login"
              className="border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              Portal Login
            </Link>
            <Link 
              href="/enrollment"
              className="bg-secondary text-white hover:bg-secondary/95 px-5 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm flex items-center gap-1.5"
            >
              Apply Now 
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-gray-200/80 shadow-lg z-40 animate-fade-in-up">
          <div className="flex flex-col p-5 gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.path
              return (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`text-base font-semibold p-3 rounded-md transition-all ${
                    isActive 
                      ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                      : 'text-foreground/80 hover:bg-gray-100/50 hover:text-primary'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              )
            })}
            
            <div className="flex flex-col gap-3 pt-3 border-t border-gray-200/50">
              <Link 
                href="/login"
                className="border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 py-3 rounded-md font-semibold text-center transition-colors flex items-center justify-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                Portal Login
              </Link>
              <Link 
                href="/enrollment"
                className="bg-secondary text-white py-3 rounded-md font-semibold text-center shadow-sm flex items-center justify-center gap-1.5"
                onClick={() => setMobileOpen(false)}
              >
                Apply Now
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
