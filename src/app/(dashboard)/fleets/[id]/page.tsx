'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTrucks, getHireOuts, getMaintenances } from '@/lib/actions'
import Modal from '@/components/Modal'

interface Truck {
  id: string
  name: string
  plate: string
  capacity: number
  status: string
  createdAt: Date
}

interface HireOut {
  id: string
  truckId: string
  customerName: string
  destination?: string | null
  startDate: Date
  endDate?: Date | null
  totalEarnings: number
}

interface Maintenance {
  id: string
  truckId: string
  hireOutId?: string | null
  name?: string | null
  type: string
  details?: string | null
  cost: number
  date: Date
}

export default function TruckDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const truckId = params.id as string

  const [truck, setTruck] = useState<Truck | null>(null)
  const [hireOuts, setHireOuts] = useState<HireOut[]>([])
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrip, setSelectedTrip] = useState<HireOut | null>(null)
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trucksData, hireOutsData, maintenancesData] = await Promise.all([
          getTrucks(),
          getHireOuts(),
          getMaintenances()
        ])
        
        const foundTruck = trucksData.find(t => t.id === truckId)
        setTruck(foundTruck || null)
        setHireOuts(hireOutsData)
        setMaintenances(maintenancesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [truckId])

  const getTruckTrips = () => {
    if (!truck) return []
    return hireOuts.filter(h => h.truckId === truck.id)
  }

  const getTruckRevenue = () => {
    return getTruckTrips().reduce((sum, trip) => sum + trip.totalEarnings, 0)
  }

  const getTruckMaintenance = () => {
    if (!truck) return 0
    return maintenances
      .filter(m => m.truckId === truck.id)
      .reduce((sum, m) => sum + m.cost, 0)
  }

  const getTripMaintenance = (tripId: string) => {
    return maintenances.filter(m => m.hireOutId === tripId)
  }

  const handleViewMaintenance = (trip: HireOut) => {
    setSelectedTrip(trip)
    setIsMaintenanceModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!truck) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-gray-500 mb-4">Truck not found</div>
        <button
          onClick={() => router.push('/fleets')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Fleets
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/fleets')}
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{truck.name}</h1>
          <p className="text-gray-500 mt-1">License Plate: {truck.plate}</p>
        </div>
      </div>

      {/* Statistics Cards - Compact */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="text-xs text-blue-600 font-medium mb-1">Total Trips</div>
          <div className="text-2xl font-bold text-blue-900">{getTruckTrips().length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="text-xs text-green-600 font-medium mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-green-900">
            ${getTruckRevenue().toLocaleString()}
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <div className="text-xs text-orange-600 font-medium mb-1">Total Maintenance</div>
          <div className="text-2xl font-bold text-orange-900">
            ${getTruckMaintenance().toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg shadow-sm">
          <div className="text-xs text-blue-100 font-medium mb-1">Net Profit</div>
          <div className="text-2xl font-bold text-white">
            ${(getTruckRevenue() - getTruckMaintenance()).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Trip History Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip History</h2>
        {getTruckTrips().length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No trips recorded for this truck
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Customer Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">From - To</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Maintenance Cost</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Profit</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getTruckTrips().map((trip) => {
                  const tripMaintenances = getTripMaintenance(trip.id)
                  const tripMaintenanceCost = tripMaintenances.reduce((sum, m) => sum + m.cost, 0)
                  const profit = trip.totalEarnings - tripMaintenanceCost
                  
                  return (
                    <tr key={trip.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{trip.customerName}</div>
                        <div className="text-xs text-gray-500">{trip.destination || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(trip.startDate).toLocaleDateString()} - {' '}
                        {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 
                          <span className="text-blue-600 font-medium">Ongoing</span>
                        }
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-green-600">
                          ${trip.totalEarnings.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-red-600">
                          ${tripMaintenanceCost.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`text-sm font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          ${profit.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleViewMaintenance(trip)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View ({tripMaintenances.length})
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Maintenance Modal */}
      {selectedTrip && (
        <Modal 
          isOpen={isMaintenanceModalOpen} 
          onClose={() => setIsMaintenanceModalOpen(false)} 
          title={`Maintenance Records - ${selectedTrip.customerName}`}
        >
          <div className="space-y-4">
            {/* Trip Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Destination:</span>
                  <span className="ml-2 font-medium text-gray-900">{selectedTrip.destination || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Period:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(selectedTrip.startDate).toLocaleDateString()} - {' '}
                    {selectedTrip.endDate ? new Date(selectedTrip.endDate).toLocaleDateString() : 'Ongoing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Maintenance List */}
            {getTripMaintenance(selectedTrip.id).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No maintenance records for this trip
              </div>
            ) : (
              <div className="space-y-3">
                {getTripMaintenance(selectedTrip.id).map((maintenance) => (
                  <div key={maintenance.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{maintenance.name || maintenance.type || 'Maintenance'}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(maintenance.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          ${maintenance.cost.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Maintenance Cost</span>
                    <span className="text-xl font-bold text-red-600">
                      ${getTripMaintenance(selectedTrip.id).reduce((sum, m) => sum + m.cost, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="px-5 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
