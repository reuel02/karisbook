'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const toast = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error('Credenciais inválidas. Verifique seu e-mail e senha.')
      setIsLoading(false)
    } else {
      toast.success('Login realizado com sucesso!')
      router.push('/admin')
      // router.push already triggers navigation, no need to turn off loading 
      // because the page will unmount, but let's keep it safe.
    }
  }

  return (
    <div className="min-h-screen bg-[#080D1A] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#3B82F6] flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Zap size={24} className="text-white" fill="currentColor" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-[#EEF2FF]">
          Acesso Administrativo
        </h2>
        <p className="mt-2 text-center text-sm text-[#94A3C8]">
          Gerencie sua agenda e serviços
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111830] py-8 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] sm:rounded-2xl sm:px-10 border border-[#3B82F6]/10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#EEF2FF]">
                E-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-xl bg-[#0C1226] border border-[#3B82F6]/20 px-4 py-3 placeholder-[#4B5E82] text-[#EEF2FF] focus:border-[#3B82F6] focus:outline-none focus:ring-[#3B82F6] sm:text-sm transition-colors disabled:opacity-50"
                  placeholder="admin@karistech.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#EEF2FF]">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-xl bg-[#0C1226] border border-[#3B82F6]/20 px-4 py-3 placeholder-[#4B5E82] text-[#EEF2FF] focus:border-[#3B82F6] focus:outline-none focus:ring-[#3B82F6] sm:text-sm transition-colors disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-xl bg-[#3B82F6] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(59,130,246,0.35)] hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#080D1A] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar no Painel'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 flex items-center justify-center">
            <button 
              onClick={() => router.push('/')}
              className="text-xs text-[#4B5E82] hover:text-[#EEF2FF] transition-colors"
            >
              Voltar para a página inicial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
