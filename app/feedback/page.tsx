'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Star, CheckCircle2, Loader2, MessageSquare, ArrowRight } from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'

type SubmitterRole = 'student' | 'parent' | 'guardian' | 'other'

export default function PublicFeedbackPage() {
  const [name, setName] = useState('')
  const [role, setRole] = useState<SubmitterRole>('student')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [content, setContent] = useState('')
  
  // Validation & submission states
  const [errors, setErrors] = useState<{ name?: string; content?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const validateForm = () => {
    const newErrors: { name?: string; content?: string } = {}
    if (!name.trim()) {
      newErrors.name = 'Please enter your name'
    }
    if (!content.trim() || content.trim().length < 10) {
      newErrors.content = 'Please write a message with at least 10 characters'
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
      const response = await fetch('/api/public/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: name,
          author_role: role,
          content,
          rating
        })
      })

      const result = await response.json()
      if (response.ok && result.success) {
        setSubmitted(true)
        setName('')
        setContent('')
        setRating(5)
      } else {
        throw new Error(result.error || 'Failed to submit feedback')
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'An error occurred while submitting. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="public-page min-h-screen flex flex-col font-sans bg-[#FAFAF7]">
      <PublicNavbar />

      {/* Hero Header */}
      <section 
        className="relative overflow-hidden py-16" 
        style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 100%)" }}
      >
        <GeometricPattern opacity={0.07} />
        <div className="container mx-auto px-4 relative z-10 text-center animate-fade-in-up">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-semibold">Submit Feedback</span>
          </nav>
          <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4" style={{ color: "#1A1A1A" }}>Submit Feedback</h1>
          <p className="text-base max-w-xl mx-auto text-gray-650">
            Your reviews help us maintain high academic standards and improve the learning experience for everyone.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="flex-1 py-16 bg-white relative z-10 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">

            {submitted ? (
              <div className="bg-[#E8F5EE]/40 border border-[#1B6B3A]/20 rounded-3xl p-10 text-center space-y-6 shadow-sm animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#1B6B3A]/10 text-primary flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-2xl text-gray-900">Feedback Submitted Successfully!</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Thank you for sharing your experience. Your review has been sent to our Content Manager for verification and will appear on the public landing page testimonials once approved.
                  </p>
                </div>
                <div className="pt-4 flex justify-center gap-4">
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all hover:bg-gray-50 active:scale-95"
                  >
                    Submit Another Review
                  </button>
                  <Link
                    href="/"
                    className="px-6 py-3 bg-[#1B6B3A] text-white font-bold rounded-xl text-sm transition-all hover:bg-[#1B6B3A]/90 active:scale-95 flex items-center gap-2 shadow-xs"
                  >
                    <span>Back to Home</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAFAF7] border border-[#1B6B3A]/10 rounded-3xl p-8 md:p-10 shadow-md space-y-6">
                
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-xl text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Share Your Experience
                  </h3>
                  <p className="text-xs text-gray-500">All reviews are moderated before appearing on the public page.</p>
                </div>

                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-250 text-rose-850 p-4 rounded-xl text-xs font-bold leading-relaxed">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Khalid Siddiqui"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 bg-white placeholder-gray-400 focus:outline-hidden focus:border-primary transition-all text-gray-850"
                      required
                    />
                    {errors.name && <p className="text-[10px] text-rose-600 font-bold">{errors.name}</p>}
                  </div>

                  {/* Role Dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">Your Relationship / Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as SubmitterRole)}
                      className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-primary transition-all text-gray-800"
                    >
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                      <option value="guardian">Guardian</option>
                      <option value="other">Other / Supporter</option>
                    </select>
                  </div>

                  {/* Star Rating Selection */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">Quality Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = hoverRating !== null ? star <= hoverRating : star <= rating
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 hover:scale-110 transition-transform focus:outline-none"
                            title={`${star} Star${star > 1 ? 's' : ''}`}
                          >
                            <Star 
                              className={`w-7 h-7 transition-colors ${
                                isFilled ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-gray-300 fill-transparent'
                              }`} 
                            />
                          </button>
                        )
                      })}
                      <span className="text-xs font-bold text-gray-500 ml-2">
                        {rating} Star{rating > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Content */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">Your Feedback Message</label>
                    <textarea
                      rows={4}
                      placeholder="Share your detailed feedback on course structure, portal conveniences, and teacher pedagogy..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 bg-white placeholder-gray-400 focus:outline-hidden focus:border-primary transition-all text-gray-850 leading-relaxed resize-none"
                      required
                    />
                    {errors.content && <p className="text-[10px] text-rose-600 font-bold">{errors.content}</p>}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white active:scale-[0.98] rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed select-none"
                    >
                      {isSubmitting && <Loader2 className="w-4.5 h-4.5 animate-spin" />}
                      <span>{isSubmitting ? 'Submitting Review...' : 'Submit Feedback Review'}</span>
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
