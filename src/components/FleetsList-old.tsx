'use client'

import { useState, useEffect } from 'react'
import { fakeDataService, Truck } from '@/lib/fakeData'
import Modal from './Modal'

export default function FleetsList() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const [enabledSections, setEnabledSections] = useState({
    vehicleDetails: false,
    ownerInfo: false,
    financial: false,
    insurance: false
  })

  useEffect(() => {
    const loadData = async () => {
      const data = await fakeDataService.getTrucks()
      setTrucks(data)
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newTruck = await fakeDataService.addTruck({
      name: formData.name,
      plate: formData.plate,
      capacity: Number(formData.capacity),
      status: formData.status as 'available' | 'in-transit' | 'maintenance',
      // additional optional fields stored on object for now
      make: (formData as any).make,
      model: (formData as any).model,
      year: (formData as any).year,
      color: (formData as any).color,
      vin: (formData as any).vin,
      owner: (formData as any).owner,
      notes: (formData as any).notes,
    } as any)
    const data = await fakeDataService.getTrucks()
    setTrucks(data)
    setIsModalOpen(false)
    setFormData({ name: '', plate: '', capacity: '', status: 'available', make: '', model: '', year: '', color: '', vin: '', owner: '', ownerPhone: '', ownerEmail: '', purchasePrice: '', purchaseDate: '', insuranceProvider: '', insurancePolicy: '', insuranceExpiry: '', registrationExpiry: '', notes: '' })
    setEnabledSections({ vehicleDetails: false, ownerInfo: false, financial: false, insurance: false })
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-[#1e2a4a] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a5c] transition-colors">
            All Trucks
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Available
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            In Transit
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
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
              {trucks.map((truck) => (
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      truck.status === 'available' ? 'bg-green-100 text-green-700' :
                      truck.status === 'in-transit' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {truck.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(truck.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
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
      </div>

      {/* Add Truck Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Truck">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. Volvo FH16"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
              <input
                type="text"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. KSN-123A"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input type="text" value={(formData as any).make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input type="text" value={(formData as any).model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" value={(formData as any).year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kg)</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. 25000"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
              <input type="text" value={(formData as any).vin} onChange={(e) => setFormData({ ...formData, vin: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input type="text" value={(formData as any).color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input type="text" value={(formData as any).owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="available">Available</option>
                <option value="in-transit">In Transit</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={(formData as any).notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
