'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Shield, Globe, Users, ShieldCheck } from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'

const values = [
  { icon: BookOpen, title: "Authentic Islamic Knowledge", desc: "We teach from the traditional, chain-transmitted Islamic sciences — the same knowledge passed down through generations of scholars." },
  { icon: Users, title: "Qualified Teachers", desc: "Every teacher holds formal Islamic qualifications. We do not allow unqualified individuals to teach sacred knowledge." },
  { icon: Shield, title: "Safe and Respectful Environment", desc: "We maintain strict standards of adab (etiquette) in every class. Students learn in a secure, dignified, and professional environment." },
  { icon: Globe, title: "Accessible to All", desc: "Islamic education should not be limited by geography. We serve students in every country, every timezone, at every level." },
]

const orgLevels = [
  { role: "Administration", desc: "Oversees all program operations and student welfare" },
  { role: "Supervisor", desc: "Manages teacher quality and academic standards" },
  { role: "Teacher", desc: "Delivers classes and tracks student progress" },
  { role: "Student", desc: "Learns, grows, and connects with their deen" },
]

export default function AboutPage() {
  return (
    <div className="public-page min-h-screen flex flex-col font-sans">
      <PublicNavbar />

      {/* Hero */}
      <section 
        className="relative overflow-hidden py-16" 
        style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 100%)" }}
      >
        <GeometricPattern opacity={0.07} />
        <div className="container mx-auto px-4 relative z-10 text-center animate-fade-in-up">
          <nav className="text-sm text-gray-500 mb-6" aria-label="breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-semibold">About</span>
          </nav>
          <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4" style={{ color: "#1A1A1A" }}>About Us</h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-600">
            Rooted in tradition. Delivered with excellence. Serving the global Muslim community.
          </p>
        </div>
      </section>

      {/* Platform Story */}
      <section className="py-24 bg-background relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
            <div className="animate-fade-in-up">
              <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Our Story</span>
              <h2 className="font-serif font-bold text-3xl md:text-4xl mt-2 mb-6" style={{ color: "#1A1A1A" }}>Why Virtual Zawiyah Was Founded</h2>
              <p className="leading-relaxed mb-4 text-gray-750 text-sm">
                Virtual Zawiyah was founded with a simple but urgent vision: to make authentic Islamic education accessible to every Muslim, wherever they live. For too long, the lack of qualified Islamic teachers outside Muslim-majority countries has left communities disconnected from their deen.
              </p>
              <p className="leading-relaxed mb-4 text-gray-750 text-sm">
                Our founders — scholars and educators who saw this gap firsthand — built this platform to bridge it. We offer the same quality of instruction you would find in a traditional madrasa, delivered through modern technology to your home.
              </p>
              <p className="leading-relaxed text-gray-750 text-sm italic">
                The word <em className="font-semibold text-primary">zawiyah</em> refers to a corner or gathering place for Islamic learning. That is what we aim to be — your corner of the world where sacred knowledge is transmitted with care, dignity, and excellence.
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-primary/10 shadow-lg animate-fade-in-up bg-white aspect-[4/3] w-full min-h-[300px]">
              <Image
                src="/qari-sahib.png"
                alt="Qari Sahib"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

          </div>
        </div>
      </section>

      {/* Mission and Values */}
      <section className="py-24 relative z-10" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Our Principles</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>Mission and Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div
                  key={i}
                  className="rounded-xl p-8 border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  style={{ borderColor: "rgba(27,107,58,0.15)" }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-650">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gender Segregation Policy */}
      <section className="py-20 bg-primary relative overflow-hidden z-10">
        <GeometricPattern opacity={0.05} />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center animate-fade-in-up">
          <ShieldCheck className="w-14 h-14 text-secondary mx-auto mb-6" />
          <h2 className="font-serif font-bold text-3xl text-white mb-5">Our Gender Segregation Policy</h2>
          <p className="text-white/90 text-lg leading-relaxed mb-4">
            At Virtual Zawiyah, we take the Islamic principle of gender segregation seriously. <strong className="text-white">Male teachers teach male students only. Female teachers teach female students only.</strong>
          </p>
          <p className="text-white/75 leading-relaxed text-sm">
            This applies to all one-on-one and group classes. We maintain this policy without exception, because we believe sacred knowledge is best transmitted in an environment of Islamic propriety. Parents and guardians can enroll their children with complete peace of mind.
          </p>
        </div>
      </section>

      {/* Organizational Structure */}
      <section className="py-24 bg-background relative z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-14 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">How We Are Organized</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>Our Structure</h2>
          </div>
          <div className="flex flex-col items-center gap-0">
            {orgLevels.map((level, i) => (
              <div
                key={i}
                className="flex flex-col items-center w-full max-w-sm animate-fade-in-up"
              >
                <div 
                  className="w-full rounded-xl p-5 text-center border shadow-sm" 
                  style={{ 
                    background: i === 0 ? "#1B6B3A" : i === 3 ? "#E8F5EE" : "#FAFAF7", 
                    borderColor: "rgba(27,107,58,0.2)", 
                    color: i === 0 ? "#fff" : "#1A1A1A" 
                  }}
                >
                  <div className="font-serif font-bold text-xl mb-1">{level.role}</div>
                  <div className="text-sm" style={{ color: i === 0 ? "rgba(255,255,255,0.75)" : "#666" }}>{level.desc}</div>
                </div>
                {i < orgLevels.length - 1 && (
                  <div className="w-0.5 h-8 bg-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative z-10" style={{ background: "#E8F5EE" }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif font-bold text-3xl mb-4" style={{ color: "#1A1A1A" }}>Ready to Begin Learning?</h2>
          <p className="mb-8 text-lg max-w-md mx-auto text-gray-650">Take the first step towards authentic Islamic knowledge. Apply today.</p>
          <Link 
            href="/enrollment" 
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-white py-3.5 px-10 font-semibold shadow-md transition-colors"
          >
            Begin Your Journey
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
