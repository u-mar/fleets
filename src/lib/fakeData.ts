// Fake data service for development (before MongoDB is connected)
// Replace this with real database calls once DB is ready

export interface Truck {
  id: string;
  name: string;
  plate: string;
  capacity: number;
  status: 'available' | 'in-transit' | 'maintenance';
  createdAt: Date;
}

export interface HireOut {
  id: string;
  truckId: string;
  customerName: string;
  startDate: Date;
  endDate?: Date;
  loadAmount: number;
  totalEarnings: number;
}

export interface Maintenance {
  id: string;
  truckId: string;
  hireOutId?: string;
  name: string;
  type: string;
  cost: number;
  date: Date;
  details?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
}

// Storage and initial fake data
const STORAGE_KEY = 'fleets_app_v1'

const initialState = {
  trucks: <Truck[]>[
    {
      id: '1',
      name: 'Volvo FH16',
      plate: 'KSN-123A',
      capacity: 25000,
      status: 'available',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Scania R450',
      plate: 'KSN-456B',
      capacity: 20000,
      status: 'in-transit',
      createdAt: new Date('2024-02-20'),
    },
    {
      id: '3',
      name: 'MAN TGX',
      plate: 'KSN-789C',
      capacity: 18000,
      status: 'maintenance',
      createdAt: new Date('2024-03-10'),
    },
  ],
  hireOuts: <HireOut[]>[
    {
      id: '1',
      truckId: '1',
      customerName: 'ABC Logistics',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-05'),
      loadAmount: 15000,
      totalEarnings: 5000,
    },
    {
      id: '2',
      truckId: '2',
      customerName: 'XYZ Transport',
      startDate: new Date('2024-12-10'),
      endDate: new Date('2024-12-15'),
      loadAmount: 18000,
      totalEarnings: 6500,
    },
  ],
  maintenances: <Maintenance[]>[
    {
      id: '1',
      truckId: '1',
      type: 'fuel',
      cost: 500,
      date: new Date('2024-12-05'),
      details: 'Diesel refill 200L',
    },
    {
      id: '2',
      truckId: '1',
      type: 'repair',
      cost: 2500,
      date: new Date('2024-12-03'),
      details: 'Engine maintenance and oil change',
    },
    {
      id: '3',
      truckId: '2',
      type: 'fuel',
      cost: 450,
      date: new Date('2024-12-12'),
      details: 'Diesel refill 180L',
    },
    {
      id: '4',
      truckId: '3',
      type: 'repair',
      cost: 8000,
      date: new Date('2024-12-15'),
      details: 'Gearbox repair',
    },
  ],
  transactions: <Transaction[]>[
    {
      id: '1',
      type: 'income',
      amount: 5000,
      description: 'Payment from ABC Logistics',
      date: new Date('2024-12-05'),
    },
    {
      id: '2',
      type: 'expense',
      amount: 500,
      description: 'Fuel for Truck 1',
      date: new Date('2024-12-05'),
    },
    {
      id: '3',
      type: 'income',
      amount: 6500,
      description: 'Payment from XYZ Transport',
      date: new Date('2024-12-15'),
    },
    {
      id: '4',
      type: 'expense',
      amount: 2500,
      description: 'Engine maintenance - Truck 1',
      date: new Date('2024-12-03'),
    },
    {
      id: '5',
      type: 'expense',
      amount: 3000,
      description: 'Driver salary',
      date: new Date('2024-12-01'),
    },
    {
      id: '6',
      type: 'income',
      amount: 10000,
      description: 'Loan from bank',
      date: new Date('2024-11-20'),
    },
  ],
  customers: <Customer[]>[
    { id: 'c1', name: 'ABC Logistics', phone: '+254700000001', email: 'abc@logistics.com', company: 'ABC' },
    { id: 'c2', name: 'XYZ Transport', phone: '+254700000002', email: 'xyz@transport.com', company: 'XYZ' },
  ],
}

let state = loadState()

function saveState() {
  try {
    const toSave = JSON.stringify({
      ...state,
      trucks: state.trucks.map(t => ({ ...t, createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt })),
      hireOuts: state.hireOuts.map(h => ({ ...h, startDate: h.startDate instanceof Date ? h.startDate.toISOString() : h.startDate, endDate: h.endDate instanceof Date ? h.endDate.toISOString() : h.endDate })),
    })
    localStorage.setItem(STORAGE_KEY, toSave)
  } catch (err) {
    // ignore
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(initialState)
    const parsed = JSON.parse(raw)
    // restore Dates
    parsed.trucks = (parsed.trucks || []).map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) }))
    parsed.hireOuts = (parsed.hireOuts || []).map((h: any) => ({ ...h, startDate: new Date(h.startDate), endDate: h.endDate ? new Date(h.endDate) : undefined }))
    return parsed
  } catch (err) {
    return structuredClone(initialState)
  }
}

// Fake service with simple persistence (localStorage)
export const fakeDataService = {
  // Truck operations
  getTrucks: async (): Promise<Truck[]> => structuredClone(state.trucks || []),
  getTruckById: async (id: string): Promise<Truck | undefined> => (state.trucks || []).find((t) => t.id === id),
  addTruck: async (truck: Omit<Truck, 'id' | 'createdAt'> & Partial<Pick<Truck, 'createdAt'>>) => {
    const id = String((state.trucks?.length || 0) + 1)
    const newTruck: Truck = { id, createdAt: truck.createdAt ? new Date(truck.createdAt) : new Date(), ...(truck as any) }
    state.trucks = [...(state.trucks || []), newTruck]
    saveState()
    return newTruck
  },

  // HireOut operations
  getHireOuts: async (): Promise<HireOut[]> => structuredClone(state.hireOuts || []),
  addHireOut: async (h: Omit<HireOut, 'id'>) => {
    const id = String((state.hireOuts?.length || 0) + 1)
    const newH: HireOut = { id, ...h }
    state.hireOuts = [...(state.hireOuts || []), newH]
    saveState()
    return newH
  },

  // Maintenance operations
  getMaintenances: async (): Promise<Maintenance[]> => structuredClone(state.maintenances || []),

  // Transaction operations
  getTransactions: async (): Promise<Transaction[]> => structuredClone(state.transactions || []),
  getIncomeTransactions: async (): Promise<Transaction[]> => (state.transactions || []).filter((t) => t.type === 'income'),
  getExpenseTransactions: async (): Promise<Transaction[]> => (state.transactions || []).filter((t) => t.type === 'expense'),

  // Customers
  getCustomers: async (): Promise<Customer[]> => structuredClone(state.customers || []),
  addCustomer: async (c: Omit<Customer, 'id'>) => {
    const id = `c${(state.customers?.length || 0) + 1}`
    const newC: Customer = { id, ...c }
    state.customers = [...(state.customers || []), newC]
    saveState()
    return newC
  }
}
