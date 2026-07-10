import Link from 'next/link'
import { Phone, Mail, MessageSquare } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="bg-[#091E36] text-white pt-16 pb-8 border-t border-white/5 relative z-10 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* Logo and Description */}
        <div className="col-span-1 space-y-4">
          <div className="flex items-center gap-3">
            <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" className="h-9 w-auto object-contain" />
            <span className="font-serif font-bold text-xl tracking-tight">Virtual Zawiyah</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            An online Islamic learning platform offering live 1:1 and group Quran/Islamic studies classes via self-hosted Jitsi Meet. Guided by qualified scholars.
          </p>
          
          {/* Social Links */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block">Connect with us</span>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/share/17jfKU4HpL/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook Page" 
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/azzaviyah?igsh=cG01NDF0ZHJtY25u" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram Profile" 
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a 
                href="https://youtube.com/@virtualzawiyah" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="YouTube Channel" 
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C22 8.68 22 12 22 12s0 3.32-.42 4.814c-.23.861-.907 1.538-1.768 1.768C18.32 19 12 19 12 19s-6.32 0-7.814-.42c-.861-.23-1.538-.907-1.768-1.768C2 15.32 2 12 2 12s0-3.32.42-4.814c.23-.861.907-1.538 1.768-1.768C5.68 5 12 5 12 5s6.32 0 7.812.418zM10.07 15.002L15.568 12 10.07 8.998v6.004z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Quick Links */}
        <div>
          <h3 className="font-serif font-bold text-lg mb-4 text-[#C9A84C]">Sitemap</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/" className="text-white/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">Home</Link></li>
            <li><Link href="/about" className="text-white/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">About Us</Link></li>
            <li><Link href="/courses" className="text-white/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">Courses</Link></li>
            <li><Link href="/teachers" className="text-white/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">Faculty</Link></li>
          </ul>
        </div>
        
        {/* Academic Links */}
        <div>
          <h3 className="font-serif font-bold text-lg mb-4 text-[#C9A84C]">Academic Plan</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/admission" className="text-white/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">Admission</Link></li>
            <li><Link href="/fee" className="text-white/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">Fee Details</Link></li>
            <li><Link href="/terms" className="text-white/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">Terms of Service</Link></li>
            <li><Link href="/faq" className="text-white/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">FAQs</Link></li>
          </ul>
        </div>
        
        {/* Contact Info (Placeholder) */}
        <div>
          <h3 className="font-serif font-bold text-lg mb-4 text-[#C9A84C]">Contact Details</h3>
          <ul className="space-y-3.5 text-sm">
            <li className="flex gap-3 items-center text-white/70">
              <Phone className="w-4.5 h-4.5 text-[#C9A84C] shrink-0" />
              <a href="tel:+923255777312" className="hover:text-white hover:underline transition-colors">+92 325 5777312</a>
            </li>
            <li className="flex gap-3 items-center text-white/70">
              <Mail className="w-4.5 h-4.5 text-[#C9A84C] shrink-0" />
              <a href="mailto:info@virtualzawiyah.com" className="hover:text-white hover:underline transition-colors">info@virtualzawiyah.com</a>
            </li>
            <li className="flex gap-3 items-center">
              <MessageSquare className="w-4.5 h-4.5 text-[#C9A84C] shrink-0" />
              <a 
                href="https://wa.me/923255777312" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
              >
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
        
      </div>
      
      {/* Footer Bottom */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-white/40 text-xs gap-4">
        <p>&copy; {new Date().getFullYear()} Virtual Zawiyah. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">Terms of Service</Link>
        </div>
      </div>
      
      {/* Floating WhatsApp CTA */}
      <a 
        href="https://wa.me/923255777312" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white w-14 h-14 rounded-full shadow-lg pulse-ring hover:scale-110 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
        title="Chat with us on WhatsApp"
        aria-label="Chat with Virtual Zawiyah on WhatsApp"
        data-testid="whatsapp-floating-btn"
      >
        <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </footer>
  )
}
