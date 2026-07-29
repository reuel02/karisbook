'use client'

import { createContext, useContext } from 'react'

const TenantContext = createContext<string>('')

/**
 * Hook para obter o tenant_id do contexto atual.
 * Deve ser usado dentro de um <TenantProvider>.
 */
export function useTenantId(): string {
  return useContext(TenantContext)
}

/**
 * Provedor de tenant_id. Envolva a árvore de componentes que precisam
 * acessar o tenant_id com este componente.
 */
export function TenantProvider({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  return (
    <TenantContext.Provider value={id}>
      {children}
    </TenantContext.Provider>
  )
}
