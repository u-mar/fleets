'use client'

import { useState, useEffect } from 'react'
import { fakeDataService, HireOut, Truck } from '@/lib/fakeData'
import Modal from '@/components/Modal'

export default function HireOutPage() {
  const [hireOuts, setHireOuts] = useState<HireOut[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    truckId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerCompany: '',
    startDate: '',
    endDate: '',
    loadAmount: '',
    loadType: '',
    pickupLocation: '',
    deliveryLocation: '',
    totalEarnings: '',
    depositPaid: '',
    paymentMethod: '',
    driverName: '',
    notes: ''
  })

  const [enabledSections, setEnabledSections] = useState({
    customerDetails: false,
    loadInfo: false,
    payment: false,
    driverInfo: false
  })

  useEffect(() => {
    const loadData = async () => {
      const [hireOutsData, trucksData, customersData] = await Promise.all([
        fakeDataService.getHireOuts(),
        fakeDataService.getTrucks(),
        fakeDataService.getCustomers()
      ])
      setHireOuts(hireOutsData)
      setTrucks(trucksData)
      setCustomers(customersData)
    }
    loadData()
  }, [])

  const getTruckName = (truckId: string) => {
    const truck = trucks.find(t => t.id === truckId)
    return truck ? `${truck.name} (${truck.plate})` : 'Unknown'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newHireOut: HireOut = {
      id: String(hireOuts.length + 1),
      truckId: formData.truckId,
      customerName: formData.customerName,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      loadAmount: Number(formData.loadAmount),
      totalEarnings: Number(formData.totalEarnings)
    }
    await fakeDataService.addHireOut({ ...newHireOut })
    const updatedHireOuts = await fakeDataService.getHireOuts()
    setHireOuts(updatedHireOuts)
    setIsModalOpen(false)
    setFormData({ truckId: '', customerName: '', customerPhone: '', customerEmail: '', customerCompany: '', startDate: '', endDate: '', loadAmount: '', loadType: '', pickupLocation: '', deliveryLocation: '', totalEarnings: '', depositPaid: '', paymentMethod: '', driverName: '', notes: '' })
    setEnabledSections({ customerDetails: false, loadInfo: false, payment: false, driverInfo: false })
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
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Earnings</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hireOuts.map((hireOut) => (
                  <tr key={hireOut.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{getTruckName(hireOut.truckId)}</td>
                    <td className="py-4 px-6 text-gray-600">{hireOut.customerName}</td>
                    <td className="py-4 px-6 text-gray-600">{new Date(hireOut.startDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {hireOut.endDate ? new Date(hireOut.endDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{hireOut.loadAmount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right font-medium text-green-600">
                      KSh {hireOut.totalEarnings.toLocaleString()}
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

      {/* Add Modal - Zybra Style */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Hire Out">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Basic Booking Information */}
          <div className="border-b pb-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Booking Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Truck *</label>
                <select
                  value={formData.truckId}
                  onChange={(e) => setFormData({ ...formData, truckId: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select Truck</option>
                  {trucks.filter(t => t.status === 'available').map(truck => (
                    <option key={truck.id} value={truck.id}>{truck.name} ({truck.plate})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Customer *</label>
                <select
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Load Amount (kg) *</label>
                <input
                  type="number"
                  value={formData.loadAmount}
                  onChange={(e) => setFormData({ ...formData, loadAmount: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Total Earnings (KSh) *</label>
                <input
                  type="number"
                  value={formData.totalEarnings}
                  onChange={(e) => setFormData({ ...formData, totalEarnings: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Customer Details Section */}
          <div className="border-b pb-3">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enabledSections.customerDetails}
                onChange={(e) => setEnabledSections({ ...enabledSections, customerDetails: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">Customer Details</span>
            </label>
            {enabledSections.customerDetails && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.customerCompany}
                    onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Load Information Section */}
          <div className="border-b pb-3">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enabledSections.loadInfo}
                onChange={(e) => setEnabledSections({ ...enabledSections, loadInfo: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">Load Information</span>
            </label>
            {enabledSections.loadInfo && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Load Type</label>
                    <input
                      type="text"
                      value={formData.loadType}
                      onChange={(e) => setFormData({ ...formData, loadType: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Construction Materials"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pickup Location</label>
                    <input
                      type="text"
                      value={formData.pickupLocation}
                      onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Location</label>
                    <input
                      type="text"
                      value={formData.deliveryLocation}
                      onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Information Section */}
          <div className="border-b pb-3">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enabledSections.payment}
                onChange={(e) => setEnabledSections({ ...enabledSections, payment: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">Payment Information</span>
            </label>
            {enabledSections.payment && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Deposit Paid (KSh)</label>
                  <input
                    type="number"
                    value={formData.depositPaid}
                    onChange={(e) => setFormData({ ...formData, depositPaid: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Method</option>
                    <option value="cash">Cash</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Driver Information Section */}
          <div className="pb-3">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enabledSections.driverInfo}
                onChange={(e) => setEnabledSections({ ...enabledSections, driverInfo: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">Driver Information</span>
            </label>
            {enabledSections.driverInfo && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Driver Name</label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
