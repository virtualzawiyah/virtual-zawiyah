'use client'

import { useState } from 'react'
import Link from 'next/link'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { Mail, Phone, Clock, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  // Validation & Submission state
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

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
      setIsSuccess(true)
      setName('')
      setEmail('')
      setMessage('')
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex mb-6 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span className="mx-2 text-zinc-700">/</span>
            <span className="text-emerald-400">Contact</span>
          </nav>

          {/* Page Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-4">
              Contact Us
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              We serve students in all countries and timezones. Reach out — we are happy to help.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 max-w-6xl mx-auto">
            
            {/* Left Column: Contact Methods */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* WhatsApp Card */}
              <div className="rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-slate-900/60 to-slate-950 p-6 shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 mb-4">
                  <MessageSquare className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Chat with Us on WhatsApp</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-5 font-sans">
                  The fastest way to reach us. Our team is available to answer questions about courses, fees, schedules, and enrollment.
                </p>
                <a
                  href="https://wa.me/923355777312"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow shadow-emerald-500/10 hover:bg-emerald-500 active:scale-[0.98] transition-all"
                >
                  Chat on WhatsApp
                </a>
              </div>

              {/* Other ways list */}
              <div className="space-y-5 rounded-2xl border border-white/5 bg-slate-900/20 p-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
                  Other Ways to Reach Us
                </h4>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-white/5 border border-white/5 text-zinc-400 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Email</span>
                    <a href="mailto:info@virtualzawiyah.com" className="text-xs text-zinc-350 font-semibold hover:text-emerald-400 transition-colors">
                      info@virtualzawiyah.com
                    </a>
                  </div>
                </div>

                {/* WhatsApp Numbers */}
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-white/5 border border-white/5 text-zinc-400 shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-550 font-bold uppercase tracking-wider">WhatsApp Number</span>
                    <div className="space-y-0.5 mt-0.5 text-xs text-zinc-350 font-semibold">
                      <p>+92 335 5777312 <span className="text-[10px] text-zinc-500 italic font-normal">(Primary)</span></p>
                      <p>+92 325 5777312 <span className="text-[10px] text-zinc-500 italic font-normal">(Secondary)</span></p>
                    </div>
                  </div>
                </div>

                {/* Serving timezone */}
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-white/5 border border-white/5 text-zinc-400 shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Serving</span>
                    <span className="text-xs text-zinc-350 font-semibold">
                      Students in all countries and timezones
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Media Link Icons */}
              <div className="space-y-4 rounded-2xl border border-white/5 bg-slate-900/20 p-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Follow Us
                </h4>
                <div className="flex gap-4">
                  <a
                    href="https://www.facebook.com/share/17jfKU4HpL/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all"
                  >
                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/azzaviyah?igsh=cG01NDF0ZHJtY25u"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all"
                  >
                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                  <a
                    href="https://youtube.com/@virtualzawiyah"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all"
                  >
                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42C1 8.12 1 12 1 12s0 3.88.46 5.58a2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96C23 15.88 23 12 23 12s0-3.88-.46-5.58z"/>
                      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                    </svg>
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column: Message Form */}
            <div className="lg:col-span-7">
              {isSuccess ? (
                /* Success Card */
                <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-8 text-center backdrop-blur-md shadow-xl h-full flex flex-col items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-6">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2.5">Message Received!</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-md mx-auto mb-6">
                    Thank you for reaching out. We will get back to you as soon as possible. You can also reach us directly on WhatsApp for a faster response.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 px-5 text-xs font-bold text-zinc-200 hover:bg-white/10"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                /* Form Card */
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl">
                  
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-white mb-1">Send Us a Message</h3>
                    <p className="text-xs text-zinc-450 font-sans">
                      Have a question? We&apos;d love to hear from you.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Your Name */}
                    <div>
                      <label htmlFor="name" className="block text-xs font-bold text-zinc-300 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                          if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                        }}
                        placeholder="Full name"
                        className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:outline-none focus:ring-1 ${
                          errors.name 
                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/50' 
                            : 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500/50'
                        }`}
                      />
                      {errors.name && (
                        <p className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold mt-1.5">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-zinc-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
                        }}
                        placeholder="your@email.com"
                        className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:outline-none focus:ring-1 ${
                          errors.email 
                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/50' 
                            : 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500/50'
                        }`}
                      />
                      {errors.email && (
                        <p className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold mt-1.5">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Message Textarea */}
                    <div>
                      <label htmlFor="message" className="block text-xs font-bold text-zinc-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        rows={6}
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value)
                          if (errors.message) setErrors(prev => ({ ...prev, message: undefined }))
                        }}
                        placeholder="How can we help you?"
                        className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:outline-none focus:ring-1 resize-y ${
                          errors.message 
                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/50' 
                            : 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500/50'
                        }`}
                      ></textarea>
                      {errors.message && (
                        <p className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold mt-1.5">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{errors.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow shadow-emerald-500/10 hover:bg-emerald-500 active:scale-[0.98] transition-all disabled:opacity-55"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>

                  </form>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
