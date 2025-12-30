'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTrucks, getHireOuts, getMaintenances, addHireOut, updateHireOut } from '@/lib/actions'
import Modal from '@/components/Modal'

interface HireOut {
  id: string
  truckId: string
  customerName: string
  destination?: string | null
  startDate: Date
  endDate?: Date | null
  loadAmount: number
  totalEarnings: number
}

interface Truck {
  id: string
  name: string
  plate: string
}

interface Maintenance {
  id: string
  hireOutId?: string | null
  cost: number
}

export default function HireOutPage() {
  const router = useRouter()
  const [hireOuts, setHireOuts] = useState<HireOut[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    truckId: '',
    customerName: '',
    customerCompany: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    customerIdNumber: '',
    startDate: '',
    endDate: '',
    loadAmount: '',
    totalEarnings: '',
    origin: '',
    destination: '',
    distance: '',
    driverName: '',
    driverPhone: '',
    notes: ''
  })

  const steps = ['Basic Info', 'Customer Details', 'Route Details', 'Driver', 'Payment']

  useEffect(() => {
    const loadData = async () => {
      const [hireOutsData, trucksData, maintenancesData] = await Promise.all([
        getHireOuts(),
        getTrucks(),
        getMaintenances()
      ])
      setHireOuts(hireOutsData)
      setTrucks(trucksData)
      setMaintenances(maintenancesData)
    }
    loadData()
  }, [])

  useEffect(() => {
    const loadCustomers = async () => {
      // Customer support can be added later
      setCustomers([])
    }
    loadCustomers()
  }, [])

  const getTruckName = (truckId: string) => {
    const truck = trucks.find(t => t.id === truckId)
    return truck ? `${truck.name} (${truck.plate})` : 'Unknown'
  }

  const getMaintenanceCost = (hireOutId: string) => {
    const tripMaintenances = maintenances.filter(m => m.hireOutId === hireOutId)
    return tripMaintenances.reduce((sum, m) => sum + m.cost, 0)
  }

  const handleEndTrip = async (hireOutId: string) => {
    await updateHireOut(hireOutId, { endDate: new Date() })
    const data = await getHireOuts()
    setHireOuts(data)
  }

  const handleViewDetails = (hireOutId: string) => {
    router.push(`/hire-out/${hireOutId}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addHireOut({
      truckId: formData.truckId,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      customerCompany: formData.customerCompany,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      destination: formData.destination,
      origin: formData.origin,
      loadAmount: Number(formData.loadAmount),
      loadType: '',
      driverName: formData.driverName,
      driverPhone: formData.driverPhone,
      driverLicense: '',
      advancePayment: 0,
      balancePayment: 0,
      paymentMethod: '',
      totalEarnings: Number(formData.totalEarnings)
    })
    const data = await getHireOuts()
    setHireOuts(data)
    setIsModalOpen(false)
    setCurrentStep(0)
    setFormData({ truckId: '', customerName: '', customerCompany: '', customerPhone: '', customerEmail: '', customerAddress: '', customerIdNumber: '', startDate: '', endDate: '', loadAmount: '', totalEarnings: '', origin: '', destination: '', distance: '', driverName: '', driverPhone: '', notes: '' })
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Hire Out</h1>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Manage truck hire outs and customer bookings</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Hire Out
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Truck</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Start Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">End Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Load (kg)</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Maintenance</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Earnings</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hireOuts.map((hireOut) => {
                  const maintenanceCost = getMaintenanceCost(hireOut.id)
                  const isOngoing = !hireOut.endDate || new Date(hireOut.endDate) > new Date()
                  return (
                    <tr key={hireOut.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h3m-3 4h3M3 5h18v10H3z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-900">{getTruckName(hireOut.truckId)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{hireOut.customerName}</td>
                      <td className="py-4 px-6 text-gray-600">{new Date(hireOut.startDate).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        {hireOut.endDate ? (
                          <span className="text-gray-600">{new Date(hireOut.endDate).toLocaleDateString()}</span>
                        ) : (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Ongoing</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-600">{hireOut.loadAmount.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right font-semibold text-orange-600">
                        ${maintenanceCost.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-green-600">
                        ${hireOut.totalEarnings.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          {isOngoing && (
                            <button 
                              onClick={() => handleEndTrip(hireOut.id)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              End Trip
                            </button>
                          )}
                          <button 
                            onClick={() => handleViewDetails(hireOut.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Hire Out">
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
          {/* Horizontal Step Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {steps.map((step, index) => (
              <button
                key={step}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  currentStep === index
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {step}
              </button>
            ))}
          </div>

          {/* Step 0: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-4 min-h-[300px]">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Truck</label>
                <select
                  value={formData.truckId}
                  onChange={(e) => setFormData({ ...formData, truckId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3cpath%20d%3D%22M7%207l3%203%203-3%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[center_right_0.5rem] bg-no-repeat pr-10"
                  required
                >
                  <option value="">Select Truck</option>
                  {trucks.map(truck => (
                    <option key={truck.id} value={truck.id}>{truck.name} ({truck.plate})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Customer Details */}
          {currentStep === 1 && (
            <div className="space-y-4 min-h-[300px]">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Customer Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="Enter customer name"
                    required
                  />
                  <select 
                    value="" 
                    onChange={(e) => {
                      const selectedCustomer = customers.find(c => c.id === e.target.value)
                      if (selectedCustomer) {
                        setFormData({ 
                          ...formData, 
                          customerName: selectedCustomer.name,
                          customerCompany: selectedCustomer.company || '',
                          customerPhone: selectedCustomer.phone || '',
                          customerEmail: selectedCustomer.email || ''
                        })
                      }
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3cpath%20d%3D%22M7%207l3%203%203-3%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[center_right_0.75rem] bg-no-repeat pr-8 pl-3"
                  >
                    <option value="">Load Existing</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Company</label>
                <input
                  type="text"
                  value={formData.customerCompany}
                  onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Company name (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="+254..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Address</label>
                <input
                  type="text"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Physical address"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">ID Number</label>
                <input
                  type="text"
                  value={formData.customerIdNumber}
                  onChange={(e) => setFormData({ ...formData, customerIdNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="National ID or Tax Number"
                />
              </div>
            </div>
          )}

          {/* Step 2: Route Details */}
          {currentStep === 2 && (
            <div className="space-y-4 min-h-[300px]">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Origin</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Starting location"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Delivery location"
                />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Distance (km)</label>
                  <input
                    type="number"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Load Amount (kg)</label>
                  <input
                    type="number"
                    value={formData.loadAmount}
                    onChange={(e) => setFormData({ ...formData, loadAmount: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  rows={3}
                  placeholder="Cargo details, special instructions..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Driver */}
          {currentStep === 3 && (
            <div className="space-y-4 min-h-[300px]">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Driver Name</label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Assigned driver"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Driver Phone</label>
                <input
                  type="tel"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="+254..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <div className="space-y-4 min-h-[300px]">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Total Earnings ($)</label>
                <input
                  type="number"
                  value={formData.totalEarnings}
                  onChange={(e) => setFormData({ ...formData, totalEarnings: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="0"
                  required
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Truck:</span>
                    <span className="text-gray-900 font-medium">
                      {formData.truckId ? trucks.find(t => t.id === formData.truckId)?.name : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="text-gray-900 font-medium">{formData.customerName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Load:</span>
                    <span className="text-gray-900 font-medium">{formData.loadAmount ? `${formData.loadAmount} kg` : '-'}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-300 pt-1 mt-2">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-blue-600 font-bold">
                      {formData.totalEarnings ? `$${Number(formData.totalEarnings).toLocaleString()}` : '$0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`px-5 py-2 text-sm rounded transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  className="px-5 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
