import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import AuthCheck from '@/components/AuthCheck'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthCheck>
      <Header />
      <Sidebar />
      <div className="ml-56 pt-16">
        <main className="overflow-auto bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </AuthCheck>
  )
}
