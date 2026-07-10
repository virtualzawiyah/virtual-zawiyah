'use client'

import { usePathname } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'
import GeometricPattern from '@/components/GeometricPattern'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isTeacherRoute = pathname?.startsWith('/teacher')
  const isRegistrarRoute = pathname?.startsWith('/registrar')
  const isSupervisorRoute = pathname?.startsWith('/supervisor')
  const isContentManagerRoute = pathname?.startsWith('/content-manager')
  const isFinanceRoute = pathname?.startsWith('/finance')
  const isHrRoute = pathname?.startsWith('/hr')
  const isDirectorRoute = pathname?.startsWith('/director')
  const isFounderRoute = pathname?.startsWith('/founder')
  const shouldBypassLayout = isTeacherRoute || isRegistrarRoute || isSupervisorRoute || isContentManagerRoute || isFinanceRoute || isHrRoute || isDirectorRoute || isFounderRoute

  if (shouldBypassLayout) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAF7] text-zinc-800 select-none relative">
        {/* Soft sage-green background pattern */}
        <GeometricPattern opacity={0.05} />

        {/* Primary Dashboard Content Area - border-to-border for teacher pages */}
        <main className="flex-1 h-full w-full relative z-10">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAF7] text-zinc-800 select-none relative">
      {/* Soft sage-green background pattern */}
      <GeometricPattern opacity={0.05} />

      {/* Dynamic Navigation Sidebar */}
      <DashboardSidebar />

      {/* Primary Dashboard Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}


