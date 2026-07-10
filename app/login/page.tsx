'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'
import GeometricPattern from '@/components/GeometricPattern'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })
      console.log('Auth result:', data, error);

      if (error) {
        throw new Error('Incorrect email or password')
      }

      if (data?.user) {
        const role = data.user.user_metadata?.role
        console.log('User metadata role:', role);

        if (!role) {
          await supabase.auth.signOut()
          throw new Error('Failed to retrieve user role from metadata.')
        }
        const allowedRoles = ['student', 'parent']

        if (!allowedRoles.includes(role)) {
          await supabase.auth.signOut()
          throw new Error('This login is for students only. Please use the Staff Portal.')
        }

        // Cache role in user metadata and session cookie
        await supabase.auth.updateUser({ data: { role } })
        document.cookie = `vz_user_role=${role}; path=/; max-age=2592000; SameSite=Lax`

        const getDashboardPath = (roleStr: string) => {
          switch (roleStr) {
            case 'student': return '/student/dashboard'
            case 'parent': return '/parent/dashboard'
            default: return '/'
          }
        }

        const targetPath = getDashboardPath(role)
        window.location.href = targetPath

        // Timeout safety net
        setTimeout(() => {
          setErrorMsg('Redirect failed. Please refresh or try again.')
          setLoading(false)
        }, 3000)
      }
    } catch (err) {
      const error = err as Error
      setErrorMsg(error.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E8F5EE] via-[#FAFAF7] to-[#FAFAF7] p-4 font-sans selection:bg-[#1B6B3A]/20 selection:text-[#1B6B3A]">
      <GeometricPattern opacity={0.07} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#1B6B3A]/10 bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
        
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" className="h-16 w-auto object-contain mb-4" />
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Virtual Zawiyah
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-650 bg-zinc-100 px-3 py-1 rounded-full">
            Student &amp; Guardian Portal
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 bg-transparent py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-zinc-400 outline-none transition-all duration-200 focus:border-[#1B6B3A] focus:ring-1 focus:ring-[#1B6B3A]/20"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 bg-transparent py-3 pl-10 pr-10 text-sm text-gray-900 placeholder-zinc-400 outline-none transition-all duration-200 focus:border-[#1B6B3A] focus:ring-1 focus:ring-[#1B6B3A]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-450 hover:text-zinc-650"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B6B3A] hover:bg-[#1B6B3A]/95 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          Not enrolled? <a href="/enrollment" className="font-bold text-[#1B6B3A] hover:underline">Request Enrollment</a>
        </div>
      </div>
    </div>
  )
}
