'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, Globe, CheckCircle2, Loader2 } from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  // Validation & Submission state
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; message?: string } = {}
    
    if (!name.trim()) {
      newErrors.name = 'Please enter your name'
    }
    
    if (!email.trim()) {
      newErrors.email = 'Please enter a valid email address'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!message.trim()) {
      newErrors.message = 'Please write at least 10 characters'
    } else if (message.trim().length < 10) {
      newErrors.message = 'Please write at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate network submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setName('')
      setEmail('')
      setMessage('')
    }, 1200)
  }

  return (
    <div className="public-page min-h-screen flex flex-col font-sans">
      <PublicNavbar />

      {/* Hero Header */}
      <section 
        className="relative overflow-hidden py-20" 
        style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 100%)" }}
      >
        <GeometricPattern opacity={0.07} />
        <div className="container mx-auto px-4 relative z-10 text-center animate-fade-in-up">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-semibold">Contact</span>
          </nav>
          <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4" style={{ color: "#1A1A1A" }}>Contact Us</h1>
          <p className="text-lg max-w-xl mx-auto text-gray-650">
            We serve students in all countries and timezones. Reach out — we are happy to help.
          </p>
        </div>
      </section>

      {/* Main Body */}
      <section className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            
            {/* Left: Contact Info */}
            <div className="space-y-10 animate-fade-in-up">
              
              {/* WhatsApp Card */}
              <div className="rounded-2xl p-8 border" style={{ background: "#E8F5EE", borderColor: "rgba(27,107,58,0.2)" }}>
                <svg className="w-12 h-12 mb-4 text-[#25D366] fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.785 9.785 0 0 0-6.96-2.879c-5.43 0-9.855 4.37-9.859 9.801-.002 1.741.485 3.45 1.407 4.966l-.995 3.637 3.792-.987zm11.58-7.16c-.076-.127-.278-.203-.581-.355-.304-.152-1.793-.883-2.071-.984-.279-.101-.482-.152-.684.152-.203.304-.785.984-.963 1.186-.177.203-.355.228-.658.076-.304-.152-1.283-.473-2.443-1.507-.903-.805-1.512-1.8-1.689-2.103-.177-.304-.019-.468.133-.619.136-.136.304-.355.456-.532.152-.177.203-.304.304-.506.101-.203.051-.38-.025-.532-.076-.152-.684-1.647-.937-2.256-.247-.599-.498-.518-.684-.527-.177-.008-.38-.01-.582-.01-.203 0-.532.076-.81.38-.279.304-1.064 1.039-1.064 2.532 0 1.494 1.089 2.937 1.241 3.14.152.203 2.144 3.273 5.193 4.59.724.313 1.29.5 1.732.64.727.23 1.39.198 1.912.12.583-.088 1.794-.733 2.048-1.442.253-.709.253-1.316.177-1.442z"/>
                </svg>
                <h2 className="font-serif font-bold text-2xl mb-3 text-gray-900">Chat with Us on WhatsApp</h2>
                <p className="mb-5 text-sm leading-relaxed text-gray-600">
                  The fastest way to reach us. Our team is available to answer questions about courses, fees, schedules, and enrollment.
                </p>
                <a
                  href="https://wa.me/923355777312"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="btn-whatsapp-contact"
                  className="inline-flex items-center gap-3 text-white hover:opacity-90 font-bold px-6 py-3 rounded-xl transition-all shadow-md"
                  style={{ background: "#25D366" }}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.785 9.785 0 0 0-6.96-2.879c-5.43 0-9.855 4.37-9.859 9.801-.002 1.741.485 3.45 1.407 4.966l-.995 3.637 3.792-.987zm11.58-7.16c-.076-.127-.278-.203-.581-.355-.304-.152-1.793-.883-2.071-.984-.279-.101-.482-.152-.684.152-.203.304-.785.984-.963 1.186-.177.203-.355.228-.658.076-.304-.152-1.283-.473-2.443-1.507-.903-.805-1.512-1.8-1.689-2.103-.177-.304-.019-.468.133-.619.136-.136.304-.355.456-.532.152-.177.203-.304.304-.506.101-.203.051-.38-.025-.532-.076-.152-.684-1.647-.937-2.256-.247-.599-.498-.518-.684-.527-.177-.008-.38-.01-.582-.01-.203 0-.532.076-.81.38-.279.304-1.064 1.039-1.064 2.532 0 1.494 1.089 2.937 1.241 3.14.152.203 2.144 3.273 5.193 4.59.724.313 1.29.5 1.732.64.727.23 1.39.198 1.912.12.583-.088 1.794-.733 2.048-1.442.253-.709.253-1.316.177-1.442z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>

              {/* Contact Details */}
              <div className="space-y-5">
                <h3 className="font-serif font-bold text-xl text-gray-900">Other Ways to Reach Us</h3>

                <a href="mailto:info@virtualzawiyah.com" className="flex items-center gap-4 group" data-testid="link-email">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <Mail className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 text-secondary">Email</div>
                    <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      info@virtualzawiyah.com
                    </div>
                  </div>
                </a>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 text-secondary">WhatsApp Numbers</div>
                    <div className="font-semibold text-gray-900 text-sm">
                      +92 335 5777312 <span className="text-[10px] text-gray-400 font-normal italic">(Primary)</span>
                      &nbsp;·&nbsp;
                      +92 325 5777312 <span className="text-[10px] text-gray-400 font-normal italic">(Secondary)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 text-secondary">Serving</div>
                    <div className="font-semibold text-gray-900">Students in all countries and timezones</div>
                  </div>
                </div>

              </div>

              {/* Social */}
              <div>
                <h3 className="font-serif font-bold text-xl mb-4 text-gray-900">Follow Us</h3>
                <div className="flex gap-4">
                  {[
                    { label: "Facebook", href: "https://www.facebook.com/share/17jfKU4HpL/", svg: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    ) },
                    { label: "Instagram", href: "https://www.instagram.com/azzaviyah?igsh=cG01NDF0ZHJtY25u", svg: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    ) },
                    { label: "YouTube", href: "https://youtube.com/@virtualzawiyah", svg: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C22 8.68 22 12 22 12s0 3.32-.42 4.814c-.23.861-.907 1.538-1.768 1.768C18.32 19 12 19 12 19s-6.32 0-7.814-.42c-.861-.23-1.538-.907-1.768-1.768C2 15.32 2 12 2 12s0-3.32.42-4.814c.23-.861.907-1.538 1.768-1.768C5.68 5 12 5 12 5s6.32 0 7.812.418zM10.07 15.002L15.568 12 10.07 8.998v6.004z" clipRule="evenodd" />
                      </svg>
                    ) },
                  ].map(({ label, href, svg }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center text-primary transition-all hover:bg-primary hover:text-white"
                      data-testid={`link-social-${label.toLowerCase()}`}
                    >
                      {svg}
                    </a>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Contact Form */}
            <div className="animate-fade-in-up">
              <div 
                className="rounded-2xl border bg-white p-8 md:p-10 shadow-sm"
                style={{ borderColor: "rgba(27,107,58,0.15)" }}
              >
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="font-serif font-bold text-2xl mb-3 text-gray-900">Message Received!</h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-650 max-w-sm mx-auto mb-6">
                      Thank you for reaching out. We will get back to you as soon as possible. You can also reach us directly on WhatsApp for a faster response.
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-primary text-primary hover:bg-primary/5 py-2.5 px-6 text-xs font-bold"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-serif font-bold text-2xl mb-2 text-gray-900">Send Us a Message</h2>
                    <p className="text-xs text-gray-450 mb-8 font-semibold">Have a question? We&apos;d love to hear from you.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                      
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="text-xs font-bold text-gray-700">Your Name *</label>
                        <input 
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value)
                            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                          }}
                          placeholder="Full name"
                          required
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none h-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                        {errors.name && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.name}</p>}
                      </div>
                      
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-bold text-gray-700">Email Address *</label>
                        <input 
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
                          }}
                          placeholder="your@email.com"
                          required
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none h-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                        {errors.email && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.email}</p>}
                      </div>
                      
                      <div className="space-y-1.5">
                        <label htmlFor="message" className="text-xs font-bold text-gray-700">Message *</label>
                        <textarea 
                          id="message"
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value)
                            if (errors.message) setErrors(prev => ({ ...prev, message: undefined }))
                          }}
                          placeholder="How can we help you?"
                          rows={5}
                          required
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-sans resize-y"
                        />
                        {errors.message && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-white font-bold h-12 text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                        data-testid="btn-submit-contact"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
