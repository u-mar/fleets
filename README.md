# Fleet Management System

A professional fleet management system built with Next.js, Tailwind CSS, and Prisma (MongoDB ready).

## Features

- **Dashboard** - Overview of all fleet statistics, transactions, and truck status
- **Fleets** - Manage your trucks (add, edit, view status)
- **Hire Out** - Track truck hire outs to customers with earnings
- **Maintenance** - Log maintenance costs (fuel, repairs, inspections, etc.)
- **Transactions** - Track income and expenses from all sources
- **Reports** - Generate and download PDF reports per truck showing earnings minus maintenance

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── fleets/page.tsx       # Fleets management
│   ├── hire-out/page.tsx     # Hire out tracking
│   ├── maintenance/page.tsx  # Maintenance costs
│   ├── transactions/page.tsx # Income/Expense tracking
│   └── reports/page.tsx      # Reports with PDF export
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── Modal.tsx             # Reusable modal component
│   ├── DashboardOverview.tsx # Dashboard statistics
│   └── FleetsList.tsx        # Trucks table with CRUD
└── lib/
    └── fakeData.ts           # Mock data service
```

## Database Setup (MongoDB + Prisma)

When ready to connect to MongoDB:

1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` with your MongoDB connection string
3. Run Prisma commands:
```bash
npx prisma generate
npx prisma db push
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM + MongoDB (ready)
- **PDF Export**: jsPDF + html2canvas
- **Icons**: Custom SVG icons

## Design

The UI follows a clean, professional design similar to Zybra accounting software with:
- Dark navy sidebar navigation
- Clean white content areas
- Professional forms with proper validation
- Responsive tables with action buttons
- Modal dialogs for data entry
