import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import PDFService from '@/lib/pdf-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'work-order', 'completion-report', 'payment-receipt'

    if (!type || !['work-order', 'completion-report', 'payment-receipt'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid PDF type. Must be work-order, completion-report, or payment-receipt' },
        { status: 400 }
      )
    }

    // Fetch assignment with all related data
    const assignment = await db.assignment.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        serviceType: true,
        leadTechnician: true,
        assistants: {
          include: {
            technician: true
          }
        },
        equipment: {
          include: {
            equipment: true
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    const pdfService = new PDFService()
    
    // Format assignment data
    const assignmentData = {
      id: assignment.id,
      client: assignment.client,
      serviceType: assignment.serviceType,
      leadTechnician: assignment.leadTechnician,
      assistants: assignment.assistants,
      equipment: assignment.equipment,
      startDate: assignment.startDate.toISOString(),
      endDate: assignment.endDate.toISOString(),
      status: assignment.status,
      notes: assignment.notes,
      totalCost: assignment.totalCost
    }

    // Generate PDF based on type
    let pdfBuffer: Uint8Array
    let filename: string

    switch (type) {
      case 'work-order':
        pdfBuffer = await pdfService.generateWorkOrderBuffer(assignmentData)
        filename = `surat-tugas-${assignment.id}.pdf`
        break
      case 'completion-report':
        pdfBuffer = await pdfService.generateCompletionReportBuffer(assignmentData)
        filename = `berita-acara-${assignment.id}.pdf`
        break
      case 'payment-receipt':
        // For payment receipt, we need cost breakdown
        const costBreakdown = {
          technicianFee: assignment.totalCost * 0.7, // Example calculation
          transportCost: assignment.totalCost * 0.15,
          accommodation: assignment.totalCost * 0.1,
          incidentalEquipmentCost: assignment.totalCost * 0.05,
          total: assignment.totalCost
        }
        pdfBuffer = await pdfService.generatePaymentReceiptBuffer(assignmentData, costBreakdown)
        filename = `tagihan-${assignment.id}.pdf`
        break
      default:
        throw new Error('Invalid PDF type')
    }

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}