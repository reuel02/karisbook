'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Zap } from 'lucide-react'
import { TenantProvider } from '@/lib/tenant-context'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [tenantId, setTenantId] = useState<string>('')

  useEffect(() => {
    const checkAuth = async () => {
      // ✅ getUser() valida o token com o servidor Supabase (seguro)
      // ❌ getSession() apenas lê do cache local (inseguro)
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (user && !userError && pathname !== '/admin/login') {
        // Busca o tenant associado ao usuário logado
        const { data, error } = await supabase
          .schema('karisbook')
          .from('user_tenants')
          .select('tenant_id')
          .eq('user_id', user.id)
          .single()

        if (data && !error) {
          setTenantId(data.tenant_id)
        } else if (error && error.code === 'PGRST116') {
          // Nenhum tenant encontrado — executa onboarding via RPC (Client-side)
          try {
            const { data: newTenantId, error: rpcError } = await supabase.rpc('create_new_tenant', {
              new_user_id: user.id
            })

            if (rpcError) throw rpcError
            if (!newTenantId) throw new Error('Falha ao gerar ID do tenant')

            setTenantId(newTenantId)
          } catch (onboardingError) {
            console.error('Erro ao realizar o onboarding do tenant:', onboardingError)
            alert('Não foi possível criar o seu espaço. Se você acabou de criar a conta, verifique se executou o script SQL no Supabase.')
            await supabase.auth.signOut()
            router.push('/admin/login')
            return
          }
        } else {
          console.error('Erro inesperado ao buscar tenant:', error)
        }
        setIsChecking(false)
      } else if (!user && pathname !== '/admin/login') {
        router.push('/admin/login')
      } else {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/20 flex items-center justify-center animate-pulse">
          <Zap size={24} className="text-[#3B82F6]" fill="currentColor" />
        </div>
        <p className="text-sm font-medium text-[#4B5E82] animate-pulse">Verificando acesso...</p>
      </div>
    )
  }

  // Página de login não precisa de TenantProvider
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <TenantProvider id={tenantId}>
      {children}
    </TenantProvider>
  )
}
