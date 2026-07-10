'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Calendar, 
  CreditCard, 
  LogOut, 
  Loader2, 
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
    document.cookie = 'vz_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex h-full w-64 flex-col items-center justify-center border-r border-zinc-200 bg-white p-6 text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin text-[#1B6B3A]" />
      </div>
    )
  }

  let role = profile?.role
  if (!role) {
    if (pathname?.startsWith('/teacher')) {
      role = 'teacher'
    } else if (pathname?.startsWith('/admin')) {
      role = 'admin'
    } else if (pathname?.startsWith('/parent')) {
      role = 'parent'
    } else {
      role = 'student'
    }
  }

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
      { name: 'My Wallet', path: '/teacher/wallet', icon: Wallet }
    ],
    student: [
      { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'My Schedule', path: '/student/schedule', icon: Calendar },
      { name: 'Fees', path: '/student/fees', icon: CreditCard }
    ],
    parent: [
      { name: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
      { name: 'Payments History', path: '/parent/payments', icon: CreditCard }
    ]
  }

  const items = menuItems[role] || []

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-200 bg-white text-zinc-800 z-20">
      {/* Brand Logo Header */}
      <div className="flex h-20 items-center gap-3 border-b border-zinc-100 px-6">
        <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" className="h-10 w-auto object-contain" />
        <div>
          <span className="text-lg font-bold font-serif tracking-tight text-zinc-900">
            Virtual Zawiyah
          </span>
          <span className="block text-[10px] uppercase tracking-wider text-[#1B6B3A] font-bold leading-none mt-0.5">
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
                  ? 'bg-[#1B6B3A]/5 text-[#1B6B3A] border-l-4 border-[#1B6B3A] font-semibold'
                  : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#1B6B3A]' : 'text-zinc-500 group-hover:text-zinc-700'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User profile bottom bar */}
      <div className="border-t border-zinc-200 bg-zinc-50/50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-sm">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              <User className="h-5 w-5 text-zinc-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-800 font-sans">
              {profile?.full_name || 'Ahmed Bilal'}
            </p>
            <p className="truncate text-xs text-zinc-600">
              {profile?.email || 'ahmed.bilal@gmail.com'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2.5 text-xs font-semibold text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-[0.98] transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
