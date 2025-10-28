import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get technician counts
    const totalTechnicians = await db.technician.count()
    const freelanceTechnicians = await db.technician.count({
      where: { type: 'FREELANCE' }
    })

    // Get assignment counts
    const activeAssignments = await db.assignment.count({
      where: { status: 'IN_PROGRESS' }
    })
    const pendingAssignments = await db.assignment.count({
      where: { status: 'PENDING' }
    })
    const completedAssignments = await db.assignment.count({
      where: { status: 'COMPLETED' }
    })

    // Get client count
    const totalClients = await db.client.count()

    // Get upcoming jobs (assignments with start date in the future)
    const upcomingJobs = await db.assignment.count({
      where: {
        startDate: {
          gte: new Date()
        },
        status: {
          in: ['PENDING', 'IN_PROGRESS']
        }
      }
    })

    const stats = {
      totalTechnicians,
      freelanceTechnicians,
      activeAssignments,
      pendingAssignments,
      completedAssignments,
      totalClients,
      upcomingJobs
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}