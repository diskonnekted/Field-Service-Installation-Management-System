import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.admin.findFirst({
      where: { email: 'admin@clasnet.com' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await db.admin.create({
      data: {
        email: 'admin@clasnet.com',
        password: hashedPassword,
        name: 'System Administrator'
      }
    })

    console.log('Admin user created successfully:', admin.email)
  } catch (error) {
    console.error('Error seeding admin:', error)
  }
}

// Run if called directly
if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}