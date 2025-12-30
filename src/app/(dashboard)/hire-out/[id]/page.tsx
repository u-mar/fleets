'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTrucks, getHireOuts, getMaintenances } from '@/lib/actions'

interface HireOut {
  id: string
  truckId: string
  customerName: string
  destination?: string | null
  origin?: string | null
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
  truckId: string
  hireOutId?: string | null
  name?: string | null
  type: string
  details?: string | null
  cost: number
  date: Date
}

export default function HireOutDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const hireOutId = params.id as string

  const [hireOut, setHireOut] = useState<HireOut | null>(null)
  const [truck, setTruck] = useState<Truck | null>(null)
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [hireOutsData, trucksData, maintenancesData] = await Promise.all([
          getHireOuts(),
          getTrucks(),
          getMaintenances()
        ])
        
        const foundHireOut = hireOutsData.find(h => h.id === hireOutId)
        setHireOut(foundHireOut || null)
        
        if (foundHireOut) {
          const foundTruck = trucksData.find(t => t.id === foundHireOut.truckId)
          setTruck(foundTruck || null)
        }
        
        setMaintenances(maintenancesData.filter((m: any) => m.hireOutId === hireOutId))
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [hireOutId])

  const downloadReport = async () => {
    if (!hireOut || !truck) return
    
    const jsPDF = (await import('jspdf')).default
    const autoTable = (await import('jspdf-autotable')).default
    
    const totalCashIn = hireOut.totalEarnings
    const totalCashOut = maintenances.reduce((sum, m) => sum + m.cost, 0)
    const finalBalance = totalCashIn - totalCashOut
    const totalEntries = maintenances.length + 1
    
    const pdf = new jsPDF()
    
    // Header - Truck Name
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${truck.name}`, 14, 20)
    
    // Customer Name
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Customer: ${hireOut.customerName}`, 14, 28)
    
    // From - To
    pdf.setFontSize(10)
    const fromLocation = hireOut.origin || 'N/A'
    const toLocation = hireOut.destination || 'N/A'
    pdf.text(`From: ${fromLocation}  To: ${toLocation}`, 14, 35)
    
    // Duration
    pdf.text(`Duration: ${new Date(hireOut.startDate).toLocaleDateString()} - ${hireOut.endDate ? new Date(hireOut.endDate).toLocaleDateString() : 'Ongoing'}`, 14, 42)
    
    // Summary Table
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    autoTable(pdf, {
      startY: 48,
      head: [['Total Cash In', 'Total Cash Out', 'Final Balance']],
      body: [[
        `$${totalCashIn.toLocaleString()}`,
        `$${totalCashOut.toLocaleString()}`,
        `$${finalBalance.toLocaleString()}`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontSize: 10 },
      bodyStyles: { fontSize: 10, fontStyle: 'bold' },
      margin: { left: 14, right: 14 }
    })
    
    // Total entries
    const summaryTableHeight = (pdf as any).lastAutoTable.finalY
    pdf.setFontSize(9)
    pdf.text(`Total No. of entries: ${totalEntries}`, 14, summaryTableHeight + 8)
    
    // Transactions Table
    let runningBalance = totalCashIn
    const tableData: any[] = []
    
    // Initial payment entry
    tableData.push([
      new Date(hireOut.startDate).toLocaleDateString(),
      hireOut.customerName,
      'Cash',
      `$${totalCashIn.toLocaleString()}`,
      '',
      `$${runningBalance.toLocaleString()}`
    ])
    
    // Maintenance entries
    if (maintenances.length > 0) {
      const sortedMaintenances = [...maintenances].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      
      sortedMaintenances.forEach((m) => {
        runningBalance -= m.cost
        tableData.push([
          new Date(m.date).toLocaleDateString(),
          m.name || m.type || 'Maintenance',
          'Cash',
          '',
          `$${m.cost.toLocaleString()}`,
          `$${runningBalance.toLocaleString()}`
        ])
      })
    }
    
    // Final balance row
    tableData.push([
      new Date().toLocaleDateString(),
      'Final Balance',
      '',
      '',
      '',
      `$${finalBalance.toLocaleString()}`
    ])
    
    autoTable(pdf, {
      startY: summaryTableHeight + 12,
      head: [['Date', 'Remark', 'Mode', 'Cash In', 'Cash Out', 'Balance']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 55 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    })
    
    pdf.save(`${truck.name}-${hireOut.customerName}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!hireOut) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-gray-500 mb-4">Trip not found</div>
        <button
          onClick={() => router.push('/hire-out')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Hire Out
        </button>
      </div>
    )
  }

  const totalMaintenanceCost = maintenances.reduce((sum, m) => sum + m.cost, 0)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/hire-out')}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trip Details</h1>
            <p className="text-gray-500 mt-1">{truck?.name} ({truck?.plate}) - {hireOut.customerName}</p>
          </div>
        </div>
        <button
          onClick={downloadReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Report
        </button>
      </div>

      {/* Trip Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Information</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600">Destination</div>
            <div className="text-lg font-medium text-gray-900">{hireOut.destination || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Load Amount</div>
            <div className="text-lg font-medium text-gray-900">{hireOut.loadAmount.toLocaleString()} kg</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Duration</div>
            <div className="text-lg font-medium text-gray-900">
              {new Date(hireOut.startDate).toLocaleDateString()} - {' '}
              {hireOut.endDate ? new Date(hireOut.endDate).toLocaleDateString() : 
                <span className="text-blue-600">Ongoing</span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <div className="text-sm text-green-600 font-medium mb-2">Total Earnings</div>
          <div className="text-3xl font-bold text-green-900">
            ${hireOut.totalEarnings.toLocaleString()}
          </div>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
          <div className="text-sm text-orange-600 font-medium mb-2">Total Maintenance</div>
          <div className="text-3xl font-bold text-orange-900">
            ${totalMaintenanceCost.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-sm">
          <div className="text-sm text-blue-100 font-medium mb-2">Net Profit</div>
          <div className="text-3xl font-bold text-white">
            ${(hireOut.totalEarnings - totalMaintenanceCost).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Maintenance Records */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Records</h2>
        {maintenances.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No maintenance records for this trip
          </div>
        ) : (
          <div className="space-y-3">
            {maintenances.map((maintenance) => (
              <div key={maintenance.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <div className="font-medium text-gray-900">{maintenance.name || maintenance.type || 'Maintenance'}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(maintenance.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-lg font-semibold text-red-600">
                  -${maintenance.cost.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
