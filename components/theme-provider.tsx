'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Guard against unexpected import issues; fall back to rendering children.
  if (!NextThemesProvider) {
    return <>{children}</>
  }
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
