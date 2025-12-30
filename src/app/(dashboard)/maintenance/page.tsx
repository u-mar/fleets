'use client'

import { useState, useEffect } from 'react'
import { getTrucks, getHireOuts, getMaintenances, addMaintenance } from '@/lib/actions'
import Modal from '@/components/Modal'

interface Maintenance {
  id: string
  truckId: string
  hireOutId?: string | null
  name?: string | null
  cost: number
  date: Date
  type: string
  details: string | null
}

interface Truck {
  id: string
  name: string
  plate: string
}

interface HireOut {
  id: string
  truckId: string
  customerName: string
  startDate: Date
  endDate?: Date | null
}

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [hireOuts, setHireOuts] = useState<HireOut[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    truckId: '',
    hireOutId: '',
    name: '',
    cost: '',
    date: ''
  })

  const steps = ['Select Truck', 'Select Trip', 'Maintenance Details']

  useEffect(() => {
    const loadData = async () => {
      const [maintenancesData, trucksData, hireOutsData] = await Promise.all([
        getMaintenances(),
        getTrucks(),
        getHireOuts()
      ])
      setMaintenances(maintenancesData)
      setTrucks(trucksData)
      setHireOuts(hireOutsData)
    }
    loadData()
  }, [])

  const getTruckName = (truckId: string) => {
    const truck = trucks.find(t => t.id === truckId)
    return truck ? `${truck.name} (${truck.plate})` : 'Unknown'
  }

  const getHireOutDetails = (hireOutId?: string) => {
    if (!hireOutId) return 'General Maintenance'
    const hireOut = hireOuts.find(h => h.id === hireOutId)
    if (!hireOut) return 'Unknown Trip'
    return `${hireOut.customerName} - ${new Date(hireOut.startDate).toLocaleDateString()}`
  }

  const getTruckOngoingTrips = (truckId: string) => {
    return hireOuts.filter(h => 
      h.truckId === truckId && 
      (!h.endDate || new Date(h.endDate) > new Date())
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addMaintenance({
      truckId: formData.truckId,
      hireOutId: formData.hireOutId || null,
      name: formData.name,
      type: 'maintenance',
      cost: Number(formData.cost),
      date: formData.date,
      details: ''
    })
    const data = await getMaintenances()
    setMaintenances(data)
    setIsModalOpen(false)
    setCurrentStep(0)
    setFormData({ truckId: '', hireOutId: '', name: '', cost: '', date: '' })
  }

  const totalCost = maintenances.reduce((sum, m) => sum + m.cost, 0)

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Maintenance</h1>
      
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-2xl font-bold text-gray-900">{maintenances.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Cost</p>
            <p className="text-2xl font-bold text-orange-600">${totalCost.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Average Cost</p>
            <p className="text-2xl font-bold text-gray-900">
              ${maintenances.length ? Math.round(totalCost / maintenances.length).toLocaleString() : 0}
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Track maintenance costs for each truck</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Maintenance
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Truck</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Trip / Hire-Out</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Maintenance Name</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Cost</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {maintenances.map((maintenance) => (
                  <tr key={maintenance.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h3m-3 4h3M3 5h18v10H3z" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">{getTruckName(maintenance.truckId)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">{getHireOutDetails(maintenance.hireOutId || undefined)}</td>
                    <td className="py-4 px-6 text-gray-900">{maintenance.name || '-'}</td>
                    <td className="py-4 px-6 text-gray-600">{new Date(maintenance.date).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-right font-semibold text-orange-600">
                      ${maintenance.cost.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
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
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Maintenance">
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

          {/* Step 0: Select Truck */}
          {currentStep === 0 && (
            <div className="space-y-4 min-h-[300px]">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Select Truck</label>
                <select
                  value={formData.truckId}
                  onChange={(e) => setFormData({ ...formData, truckId: e.target.value, hireOutId: '' })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3cpath%20d%3D%22M7%207l3%203%203-3%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[center_right_0.5rem] bg-no-repeat pr-10"
                  required
                >
                  <option value="">Select Truck</option>
                  {trucks.map(truck => (
                    <option key={truck.id} value={truck.id}>{truck.name} ({truck.plate})</option>
                  ))}
                </select>
              </div>

              {formData.truckId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Selected Truck:</span> {getTruckName(formData.truckId)}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Click Next to select a trip or choose general maintenance
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Select Trip */}
          {currentStep === 1 && (
            <div className="space-y-4 min-h-[300px]">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Choose:</span> Link maintenance to an ongoing trip or select &quot;General Maintenance&quot;.
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Select Trip for {getTruckName(formData.truckId)}</label>
                <select
                  value={formData.hireOutId}
                  onChange={(e) => setFormData({ ...formData, hireOutId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3cpath%20d%3D%22M7%207l3%203%203-3%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[center_right_0.5rem] bg-no-repeat pr-10"
                >
                  <option value="">General Maintenance (Not linked to trip)</option>
                  {getTruckOngoingTrips(formData.truckId).map(hireOut => (
                    <option key={hireOut.id} value={hireOut.id}>
                      {hireOut.customerName} - Started: {new Date(hireOut.startDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {getTruckOngoingTrips(formData.truckId).length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    No ongoing trips for this truck. Maintenance will be recorded as General Maintenance.
                  </p>
                </div>
              )}

              {formData.hireOutId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Selected Trip:</span> {getHireOutDetails(formData.hireOutId)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Maintenance Details */}
          {currentStep === 2 && (
            <div className="space-y-4 min-h-[300px]">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Maintenance Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="e.g. Engine Oil Change, Tire Replacement, Fuel Refill"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Cost ($)</label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Truck:</span>
                    <span className="text-gray-900 font-medium">{getTruckName(formData.truckId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trip:</span>
                    <span className="text-gray-900 font-medium">{getHireOutDetails(formData.hireOutId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maintenance:</span>
                    <span className="text-gray-900 font-medium">{formData.name || '-'}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-300 pt-1 mt-2">
                    <span className="text-gray-600">Cost:</span>
                    <span className="text-orange-600 font-bold">
                      {formData.cost ? `$${Number(formData.cost).toLocaleString()}` : '$0'}
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
