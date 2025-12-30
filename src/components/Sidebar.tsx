'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: 'Dashboard', href: '/', icon: DashboardIcon },
  { name: 'Fleets', href: '/fleets', icon: TruckIcon },
  { name: 'Hire Out', href: '/hire-out', icon: HireIcon },
  { name: 'Maintenance', href: '/maintenance', icon: MaintenanceIcon },
  { name: 'Transactions', href: '/transactions', icon: TransactionIcon },
  { name: 'Reports', href: '/reports', icon: ReportIcon },
]

function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h3m-3 4h3M3 5h18v10H3z" />
      <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth={2} fill="none" />
      <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth={2} fill="none" />
    </svg>
  )
}

function HireIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function MaintenanceIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function TransactionIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ReportIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed top-0 left-0 w-56 h-screen bg-[#1e2a4a] flex flex-col z-40">
      {/* Logo - Blue background to match header */}
      <div className="h-16 bg-blue-600 flex items-center px-4 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-800 rounded flex items-center justify-center text-white font-bold">F</div>
          <span className="text-white text-lg font-semibold">FLEETS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-[#2d3a5c] text-white border-l-4 border-blue-500'
                  : 'text-gray-300 hover:bg-[#2d3a5c] hover:text-white'
              }`}
            >
              <item.icon />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[#2d3a5c]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm">
            U
          </div>
          <div>
            <p className="text-white text-sm">Admin User</p>
            <p className="text-gray-400 text-xs">admin@fleets.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
