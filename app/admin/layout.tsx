// app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  return <>{children}</>
}