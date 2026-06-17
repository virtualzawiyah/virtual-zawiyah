import { redirect } from 'next/navigation'

export default function TrialRequestPage() {
  redirect('/enrollment?tab=trial')
}
