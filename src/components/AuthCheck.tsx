'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/login') {
      const user = localStorage.getItem('user')
      if (!user) {
        router.push('/login')
      }
    }
  }, [pathname, router])

  return <>{children}</>
}
