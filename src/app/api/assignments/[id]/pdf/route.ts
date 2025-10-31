import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import SimplePDFService from '@/lib/simple-pdf-service'
import { calculateAutomatedPayment } from '@/lib/payment-calculator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Await params to get the id
    const { id } = await params

    // Fetch assignment with all related data
    const assignment = await db.assignment.findUnique({
      where: { id },
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

    const pdfService = new SimplePDFService()
    
    // Format assignment data with proper null checking
    const assignmentData = {
      id: assignment.id,
      client: {
        name: assignment.client?.name || 'Unknown Client',
        address: assignment.client?.address || '',
        contactPerson: assignment.client?.contactPerson || undefined,
        phone: assignment.client?.phone || ''
      },
      serviceType: {
        name: assignment.serviceType?.name || 'Unknown Service',
        description: assignment.serviceType?.description || ''
      },
      leadTechnician: {
        name: assignment.leadTechnician?.name || 'Unknown Technician',
        phone: assignment.leadTechnician?.phone || '',
        address: assignment.leadTechnician?.address || ''
      },
      assistants: assignment.assistants?.map(a => ({
        technician: {
          name: a.technician?.name || 'Unknown Assistant',
          phone: a.technician?.phone || ''
        }
      })) || [],
      equipment: assignment.equipment?.map(item => ({
        equipment: {
          name: item.equipment?.name || 'Unknown Equipment',
          unit: item.equipment?.unit || 'unit'
        },
        quantity: item.quantity || 0
      })) || [],
      startDate: assignment.startDate?.toISOString() || new Date().toISOString(),
      endDate: assignment.endDate?.toISOString() || new Date().toISOString(),
      status: assignment.status || 'UNKNOWN',
      notes: assignment.notes || '',
      totalCost: assignment.totalCost || 0
    }

    // Generate PDF based on type
    let pdfBuffer: Uint8Array
    let filename: string
    let costBreakdown: any

    switch (type) {
      case 'work-order':
        pdfBuffer = await pdfService.generateWorkOrderBuffer(assignmentData)
        filename = `surat-tugas-${assignment.id}.html`
        break
      case 'completion-report':
        pdfBuffer = await pdfService.generateCompletionReportBuffer(assignmentData)
        filename = `berita-acara-${assignment.id}.html`
        break
      case 'payment-receipt':
        // Calculate payment breakdown with lead technician bonus
        const assistantCount = assignment.assistants?.length || 0
        const paymentCalculation = calculateAutomatedPayment({
          serviceTypePrice: assignment.serviceType?.price || 0,
          leadTechnicianCount: 1,
          assistantCount: assistantCount
        })

        costBreakdown = {
          technicianFee: paymentCalculation.costBreakdown.technicianCost,
          leadTechnicianBaseFee: paymentCalculation.costBreakdown.leadTechnicianBaseFee,
          leadTechnicianBonus: paymentCalculation.costBreakdown.leadTechnicianBonusAmount,
          leadTechnicianBonusPercentage: paymentCalculation.leadTechnicianBonus,
          assistantTechnicianFee: paymentCalculation.costBreakdown.assistantTechnicianCost,
          transportCost: assignment.totalCost * 0.15, // Example calculation - can be updated
          accommodation: assignment.totalCost * 0.1, // Example calculation - can be updated
          incidentalEquipmentCost: assignment.totalCost * 0.05, // Example calculation - can be updated
          total: paymentCalculation.totalCost
        }
        pdfBuffer = await pdfService.generatePaymentReceiptBuffer(assignmentData, costBreakdown)
        filename = `tagihan-${assignment.id}.html`
        break
      default:
        throw new Error('Invalid PDF type')
    }

    // Create HTML document for better formatting
    let htmlContent = ''
    switch (type) {
      case 'work-order':
        htmlContent = pdfService.generateWorkOrderHTML(assignmentData)
        break
      case 'completion-report':
        htmlContent = pdfService.generateCompletionReportHTML(assignmentData)
        break
      case 'payment-receipt':
        // Reuse the same costBreakdown calculation from above
        // Payment breakdown with lead technician bonus is already calculated
        htmlContent = pdfService.generatePaymentReceiptHTML(assignmentData, costBreakdown)
        break
      default:
        // For non-payment-receipt types, create a dummy costBreakdown
        costBreakdown = {
          technicianFee: 0,
          leadTechnicianBaseFee: 0,
          leadTechnicianBonus: 0,
          leadTechnicianBonusPercentage: 0,
          assistantTechnicianFee: 0,
          transportCost: 0,
          accommodation: 0,
          incidentalEquipmentCost: 0,
          total: 0
        }
        break
    }

    // Always return HTML content for better compatibility
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(htmlContent, 'utf8').toString(),
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      assignmentId: id,
      type
    })
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
        assignmentId: id,
        type
      },
      { status: 500 }
    )
  }
}