import DashboardSidebar from '@/components/DashboardSidebar'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-900 text-white select-none">
      {/* Dynamic Navigation Sidebar */}
      <DashboardSidebar />

      {/* Primary Dashboard Content Area */}
      <main className="flex-1 overflow-y-auto bg-black/10 p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
