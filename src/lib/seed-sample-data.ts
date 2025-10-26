import { db } from '@/lib/db'

export async function seedSampleData() {
  try {
    console.log('Creating sample data...')

    // Create sample technicians
    const technician1 = await db.technician.create({
      data: {
        name: 'Ahmad Wijaya',
        phone: '+62 812-3456-7890',
        address: 'Jl. Merdeka No. 123, Banjarnegara',
        type: 'FREELANCE',
        expertise: 'Network Installation, CCTV Setup, Server Maintenance'
      }
    })

    const technician2 = await db.technician.create({
      data: {
        name: 'Budi Santoso',
        phone: '+62 813-5678-9012',
        address: 'Jl. Sudirman No. 456, Banjarnegara',
        type: 'FREELANCE',
        expertise: 'CCTV Setup, Security Systems'
      }
    })

    const technician3 = await db.technician.create({
      data: {
        name: 'Siti Nurhaliza',
        phone: '+62 814-7890-1234',
        address: 'Jl. Gatotkaca No. 789, Banjarnegara',
        type: 'PERMANENT',
        expertise: 'Server Maintenance, Network Administration'
      }
    })

    // Create sample clients
    const client1 = await db.client.create({
      data: {
        name: 'PT. Maju Bersama',
        contactPerson: 'Bapak Ahmad',
        phone: '+62 286-123456',
        address: 'Jl. Industri No. 10, Banjarnegara'
      }
    })

    const client2 = await db.client.create({
      data: {
        name: 'CV. Teknologi Solusi',
        contactPerson: 'Ibu Siti',
        phone: '+62 286-789012',
        address: 'Jl. Pahlawan No. 25, Banjarnegara'
      }
    })

    // Create sample service types
    const service1 = await db.serviceType.create({
      data: {
        name: 'Instalasi Jaringan',
        category: 'Network',
        description: 'Instalasi jaringan LAN/WAN untuk kantor dan rumah'
      }
    })

    const service2 = await db.serviceType.create({
      data: {
        name: 'Setup CCTV',
        category: 'Security',
        description: 'Pemasangan dan konfigurasi sistem pengawasan CCTV'
      }
    })

    const service3 = await db.serviceType.create({
      data: {
        name: 'Maintenance Server',
        category: 'IT Support',
        description: 'Perawatan rutin dan troubleshooting server'
      }
    })

    // Create sample equipment
    const equipment1 = await db.serviceEquipment.create({
      data: {
        name: 'Router WiFi',
        unit: 'unit',
        stockQuantity: 15
      }
    })

    const equipment2 = await db.serviceEquipment.create({
      data: {
        name: 'CCTV Camera',
        unit: 'unit',
        stockQuantity: 25
      }
    })

    const equipment3 = await db.serviceEquipment.create({
      data: {
        name: 'Kabel UTP',
        unit: 'meter',
        stockQuantity: 100
      }
    })

    // Create sample assignment
    const assignment = await db.assignment.create({
      data: {
        clientId: client1.id,
        serviceTypeId: service1.id,
        leadTechnicianId: technician1.id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-18'),
        status: 'IN_PROGRESS',
        notes: 'Instalasi jaringan untuk kantor baru',
        totalCost: 2500000,
        manualCostOverride: false,
        assistants: {
          create: [
            { technicianId: technician2.id }
          ]
        },
        equipment: {
          create: [
            { equipmentId: equipment1.id, quantity: 2 },
            { equipmentId: equipment3.id, quantity: 50 }
          ]
        }
      }
    })

    console.log('Sample data created successfully!')
    console.log('Assignment ID for testing:', assignment.id)
    console.log('You can now test PDF generation with this assignment.')

  } catch (error) {
    console.error('Error creating sample data:', error)
  }
}

// Run if called directly
if (require.main === module) {
  seedSampleData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}