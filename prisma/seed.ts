import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fleet.com' },
    update: {},
    create: {
      email: 'admin@fleet.com',
      password: 'fleet123', // In production, this should be hashed
      name: 'Admin User',
      role: 'admin'
    }
  })

  console.log('✅ Created admin user:', { email: admin.email, password: 'fleet123' })

  // Create default regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@fleet.com' },
    update: {},
    create: {
      email: 'user@fleet.com',
      password: 'user123', // In production, this should be hashed
      name: 'Regular User',
      role: 'user'
    }
  })

  console.log('✅ Created regular user:', { email: user.email, password: 'user123' })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
