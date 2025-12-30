'use client'

import { useState, useEffect } from 'react'
import { getTrucks, getHireOuts, getMaintenances, getTransactions } from '@/lib/actions'

interface Truck {
  id: string
  name: string
  plate: string
  status: string
}

interface HireOut {
  id: string
  truckId: string
  totalEarnings: number
  endDate?: Date | null
}

interface Maintenance {
  id: string
  cost: number
}

interface Transaction {
  id: string
  type: string
  amount: number
}

export default function DashboardOverview() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [hireOuts, setHireOuts] = useState<HireOut[]>([])
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const loadData = async () => {
      const [trucksData, hireOutsData, maintenancesData, transactionsData] = await Promise.all([
        getTrucks(),
        getHireOuts(),
        getMaintenances(),
        getTransactions(),
      ])
      setTrucks(trucksData)
      setHireOuts(hireOutsData)
      setMaintenances(maintenancesData)
      setTransactions(transactionsData)
    }
    loadData()
  }, [])

  const totalTrucks = trucks.length
  const availableTrucks = trucks.filter(t => t.status === 'available').length
  const totalEarnings = hireOuts.reduce((sum, h) => sum + h.totalEarnings, 0)
  const totalMaintenanceCost = maintenances.reduce((sum, m) => sum + m.cost, 0)
  const netProfit = totalEarnings - totalMaintenanceCost

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  // Get trucks that are available (not currently hired out)
  const getAvailableTrucks = () => {
    const hiredTruckIds = hireOuts
      .filter(h => !h.endDate || new Date(h.endDate) > new Date())
      .map(h => h.truckId)
    
    return trucks.filter(t => !hiredTruckIds.includes(t.id))
  }

  const availableFleet = getAvailableTrucks()

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Trucks"
          value={totalTrucks.toString()}
          subtitle={`${availableFleet.length} available`}
          icon={<TruckIcon />}
          color="blue"
        />
        <StatCard
          title="Total Earnings"
          value={`$${totalEarnings.toLocaleString()}`}
          subtitle="From hire outs"
          icon={<MoneyIcon />}
          color="green"
        />
        <StatCard
          title="Maintenance Cost"
          value={`$${totalMaintenanceCost.toLocaleString()}`}
          subtitle="Total spent"
          icon={<WrenchIcon />}
          color="orange"
        />
        <StatCard
          title="Net Profit"
          value={`$${netProfit.toLocaleString()}`}
          subtitle="Earnings - Maintenance"
          icon={<ChartIcon />}
          color={netProfit >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Fleet Status */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Fleet</h3>
          {availableFleet.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              All trucks are currently hired out
            </div>
          ) : (
            <div className="space-y-3">
              {availableFleet.map(truck => (
                <div key={truck.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{truck.name}</p>
                    <p className="text-sm text-gray-500">{truck.plate}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Available
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Description</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map(transaction => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{transaction.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{transaction.description}</td>
                  <td className={`py-3 px-4 text-sm font-medium text-right ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, color }: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function TruckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h3m-3 4h3M3 5h18v10H3z" />
    </svg>
  )
}

function MoneyIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
