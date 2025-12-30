'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const router = useRouter()
  const [userName, setUserName] = useState('User')

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setUserName(userData.name || 'User')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <header className="fixed top-0 left-56 right-0 h-16 bg-blue-600 z-50 flex items-center px-6 shadow">
      <div className="flex items-center gap-4 w-full">
        <div className="flex-1">
          <div className="max-w-xl">
            <input
              placeholder="Search trucks, customers, transactions..."
              className="w-full px-3 py-2 rounded-lg bg-blue-500/30 placeholder-blue-100 text-white border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-blue-100 text-sm">{userName}</span>
          <button 
            onClick={handleLogout}
            className="text-blue-100 hover:text-white text-sm"
          >
            Logout
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
