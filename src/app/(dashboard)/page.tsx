import DashboardOverview from '@/components/DashboardOverview'

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <DashboardOverview />
    </div>
  )
}
