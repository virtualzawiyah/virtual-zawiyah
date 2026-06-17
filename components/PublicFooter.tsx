import Link from 'next/link'
import { Phone, Mail, MessageSquare } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="bg-[#0D2B55] text-white pt-16 pb-8 border-t border-white/5 relative z-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* Logo and Description */}
        <div className="col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary text-primary-foreground p-2 rounded-md">
              <span className="font-serif font-bold text-xl">VZ</span>
            </div>
            <span className="font-serif font-bold text-2xl">Virtual Zawiyah</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed mb-6">
            An online Islamic Academy serving parents and students globally with authentic Islamic education from qualified teachers.
          </p>
          
          {/* Social Links */}
          <div className="flex gap-4">
            <a 
              href="https://www.facebook.com/share/17jfKU4HpL/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Follow Virtual Zawiyah on Facebook" 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-[#0D2B55] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a 
              href="https://www.instagram.com/azzaviyah?igsh=cG01NDF0ZHJtY25u" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Follow Virtual Zawiyah on Instagram" 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-[#0D2B55] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a 
              href="https://youtube.com/@virtualzawiyah" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Subscribe to Virtual Zawiyah on YouTube" 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-[#0D2B55] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C22 8.68 22 12 22 12s0 3.32-.42 4.814c-.23.861-.907 1.538-1.768 1.768C18.32 19 12 19 12 19s-6.32 0-7.814-.42c-.861-.23-1.538-.907-1.768-1.768C2 15.32 2 12 2 12s0-3.32.42-4.814c.23-.861.907-1.538 1.768-1.768C5.68 5 12 5 12 5s6.32 0 7.812.418zM10.07 15.002L15.568 12 10.07 8.998v6.004z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
        
        {/* Quick Links */}
        <div>
          <h3 className="font-serif font-bold text-xl mb-4 text-secondary">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/about" className="text-white/70 hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/courses" className="text-white/70 hover:text-white transition-colors">Courses</Link></li>
            <li><Link href="/teachers" className="text-white/70 hover:text-white transition-colors">Teachers</Link></li>
            <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
        
        {/* Admissions */}
        <div>
          <h3 className="font-serif font-bold text-xl mb-4 text-secondary">Admissions</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/enrollment" className="text-white/70 hover:text-white transition-colors">Apply Now</Link></li>
            <li><Link href="/pricing" className="text-white/70 hover:text-white transition-colors">Tuition & Fees</Link></li>
            <li><Link href="/terms" className="text-white/70 hover:text-white transition-colors">Our Policies</Link></li>
            <li><Link href="/faq" className="text-white/70 hover:text-white transition-colors">FAQ</Link></li>
          </ul>
        </div>
        
        {/* Contact Info */}
        <div>
          <h3 className="font-serif font-bold text-xl mb-4 text-secondary">Contact Us</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3 items-center">
              <Phone className="w-5 h-5 text-secondary shrink-0" />
              <span className="text-white/70">+92 335 5777312</span>
            </li>
            <li className="flex gap-3 items-center">
              <Mail className="w-5 h-5 text-secondary shrink-0" />
              <span className="text-white/70">info@virtualzawiyah.com</span>
            </li>
            <li className="flex gap-3 items-center">
              <MessageSquare className="w-5 h-5 text-secondary shrink-0" />
              <a 
                href="https://wa.me/923355777312" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-white transition-colors"
              >
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
        
      </div>
      
      <div className="container mx-auto px-4 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-white/50 text-sm">
        <p>&copy; {new Date().getFullYear()} Virtual Zawiyah. All Rights Reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
      
      {/* Floating WhatsApp CTA */}
      <a 
        href="https://wa.me/923355777312" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg pulse-ring hover:scale-110 transition-transform flex items-center justify-center"
        title="Chat with us on WhatsApp"
        aria-label="Chat with Virtual Zawiyah on WhatsApp (+92 335 5777312)"
        data-testid="whatsapp-floating-btn"
      >
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.785 9.785 0 0 0-6.96-2.879c-5.43 0-9.855 4.37-9.859 9.801-.002 1.741.485 3.45 1.407 4.966l-.995 3.637 3.792-.987zm11.58-7.16c-.076-.127-.278-.203-.581-.355-.304-.152-1.793-.883-2.071-.984-.279-.101-.482-.152-.684.152-.203.304-.785.984-.963 1.186-.177.203-.355.228-.658.076-.304-.152-1.283-.473-2.443-1.507-.903-.805-1.512-1.8-1.689-2.103-.177-.304-.019-.468.133-.619.136-.136.304-.355.456-.532.152-.177.203-.304.304-.506.101-.203.051-.38-.025-.532-.076-.152-.684-1.647-.937-2.256-.247-.599-.498-.518-.684-.527-.177-.008-.38-.01-.582-.01-.203 0-.532.076-.81.38-.279.304-1.064 1.039-1.064 2.532 0 1.494 1.089 2.937 1.241 3.14.152.203 2.144 3.273 5.193 4.59.724.313 1.29.5 1.732.64.727.23 1.39.198 1.912.12.583-.088 1.794-.733 2.048-1.442.253-.709.253-1.316.177-1.442z"/>
        </svg>
      </a>
    </footer>

  )
}
