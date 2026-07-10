'use client'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [info, setInfo] = useState<any>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setInfo(data))
  }, [])
  return <pre className="p-4 font-mono text-xs">{JSON.stringify(info, null, 2)}</pre>
}
