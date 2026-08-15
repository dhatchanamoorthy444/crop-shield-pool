import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession()
      if (error) {
        toast.error('Authentication failed. Please try again.')
        void navigate({ to: '/auth' })
      } else {
        void navigate({ to: '/dashboard' })
      }
    }

    void handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#050706] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-white font-bold uppercase tracking-widest text-xs">Finalizing Identity Protocol...</p>
      </div>
    </div>
  )
}
