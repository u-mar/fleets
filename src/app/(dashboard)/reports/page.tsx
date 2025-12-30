'use client'

import { useState, useEffect, useRef } from 'react'
import { getTrucks, getHireOuts, getMaintenances } from '@/lib/actions'

interface Truck {
  id: string
  name: string
  plate: string
  capacity: number
}

interface HireOut {
  id: string
  truckId: string
  customerName: string
  startDate: Date
  endDate?: Date | null
  loadAmount: number
  totalEarnings: number
}

interface Maintenance {
  id: string
  truckId: string
  type: string
  details?: string | null
  cost: number
  date: Date
}

export default function ReportsPage() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [hireOuts, setHireOuts] = useState<HireOut[]>([])
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [selectedTruck, setSelectedTruck] = useState<string>('all')
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      const [trucksData, hireOutsData, maintenancesData] = await Promise.all([
        getTrucks(),
        getHireOuts(),
        getMaintenances()
      ])
      setTrucks(trucksData)
      setHireOuts(hireOutsData)
      setMaintenances(maintenancesData)
    }
    loadData()
  }, [])

  const getTruckReport = (truckId: string) => {
    const truck = trucks.find(t => t.id === truckId)
    const truckHireOuts = hireOuts.filter(h => h.truckId === truckId)
    const truckMaintenances = maintenances.filter(m => m.truckId === truckId)
    
    const totalEarnings = truckHireOuts.reduce((sum, h) => sum + h.totalEarnings, 0)
    const totalMaintenanceCost = truckMaintenances.reduce((sum, m) => sum + m.cost, 0)
    const netProfit = totalEarnings - totalMaintenanceCost

    return {
      truck,
      hireOuts: truckHireOuts,
      maintenances: truckMaintenances,
      totalEarnings,
      totalMaintenanceCost,
      netProfit
    }
  }

  const getAllTrucksReport = () => {
    return trucks.map(truck => getTruckReport(truck.id))
  }

  const downloadPDF = async () => {
    if (!reportRef.current) return

    // Dynamic import for client-side only
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      logging: false
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`fleet-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const selectedReport = selectedTruck === 'all' ? null : getTruckReport(selectedTruck)
  const allReports = getAllTrucksReport()

  const grandTotalEarnings = allReports.reduce((sum, r) => sum + r.totalEarnings, 0)
  const grandTotalMaintenance = allReports.reduce((sum, r) => sum + r.totalMaintenanceCost, 0)
  const grandNetProfit = grandTotalEarnings - grandTotalMaintenance

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Reports</h1>
      
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Select Truck:</label>
            <select
              value={selectedTruck}
              onChange={(e) => setSelectedTruck(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Trucks</option>
              {trucks.map(truck => (
                <option key={truck.id} value={truck.id}>{truck.name} ({truck.plate})</option>
              ))}
            </select>
          </div>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>

        {/* Report Content */}
        <div ref={reportRef} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Fleet Management Report</h2>
            <p className="text-gray-500 mt-2">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          {selectedTruck === 'all' ? (
            /* All Trucks Summary */
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-700">${grandTotalEarnings.toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-orange-600">Total Maintenance</p>
                  <p className="text-2xl font-bold text-orange-700">${grandTotalMaintenance.toLocaleString()}</p>
                </div>
                <div className={`${grandNetProfit >= 0 ? 'bg-blue-50' : 'bg-red-50'} rounded-lg p-4 text-center`}>
                  <p className={`text-sm ${grandNetProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>Net Profit</p>
                  <p className={`text-2xl font-bold ${grandNetProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    ${grandNetProfit.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Individual Truck Reports */}
              {allReports.map((report) => (
                <div key={report.truck?.id} className="mb-8 pb-6 border-b border-gray-200 last:border-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {report.truck?.name} ({report.truck?.plate})
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Earnings</p>
                      <p className="text-lg font-bold text-green-600">${report.totalEarnings.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Maintenance</p>
                      <p className="text-lg font-bold text-orange-600">${report.totalMaintenanceCost.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Net Profit</p>
                      <p className={`text-lg font-bold ${report.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ${report.netProfit.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Maintenance Details */}
                  {report.maintenances.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Maintenance Breakdown:</h4>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-2 px-3 text-gray-500">Date</th>
                            <th className="text-left py-2 px-3 text-gray-500">Type</th>
                            <th className="text-left py-2 px-3 text-gray-500">Details</th>
                            <th className="text-right py-2 px-3 text-gray-500">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.maintenances.map(m => (
                            <tr key={m.id} className="border-t border-gray-100">
                              <td className="py-2 px-3 text-gray-600">{new Date(m.date).toLocaleDateString()}</td>
                              <td className="py-2 px-3 text-gray-600">{m.type}</td>
                              <td className="py-2 px-3 text-gray-600">{m.details || '-'}</td>
                              <td className="py-2 px-3 text-right text-orange-600">${m.cost.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            /* Single Truck Report */
            selectedReport && (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedReport.truck?.name} ({selectedReport.truck?.plate})
                  </h3>
                  <p className="text-gray-500">Capacity: {selectedReport.truck?.capacity.toLocaleString()} kg</p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-700">${selectedReport.totalEarnings.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-orange-600">Total Maintenance</p>
                    <p className="text-2xl font-bold text-orange-700">${selectedReport.totalMaintenanceCost.toLocaleString()}</p>
                  </div>
                  <div className={`${selectedReport.netProfit >= 0 ? 'bg-blue-50' : 'bg-red-50'} rounded-lg p-4 text-center`}>
                    <p className={`text-sm ${selectedReport.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>Net Profit</p>
                    <p className={`text-2xl font-bold ${selectedReport.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                      ${selectedReport.netProfit.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Hire Outs */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Hire Out History</h4>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm text-gray-500">Customer</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-500">Start Date</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-500">End Date</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-500">Load (kg)</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-500">Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.hireOuts.map(h => (
                        <tr key={h.id} className="border-t border-gray-100">
                          <td className="py-3 px-4 text-gray-600">{h.customerName}</td>
                          <td className="py-3 px-4 text-gray-600">{new Date(h.startDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-gray-600">{h.endDate ? new Date(h.endDate).toLocaleDateString() : '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{h.loadAmount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-green-600 font-medium">${h.totalEarnings.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Maintenance */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Maintenance History</h4>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm text-gray-500">Date</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-500">Type</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-500">Details</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-500">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.maintenances.map(m => (
                        <tr key={m.id} className="border-t border-gray-100">
                          <td className="py-3 px-4 text-gray-600">{new Date(m.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-gray-600">{m.type}</td>
                          <td className="py-3 px-4 text-gray-600">{m.details || '-'}</td>
                          <td className="py-3 px-4 text-right text-orange-600 font-medium">${m.cost.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  )
}
