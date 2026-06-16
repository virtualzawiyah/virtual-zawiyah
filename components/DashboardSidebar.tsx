'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Wallet, 
  Settings, 
  Users, 
  Calendar, 
  CreditCard, 
  LogOut, 
  Loader2, 
  Compass, 
  User,
  ShieldAlert,
  Upload
} from 'lucide-react'

interface UserProfile {
  full_name: string
  role: string
  email: string
  avatar_url?: string
}

export default function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role, email, avatar_url')
          .eq('id', session.user.id)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (err) {
        console.error('Error fetching sidebar profile:', err)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex h-full w-64 flex-col items-center justify-center border-r border-white/10 bg-slate-950 p-6 text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    )
  }

  const role = profile?.role || 'student'

  // Define navigation items per role
  const menuItems: Record<string, Array<{ name: string; path: string; icon: React.ComponentType<{ className?: string }> }>> = {
    admin: [
      { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Unlock Overrides', path: '/admin/attendance-unlock', icon: ShieldAlert },
      { name: 'Fee Verification', path: '/admin/fee-verification', icon: CreditCard },
      { name: 'Withdrawals', path: '/admin/withdrawals', icon: Wallet },
      { name: 'Assignments', path: '/admin/assignments', icon: Users },
      { name: 'Calendar', path: '/admin/calendar', icon: Calendar },
      { name: 'Student Import', path: '/admin/excel-import', icon: Upload }
    ],
    teacher: [
      { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
      { name: 'Work Slots', path: '/teacher/work-slots', icon: Calendar },
      { name: 'Attendance & Logs', path: '/teacher/attendance', icon: CheckSquare },
      { name: 'My Wallet', path: '/teacher/wallet', icon: Wallet },
      { name: 'Settings', path: '/teacher/settings', icon: Settings }
    ],
    student: [
      { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'My Schedule', path: '/student/schedule', icon: Calendar },
      { name: 'Fee Payment', path: '/student/fee-payment', icon: CreditCard }
    ],
    parent: [
      { name: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
      { name: 'Payments History', path: '/parent/payments', icon: CreditCard }
    ]
  }

  const items = menuItems[role] || []

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-slate-950/80 text-white backdrop-blur-xl">
      {/* Brand Logo Header */}
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
          <Compass className="h-6 w-6" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Virtual Zawiyah
          </span>
          <span className="block text-[10px] uppercase tracking-wider text-emerald-400 font-semibold leading-none mt-0.5">
            {role.replace('_', ' ')} Portal
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {items.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-emerald-300 border-l-2 border-emerald-500 shadow-md shadow-emerald-500/5'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-white'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User profile bottom bar */}
      <div className="border-t border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 shadow">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {profile?.full_name || 'Loading user...'}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {profile?.email || ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 active:scale-[0.98] transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
