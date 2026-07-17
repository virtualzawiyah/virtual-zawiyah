'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  User, 
  Award, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2, 
  AlertCircle,
  FileText,
  Image as ImageIcon
} from 'lucide-react'

interface ProfileState {
  full_name: string
  avatar_url: string
  education: string
  experience: string
}

interface RequestState {
  id: string
  new_avatar_url: string
  new_education: string
  new_experience: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<ProfileState | null>(null)
  const [latestRequest, setLatestRequest] = useState<RequestState | null>(null)
  const [loading, setLoading] = useState(true)

  // Form Fields
  const [avatarUrl, setAvatarUrl] = useState('')
  const [education, setEducation] = useState('')
  const [experience, setExperience] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const response = await fetch('/api/teacher/profile-update')
      const result = await response.json()
      if (response.ok && result.success) {
        setProfile(result.profile)
        setLatestRequest(result.latestRequest)

        // Pre-populate fields
        setAvatarUrl(result.latestRequest && result.latestRequest.status === 'pending'
          ? result.latestRequest.new_avatar_url || ''
          : result.profile.avatar_url || ''
        )
        setEducation(result.latestRequest && result.latestRequest.status === 'pending'
          ? result.latestRequest.new_education || ''
          : result.profile.education || ''
        )
        setExperience(result.latestRequest && result.latestRequest.status === 'pending'
          ? result.latestRequest.new_experience || ''
          : result.profile.experience || ''
        )
      } else {
        throw new Error(result.error || 'Failed to fetch profile details')
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Error loading profile data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const response = await fetch('/api/teacher/profile-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_avatar_url: avatarUrl,
          new_education: education,
          new_experience: experience
        })
      })

      const result = await response.json()
      if (response.ok && result.success) {
        setSuccessMsg('Your profile update request has been submitted for approval!')
        // Reload data to reflect pending status
        await loadData()
      } else {
        throw new Error(result.error || 'Failed to submit profile request')
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'An error occurred while submitting changes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B6B3A]" />
        <span className="text-xs text-zinc-500 font-sans ml-2">Loading profile details...</span>
      </div>
    )
  }

  const hasPendingRequest = latestRequest?.status === 'pending'

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4 font-sans select-none animate-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900">Teacher Profile</h1>
          <p className="text-xs text-zinc-500">Edit details displayed on the public faculty page</p>
        </div>
      </div>

      {/* Pending status banners */}
      {hasPendingRequest && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-xs text-amber-850">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <p className="font-bold">Pending Review</p>
            <p className="text-amber-700 leading-relaxed">
              Your profile updates are currently under review by the Content Manager. 
              The form fields are locked. You can view your pending request values below.
            </p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 text-xs text-emerald-850">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex gap-3 text-xs text-rose-850">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="font-bold">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar/Preview */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Public Avatar Photo</span>
            
            {/* Live photo preview */}
            <div className="relative inline-block">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar Preview" 
                  onError={(e) => {
                    // Fallback to initials if URL is broken
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'Teacher')}&background=E8F5EE&color=1B6B3A&size=128`
                  }}
                  className="w-32 h-32 rounded-full object-cover border-2 border-zinc-200 mx-auto shadow-sm"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-emerald-50 border-2 border-[#1B6B3A]/20 flex items-center justify-center font-serif text-3xl text-[#1B6B3A] font-bold mx-auto">
                  {profile?.full_name ? profile.full_name.split(' ').map(p=>p[0]).join('').substring(0,2) : 'T'}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg text-zinc-800">{profile?.full_name}</h3>
              <span className="text-[10px] uppercase tracking-wider bg-zinc-100 text-zinc-650 px-3 py-1 rounded-full font-bold">Faculty Scholar</span>
            </div>
          </div>

          {/* Current profile snapshot card */}
          {!hasPendingRequest && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4 text-xs">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Current Live Details</span>
              
              <div className="space-y-3">
                <div>
                  <span className="font-bold text-zinc-650 flex items-center gap-1.5 mb-1"><Award className="w-3.5 h-3.5" /> Education</span>
                  <p className="text-zinc-500 italic leading-relaxed">{profile?.education || 'No details added yet.'}</p>
                </div>
                
                <div className="pt-2 border-t border-zinc-200">
                  <span className="font-bold text-zinc-650 flex items-center gap-1.5 mb-1"><Briefcase className="w-3.5 h-3.5" /> Experience</span>
                  <p className="text-zinc-500 italic leading-relaxed">{profile?.experience || 'No details added yet.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-5 pb-2 border-b border-zinc-100">
              {hasPendingRequest ? 'Proposed Profile Changes' : 'Edit Profile Information'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Photo URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-650 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-400" /> Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  disabled={hasPendingRequest || isSubmitting}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white placeholder-zinc-350 text-zinc-800 focus:outline-hidden focus:border-[#1B6B3A] transition-all"
                />
                <span className="block text-[9px] text-zinc-400 italic">Please paste a URL pointing to your professional headshot image.</span>
              </div>

              {/* Education */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-650 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-zinc-400" /> Qualifications & Education
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Hafiz, Alim (Dars-e-Nizami graduate from Darul Uloom), Tajweed Certified"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  disabled={hasPendingRequest || isSubmitting}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white placeholder-zinc-350 text-zinc-800 focus:outline-hidden focus:border-[#1B6B3A] transition-all resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-650 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-400" /> Biography & Experience
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Over 10 years teaching Quran recitation, Hifz, and Arabic grammar. Specializes in tailoring lessons for young learners and beginners."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  disabled={hasPendingRequest || isSubmitting}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white placeholder-zinc-350 text-zinc-800 focus:outline-hidden focus:border-[#1B6B3A] transition-all resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Action Button */}
              {!hasPendingRequest && (
                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-6 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm disabled:opacity-50 select-none"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSubmitting ? 'Submitting request...' : 'Save & Submit Changes'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* If there is a pending request, show comparison */}
          {hasPendingRequest && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 space-y-4">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1"><FileText className="w-4 h-4 text-zinc-400" /> Comparison (Current Live vs Pending Approval)</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
                  <span className="block font-bold text-zinc-450 uppercase text-[9px]">Live Profile</span>
                  <div>
                    <span className="font-bold text-zinc-650 block">Qualifications</span>
                    <p className="text-zinc-500 italic mt-0.5 leading-relaxed">{profile?.education || 'Empty'}</p>
                  </div>
                  <div className="pt-2 border-t border-zinc-100">
                    <span className="font-bold text-zinc-650 block">Biography</span>
                    <p className="text-zinc-500 italic mt-0.5 leading-relaxed">{profile?.experience || 'Empty'}</p>
                  </div>
                </div>

                <div className="bg-emerald-50/40 border border-emerald-200/50 rounded-xl p-4 space-y-3">
                  <span className="block font-bold text-[#1B6B3A] uppercase text-[9px]">Proposed Changes</span>
                  <div>
                    <span className="font-bold text-zinc-700 block">Qualifications</span>
                    <p className="text-zinc-800 font-semibold mt-0.5 leading-relaxed">{latestRequest?.new_education || 'Empty'}</p>
                  </div>
                  <div className="pt-2 border-t border-emerald-100">
                    <span className="font-bold text-zinc-700 block">Biography</span>
                    <p className="text-zinc-800 font-semibold mt-0.5 leading-relaxed">{latestRequest?.new_experience || 'Empty'}</p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
