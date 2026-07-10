'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, Globe, CheckCircle2, Loader2, MessageSquare } from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          email,
          message
        })
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to send message')
      }

      setSubmitted(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (err: any) {
      console.error('Contact submission error:', err)
      setErrorMsg(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
                <svg className="w-12 h-12 mb-4 text-[#25D366] fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <h2 className="font-serif font-bold text-2xl mb-3 text-gray-900">Chat with Us on WhatsApp</h2>
                <p className="mb-5 text-sm leading-relaxed text-gray-600">
                  The fastest way to reach us. Our team is available to answer questions about courses, fees, schedules, and enrollment.
                </p>
                <a
                  href="https://wa.me/923255777312"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="btn-whatsapp-contact"
                  className="inline-flex items-center gap-3 text-white hover:opacity-90 font-bold px-6 py-3 rounded-xl transition-all shadow-md"
                  style={{ background: "#25D366" }}
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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

                <a href="tel:+923255777312" className="flex items-center gap-4 group" data-testid="link-phone">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <Phone className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 text-secondary">Voice Call Number</div>
                    <div className="font-semibold text-gray-900 text-sm group-hover:text-primary transition-colors">
                      +92 325 5777312
                    </div>
                  </div>
                </a>

                <a href="https://wa.me/923255777312" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group" data-testid="link-whatsapp-contact-page">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <MessageSquare className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 text-secondary">WhatsApp Number</div>
                    <div className="font-semibold text-gray-900 text-sm group-hover:text-primary transition-colors">
                      +92 325 5777312
                    </div>
                  </div>
                </a>

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
                    <h3 className="font-serif font-bold text-2xl mb-3 text-gray-900">✅ Message Sent!</h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-650 max-w-sm mx-auto mb-6">
                      We have received your inquiry and will respond within 24 hours.
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
                    
                    {errorMsg && (
                      <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-fade-in">
                        {errorMsg}
                      </div>
                    )}

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
