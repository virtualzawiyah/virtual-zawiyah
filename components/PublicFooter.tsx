import Link from 'next/link'
import { Compass, Mail, Phone } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 py-12 text-zinc-400 backdrop-blur-md relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <Compass className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">Virtual Zawiyah</span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed font-sans font-light">
              Specialized online Islamic academy offering professional one-on-one Quran reading, Tajweed rules, Arabic language, and Islamic Studies curriculum for students worldwide.
            </p>
          </div>

          {/* Site links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Sitemap</h4>
            <div className="flex flex-col gap-2 text-xs font-semibold">
              <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
              <Link href="/courses" className="hover:text-emerald-400 transition-colors">Our Courses</Link>
              <Link href="/pricing" className="hover:text-emerald-400 transition-colors">Tuition & Fees</Link>
              <Link href="/enrollment" className="hover:text-emerald-400 transition-colors">Admissions Portal</Link>
              <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link>
            </div>
          </div>

          {/* Policies links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Legal & Resources</h4>
            <div className="flex flex-col gap-2 text-xs font-semibold">
              <Link href="/login" className="hover:text-emerald-400 transition-colors">Portal Login</Link>
              <span className="cursor-not-allowed text-zinc-650">Privacy Policy</span>
              <span className="cursor-not-allowed text-zinc-650">Terms of Service</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Get in Touch</h4>
            <div className="space-y-2.5 text-xs font-sans text-zinc-500">
              <p className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>info@virtualzawiyah.com</span>
              </p>
              <p className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>+92 335 5777312 (WhatsApp)</span>
              </p>
              <p className="text-[10px] text-zinc-600 leading-normal font-light">
                Live classes operate in UTC, scheduled locally for students in USA, UK, Canada, Australia, and Middle East.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-8 border-t border-white/5 pt-6 text-center text-[10px] text-zinc-600 leading-normal">
          <p>© {new Date().getFullYear()} Virtual Zawiyah Academy. All rights reserved. Registered Islamic Education Academy.</p>
        </div>
      </div>
    </footer>
  )
}
