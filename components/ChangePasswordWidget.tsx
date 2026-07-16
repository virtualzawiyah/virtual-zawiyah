'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Key, X, Lock, Check, Loader2, Eye, EyeOff } from 'lucide-react'

export default function ChangePasswordWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleClose = () => {
    setIsOpen(false)
    setNewPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setSuccessMsg('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (err: any) {
      console.error('Password change failed:', err)
      setErrorMsg(err.message || 'Failed to update password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Change Password FAB */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[999] p-3.5 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 shadow-lg text-zinc-650 hover:text-[#1B6B3A] active:scale-95 transition-all group"
        title="Change Password"
      >
        <Key className="w-5 h-5" />
        <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 whitespace-nowrap">
          Change Password
        </span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-xs select-none animate-fade-in">
          <div 
            className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm w-full p-6 space-y-4 relative mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-450 hover:bg-zinc-100 hover:text-zinc-700 transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-[#1B6B3A] border border-emerald-100">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Change Password</h3>
                <p className="text-[10px] text-zinc-400">Update your account credentials</p>
              </div>
            </div>

            {/* Success Status Banner */}
            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-50/70 p-3 text-xs text-emerald-800">
                <Check className="h-4 w-4 shrink-0 text-emerald-600 animate-pulse" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {/* Error Status Banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-50/70 p-3 text-xs text-red-800">
                <X className="h-4 w-4 shrink-0 text-red-650" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wider mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      disabled={isLoading || !!successMsg}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200 bg-white placeholder-zinc-300 text-zinc-800 focus:outline-hidden focus:border-[#1B6B3A] transition-all pr-10 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    disabled={isLoading || !!successMsg}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200 bg-white placeholder-zinc-300 text-zinc-800 focus:outline-hidden focus:border-[#1B6B3A] transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 py-2 px-3 border border-zinc-200 text-zinc-650 hover:bg-zinc-50 active:scale-98 font-bold rounded-xl text-xs transition-all select-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !!successMsg}
                  className="flex-1 py-2 px-3 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white font-bold rounded-xl text-xs transition-all active:scale-98 flex items-center justify-center gap-1.5 select-none"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
