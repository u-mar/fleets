'use server'

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'
import { unstable_cache } from 'next/cache'

// User Actions
export async function loginUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, name: true, role: true }
    })

    if (!user || user.password !== password) {
      return { success: false, error: 'Invalid email or password' }
    }

    return { 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'An error occurred' }
  }
}

// Cached truck fetching for better performance
const getCachedTrucks = unstable_cache(
  async () => {
    return prisma.truck.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        hireOuts: {
          where: {
            OR: [
              { endDate: null },
              { endDate: { gt: new Date() } }
            ]
          },
          select: { id: true }
        }
      }
    })
  },
  ['trucks'],
  { revalidate: 30 } // Cache for 30 seconds
)

// Truck Actions
export async function getTrucks() {
  const trucks = await getCachedTrucks()

  // Map trucks and calculate actual status based on active hire outs
  return trucks.map(truck => ({
    ...truck,
    status: truck.hireOuts.length > 0 ? 'in-transit' : 'available'
  }))
}

export async function addTruck(data: any) {
  const truck = await prisma.truck.create({
    data: {
      name: data.name,
      plate: data.plate,
      capacity: data.capacity,
      status: data.status,
      make: data.make,
      model: data.model,
      year: data.year,
      color: data.color,
      vin: data.vin,
      owner: data.owner,
      ownerPhone: data.ownerPhone,
      ownerEmail: data.ownerEmail,
      purchasePrice: data.purchasePrice,
      purchaseDate: data.purchaseDate,
      insuranceProvider: data.insuranceProvider,
      insurancePolicy: data.insurancePolicy,
      insuranceExpiry: data.insuranceExpiry,
      registrationExpiry: data.registrationExpiry,
      notes: data.notes
    }
  })
  revalidatePath('/fleets')
  return truck
}

export async function updateTruckStatus(id: string, status: string) {
  const truck = await prisma.truck.update({
    where: { id },
    data: { status }
  })
  revalidatePath('/fleets')
  revalidatePath('/')
  return truck
}

// Cached hire-outs fetching
const getCachedHireOuts = unstable_cache(
  async () => {
    return prisma.hireOut.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        truckId: true,
        customerName: true,
        customerPhone: true,
        startDate: true,
        endDate: true,
        destination: true,
        origin: true,
        loadAmount: true,
        totalEarnings: true,
        createdAt: true
      }
    })
  },
  ['hire-outs'],
  { revalidate: 30 }
)

// HireOut Actions
export async function getHireOuts() {
  return await getCachedHireOuts()
}

export async function addHireOut(data: any) {
  const hireOut = await prisma.hireOut.create({
    data: {
      truckId: data.truckId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      customerCompany: data.customerCompany,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      destination: data.destination,
      origin: data.origin,
      loadAmount: data.loadAmount,
      loadType: data.loadType,
      driverName: data.driverName,
      driverPhone: data.driverPhone,
      driverLicense: data.driverLicense,
      advancePayment: data.advancePayment,
      balancePayment: data.balancePayment,
      paymentMethod: data.paymentMethod,
      totalEarnings: data.totalEarnings
    }
  })
  revalidatePath('/hire-out')
  return hireOut
}

export async function updateHireOut(id: string, data: any) {
  const hireOut = await prisma.hireOut.update({
    where: { id },
    data: {
      endDate: data.endDate ? new Date(data.endDate) : null
    }
  })
  revalidatePath('/hire-out')
  return hireOut
}

// Cached maintenances fetching
const getCachedMaintenances = unstable_cache(
  async () => {
    return prisma.maintenance.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        truckId: true,
        hireOutId: true,
        name: true,
        type: true,
        cost: true,
        date: true,
        details: true,
        createdAt: true
      }
    })
  },
  ['maintenances'],
  { revalidate: 30 }
)

// Maintenance Actions
export async function getMaintenances() {
  return await getCachedMaintenances()
}

export async function addMaintenance(data: any) {
  const maintenance = await prisma.maintenance.create({
    data: {
      truckId: data.truckId,
      hireOutId: data.hireOutId,
      name: data.name,
      type: data.type,
      cost: data.cost,
      date: data.date ? new Date(data.date) : new Date(),
      details: data.details
    }
  })
  revalidatePath('/maintenance')
  return maintenance
}

// Cached transactions fetching
const getCachedTransactions = unstable_cache(
  async () => {
    return prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        category: true,
        date: true,
        createdAt: true
      }
    })
  },
  ['transactions'],
  { revalidate: 30 }
)

// Transaction Actions
export async function getTransactions() {
  return await getCachedTransactions()
}

export async function addTransaction(data: any) {
  const transaction = await prisma.transaction.create({
    data: {
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: new Date()
    }
  })
  revalidatePath('/transactions')
  return transaction
}
