import { CheckCircle2, ChevronRight, Menu, X, Phone, Mail } from "lucide-react"; // X kept for mobile menu close button
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";


export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Courses", path: "/courses" },
    { name: "Fees", path: "/fees" },
    { name: "Teachers", path: "/teachers" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" aria-label="Virtual Zawiyah — Go to homepage" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-md">
            <span className="font-serif font-bold text-xl">VZ</span>
          </div>
          <span className="font-serif font-bold text-2xl text-primary hidden sm:inline-block">Virtual Zawiyah</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${location === link.path ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground/80'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            href="/admission"
            className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md font-medium hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-2"
          >
            Apply Now <ChevronRight className="w-4 h-4" />
          </Link>
        </nav>

        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b shadow-lg z-40">
          <div className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`text-lg font-medium p-2 rounded-md ${location === link.path ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-muted'}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              href="/admission"
              className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md font-medium text-center shadow-sm"
              onClick={() => setMobileOpen(false)}
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0D2B55] text-white pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-primary text-primary-foreground p-2 rounded-md">
              <span className="font-serif font-bold text-xl">VZ</span>
            </div>
            <span className="font-serif font-bold text-2xl">Virtual Zawiyah</span>
          </div>
          <p className="text-white/70 mb-6">
            An online Islamic Academy serving parents and students globally with authentic Islamic education from qualified teachers.
          </p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/share/17jfKU4HpL/" target="_blank" rel="noopener noreferrer" aria-label="Follow Virtual Zawiyah on Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-[#0D2B55] transition-colors"><FaFacebook className="w-5 h-5" /></a>
            <a href="https://www.instagram.com/azzaviyah?igsh=cG01NDF0ZHJtY25u" target="_blank" rel="noopener noreferrer" aria-label="Follow Virtual Zawiyah on Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-[#0D2B55] transition-colors"><FaInstagram className="w-5 h-5" /></a>
            <a href="https://youtube.com/@virtualzawiyah" target="_blank" rel="noopener noreferrer" aria-label="Subscribe to Virtual Zawiyah on YouTube" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-[#0D2B55] transition-colors"><FaYoutube className="w-5 h-5" /></a>
          </div>
        </div>
        
        <div>
          <h3 className="font-serif font-bold text-xl mb-4 text-secondary">Quick Links</h3>
          <ul className="space-y-3">
            <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/about" className="text-white/70 hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/courses" className="text-white/70 hover:text-white transition-colors">Courses</Link></li>
            <li><Link href="/teachers" className="text-white/70 hover:text-white transition-colors">Teachers</Link></li>
            <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-serif font-bold text-xl mb-4 text-secondary">Admissions</h3>
          <ul className="space-y-3">
            <li><Link href="/admission" className="text-white/70 hover:text-white transition-colors">Apply Now</Link></li>
            <li><Link href="/fees" className="text-white/70 hover:text-white transition-colors">Tuition & Fees</Link></li>
            <li><Link href="/terms" className="text-white/70 hover:text-white transition-colors">Our Policies</Link></li>
            <li><Link href="/faq" className="text-white/70 hover:text-white transition-colors">FAQ</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-serif font-bold text-xl mb-4 text-secondary">Contact Us</h3>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <Phone className="w-5 h-5 text-secondary shrink-0" />
              <span className="text-white/70">+92 335 5777312</span>
            </li>
            <li className="flex gap-3">
              <Mail className="w-5 h-5 text-secondary shrink-0" />
              <span className="text-white/70">info@virtualzawiyah.com</span>
            </li>
            <li className="flex gap-3">
              <FaWhatsapp className="w-5 h-5 text-secondary shrink-0" />
              <a href="https://wa.me/923355777312" className="text-white/70 hover:text-white transition-colors">Chat on WhatsApp</a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-white/50 text-sm">
        <p>&copy; 2026 Virtual Zawiyah. All Rights Reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

export function FloatingWhatsApp() {
  return (
    <a 
      href="https://wa.me/923355777312" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg pulse-ring hover:scale-110 transition-transform"
      title="Chat with us on WhatsApp"
      aria-label="Chat with Virtual Zawiyah on WhatsApp (+92 335 5777312)"
      data-testid="whatsapp-floating-btn"
    >
      <FaWhatsapp className="w-8 h-8" />
    </a>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <FloatingWhatsApp />
      <Footer />
    </div>
  );
}

export function GeometricPattern({ className = "", opacity = 0.09 }: { className?: string, opacity?: number }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* 8-pointed Islamic star tile — clean, single-element, well-spaced */}
          <pattern id="islamic-star" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* Central 8-pointed star */}
            <path
              d="M40,22 L42.68,33.53 L52.73,27.27 L46.47,37.32 L58,40 L46.47,42.68 L52.73,52.73 L42.68,46.47 L40,58 L37.32,46.47 L27.27,52.73 L33.53,42.68 L22,40 L33.53,37.32 L27.27,27.27 L37.32,33.53 Z"
              fill="none"
              stroke="#1B6B3A"
              strokeWidth="1"
            />
            {/* Small diamond at each corner for tiling continuity */}
            <path d="M0,40 L4,36 L8,40 L4,44 Z" fill="none" stroke="#1B6B3A" strokeWidth="0.8" />
            <path d="M80,40 L76,36 L72,40 L76,44 Z" fill="none" stroke="#1B6B3A" strokeWidth="0.8" />
            <path d="M40,0 L36,4 L40,8 L44,4 Z" fill="none" stroke="#1B6B3A" strokeWidth="0.8" />
            <path d="M40,80 L36,76 L40,72 L44,76 Z" fill="none" stroke="#1B6B3A" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#islamic-star)" />
      </svg>
    </div>
  );
}
