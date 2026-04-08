'use client'

import React from 'react'
import { Providers } from '@/lib/providers'
import { AuthProvider } from '@/app/context/AuthContext'
import { UserProvider } from '@/app/context/UserContext'

export default function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Providers>
        <UserProvider>{children}</UserProvider>
      </Providers>
    </AuthProvider>
  )
}
