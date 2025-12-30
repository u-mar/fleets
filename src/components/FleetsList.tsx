'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTrucks, addTruck, updateTruckStatus } from '@/lib/actions'
import Modal from './Modal'

interface Truck {
  id: string
  name: string
  plate: string
  capacity: number
  status: string
  createdAt: Date
}

export default function FleetsList() {
  const router = useRouter()
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    plate: '',
    capacity: '',
    status: 'available',
    make: '',
    model: '',
    year: '',
    color: '',
    vin: '',
    owner: '',
    ownerPhone: '',
    ownerEmail: '',
    purchasePrice: '',
    purchaseDate: '',
    insuranceProvider: '',
    insurancePolicy: '',
    insuranceExpiry: '',
    registrationExpiry: '',
    notes: ''
  })

  const [currentStep, setCurrentStep] = useState(0)
  
  const steps = ['Basic Info', 'Vehicle Details', 'Owner Info', 'Purchase', 'Insurance']

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const data = await getTrucks()
      setTrucks(data)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await addTruck({
      name: formData.name,
      plate: formData.plate,
      capacity: Number(formData.capacity),
      status: formData.status,
      make: (formData as any).make,
      model: (formData as any).model,
      year: (formData as any).year,
      color: (formData as any).color,
      vin: (formData as any).vin,
      owner: (formData as any).owner,
      ownerPhone: (formData as any).ownerPhone,
      ownerEmail: (formData as any).ownerEmail,
      purchasePrice: (formData as any).purchasePrice,
      purchaseDate: (formData as any).purchaseDate,
      insuranceProvider: (formData as any).insuranceProvider,
      insurancePolicy: (formData as any).insurancePolicy,
      insuranceExpiry: (formData as any).insuranceExpiry,
      registrationExpiry: (formData as any).registrationExpiry,
      notes: (formData as any).notes,
    })
    const data = await getTrucks()
    setTrucks(data)
    setIsModalOpen(false)
    setCurrentStep(0)
    setIsSubmitting(false)
    setFormData({ name: '', plate: '', capacity: '', status: 'available', make: '', model: '', year: '', color: '', vin: '', owner: '', ownerPhone: '', ownerEmail: '', purchasePrice: '', purchaseDate: '', insuranceProvider: '', insurancePolicy: '', insuranceExpiry: '', registrationExpiry: '', notes: '' })
  }

  const handleViewTruck = (truckId: string) => {
    router.push(`/fleets/${truckId}`)
  }

  const handleStatusChange = async (truckId: string, newStatus: string) => {
    await updateTruckStatus(truckId, newStatus)
    const data = await getTrucks()
    setTrucks(data)
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all' 
                ? 'bg-[#1e2a4a] text-white hover:bg-[#2d3a5c]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Trucks
          </button>
          <button 
            onClick={() => setFilterStatus('available')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'available' 
                ? 'bg-[#1e2a4a] text-white hover:bg-[#2d3a5c]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Available
          </button>
          <button 
            onClick={() => setFilterStatus('in-transit')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'in-transit' 
                ? 'bg-[#1e2a4a] text-white hover:bg-[#2d3a5c]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            In Transit
          </button>
          <button 
            onClick={() => setFilterStatus('maintenance')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'maintenance' 
                ? 'bg-[#1e2a4a] text-white hover:bg-[#2d3a5c]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Maintenance
          </button>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Truck
        </button>
      </div>

      {/* Trucks Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-10 h-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading trucks...</p>
            </div>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Plate Number</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Capacity (kg)</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Date Added</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trucks
                .filter(truck => filterStatus === 'all' || truck.status === filterStatus)
                .map((truck) => (
                <tr key={truck.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h3m-3 4h3M3 5h18v10H3z" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">{truck.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{truck.plate}</td>
                  <td className="py-4 px-6 text-gray-600">{truck.capacity.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <select
                      value={truck.status}
                      onChange={(e) => handleStatusChange(truck.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-blue-400 ${
                        truck.status === 'available' ? 'bg-green-100 text-green-700' :
                        truck.status === 'in-transit' ? 'bg-blue-100 text-blue-700' :
                        truck.status === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <option value="available">Available</option>
                      <option value="in-transit">In Transit</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="retired">Retired</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(truck.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleViewTruck(truck.id)}
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
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Add Truck Modal - Multi-Step Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Truck">
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
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="e.g. Volvo FH16"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Plate Number</label>
                  <input
                    type="text"
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="e.g. KSN-123A"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Type</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3cpath%20d%3D%22M7%207l3%203%203-3%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[center_right_0.5rem] bg-no-repeat pr-10"
                  >
                    <option value="available">Service</option>
                    <option value="in-transit">In Transit</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Capacity (kg)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="e.g. 25000"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Vehicle Details */}
          {currentStep === 1 && (
            <div className="space-y-4 min-h-[300px]">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Make</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="e.g. Volvo"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="e.g. FH16"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="e.g. 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="e.g. White"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">VIN</label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Vehicle Identification Number"
                />
              </div>
            </div>
          )}

          {/* Step 2: Owner Information */}
          {currentStep === 2 && (
            <div className="space-y-4 min-h-[300px]">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Owner Name</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Owner name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="+254..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="owner@example.com"
                />
              </div>
            </div>
          )}

          {/* Step 3: Purchase Information */}
          {currentStep === 3 && (
            <div className="space-y-4 min-h-[300px]">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Purchase Price ($)</label>
                <input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Notes / Description</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  rows={4}
                  placeholder="Additional details..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Insurance Information */}
          {currentStep === 4 && (
            <div className="space-y-4 min-h-[300px]">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Insurance Provider</label>
                <input
                  type="text"
                  value={formData.insuranceProvider}
                  onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Insurance company name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Policy Number</label>
                <input
                  type="text"
                  value={formData.insurancePolicy}
                  onChange={(e) => setFormData({ ...formData, insurancePolicy: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Policy number"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                />
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
