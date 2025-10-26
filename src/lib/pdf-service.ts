import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface AssignmentData {
  id: string
  client: { name: string; address: string; contactPerson?: string; phone: string }
  serviceType: { name: string; description?: string }
  leadTechnician: { name: string; phone: string; address: string }
  assistants: Array<{ technician: { name: string; phone: string } }>
  equipment: Array<{ equipment: { name: string; unit: string }; quantity: number }>
  startDate: string
  endDate: string
  status: string
  notes?: string
  totalCost: number
}

export interface CostBreakdown {
  technicianFee: number
  transportCost: number
  accommodation: number
  incidentalEquipmentCost: number
  total: number
}

class PDFService {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number = 20

  constructor() {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
  }

  private addHeader(title: string) {
    // Company Header
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('CLASNET GROUP', this.pageWidth / 2, 30, { align: 'center' })
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Jl. Serulingmas No. 32, Banjarnegara, Indonesia', this.pageWidth / 2, 38, { align: 'center' })
    this.doc.text('Phone: +62 286 123456', this.pageWidth / 2, 44, { align: 'center' })
    
    // Document Title
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.pageWidth / 2, 60, { align: 'center' })
    
    // Line separator
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, 70, this.pageWidth - this.margin, 70)
  }

  private addSection(title: string, yPosition: number): number {
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, yPosition)
    return yPosition + 10
  }

  private addText(label: string, value: string, yPosition: number): number {
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(`${label}:`, this.margin, yPosition)
    
    this.doc.setFont('helvetica', 'normal')
    const lines = this.doc.splitTextToSize(value, this.pageWidth - (this.margin * 2) - 30)
    this.doc.text(lines, this.margin + 30, yPosition)
    
    return yPosition + (lines.length * 5) + 5
  }

  private addTable(headers: string[], data: string[][], yPosition: number): number {
    const tableWidth = this.pageWidth - (this.margin * 2)
    const columnWidth = tableWidth / headers.length
    
    // Table headers
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(10)
    headers.forEach((header, index) => {
      this.doc.text(header, this.margin + (index * columnWidth), yPosition)
    })
    
    // Line under headers
    this.doc.line(this.margin, yPosition + 3, this.pageWidth - this.margin, yPosition + 3)
    
    // Table data
    this.doc.setFont('helvetica', 'normal')
    let currentY = yPosition + 10
    data.forEach((row) => {
      row.forEach((cell, index) => {
        this.doc.text(cell, this.margin + (index * columnWidth), currentY)
      })
      currentY += 7
    })
    
    return currentY + 5
  }

  private addSignatureSection(yPosition: number, title: string): number {
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, yPosition)
    
    // Signature lines
    const signatureY = yPosition + 30
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('_________________________', this.margin, signatureY)
    this.doc.text('Signature', this.margin, signatureY + 5)
    
    this.doc.text('_________________________', this.pageWidth - this.margin - 60, signatureY)
    this.doc.text('Date', this.pageWidth - this.margin - 60, signatureY + 5)
    
    return signatureY + 20
  }

  async generateWorkOrder(assignment: AssignmentData): Promise<void> {
    this.addHeader('SURAT PERINTAH KERJA (WORK ORDER)')
    
    let yPosition = 80
    
    // Assignment Details
    yPosition = this.addSection('Assignment Details', yPosition)
    yPosition = this.addText('Work Order ID', assignment.id, yPosition)
    yPosition = this.addText('Client Name', assignment.client.name, yPosition)
    yPosition = this.addText('Service Type', assignment.serviceType.name, yPosition)
    yPosition = this.addText('Start Date', new Date(assignment.startDate).toLocaleDateString('id-ID'), yPosition)
    yPosition = this.addText('End Date', new Date(assignment.endDate).toLocaleDateString('id-ID'), yPosition)
    yPosition = this.addText('Status', assignment.status.replace('_', ' '), yPosition)
    
    // Client Information
    yPosition += 10
    yPosition = this.addSection('Client Information', yPosition)
    yPosition = this.addText('Company', assignment.client.name, yPosition)
    yPosition = this.addText('Contact Person', assignment.client.contactPerson || '-', yPosition)
    yPosition = this.addText('Phone', assignment.client.phone, yPosition)
    yPosition = this.addText('Address', assignment.client.address, yPosition)
    
    // Technician Information
    yPosition += 10
    yPosition = this.addSection('Technician Information', yPosition)
    yPosition = this.addText('Lead Technician (PIC)', assignment.leadTechnician.name, yPosition)
    yPosition = this.addText('Phone', assignment.leadTechnician.phone, yPosition)
    
    if (assignment.assistants.length > 0) {
      yPosition = this.addText('Assistant Technicians', assignment.assistants.map(a => a.technician.name).join(', '), yPosition)
    }
    
    // Equipment List
    if (assignment.equipment.length > 0) {
      yPosition += 10
      yPosition = this.addSection('Equipment Required', yPosition)
      
      const headers = ['Equipment Name', 'Quantity', 'Unit']
      const data = assignment.equipment.map(item => [
        item.equipment.name,
        item.quantity.toString(),
        item.equipment.unit
      ])
      yPosition = this.addTable(headers, data, yPosition)
    }
    
    // Notes
    if (assignment.notes) {
      yPosition += 10
      yPosition = this.addSection('Notes', yPosition)
      yPosition = this.addText('', assignment.notes, yPosition)
    }
    
    // Signatures
    yPosition += 20
    yPosition = this.addSignatureSection(yPosition, 'Signatures')
    
    // Save the PDF
    this.doc.save(`work-order-${assignment.id}.pdf`)
  }

  async generateCompletionReport(assignment: AssignmentData): Promise<void> {
    this.addHeader('BERITA ACARA SERAH TERIMA (COMPLETION REPORT)')
    
    let yPosition = 80
    
    // Assignment Details
    yPosition = this.addSection('Assignment Details', yPosition)
    yPosition = this.addText('Report ID', assignment.id, yPosition)
    yPosition = this.addText('Client Name', assignment.client.name, yPosition)
    yPosition = this.addText('Service Type', assignment.serviceType.name, yPosition)
    yPosition = this.addText('Work Period', `${new Date(assignment.startDate).toLocaleDateString('id-ID')} - ${new Date(assignment.endDate).toLocaleDateString('id-ID')}`, yPosition)
    
    // Work Summary
    yPosition += 10
    yPosition = this.addSection('Work Summary', yPosition)
    yPosition = this.addText('Service Description', assignment.serviceType.description || 'Service completed as per agreement', yPosition)
    yPosition = this.addText('Final Condition', 'All work has been completed successfully and tested', yPosition)
    
    // Equipment Used
    if (assignment.equipment.length > 0) {
      yPosition += 10
      yPosition = this.addSection('Equipment Used', yPosition)
      
      const headers = ['Equipment Name', 'Quantity Used', 'Unit']
      const data = assignment.equipment.map(item => [
        item.equipment.name,
        item.quantity.toString(),
        item.equipment.unit
      ])
      yPosition = this.addTable(headers, data, yPosition)
    }
    
    // Notes
    if (assignment.notes) {
      yPosition += 10
      yPosition = this.addSection('Additional Notes', yPosition)
      yPosition = this.addText('', assignment.notes, yPosition)
    }
    
    // Signatures
    yPosition += 20
    yPosition = this.addSignatureSection(yPosition, 'Client Signature')
    yPosition = this.addSignatureSection(yPosition + 40, 'Technician Signature')
    
    // Save the PDF
    this.doc.save(`completion-report-${assignment.id}.pdf`)
  }

  async generatePaymentReceipt(assignment: AssignmentData, costBreakdown: CostBreakdown): Promise<void> {
    this.addHeader('KWITANSI PEMBAYARAN (PAYMENT RECEIPT)')
    
    let yPosition = 80
    
    // Receipt Details
    yPosition = this.addSection('Receipt Details', yPosition)
    yPosition = this.addText('Receipt ID', assignment.id, yPosition)
    yPosition = this.addText('Assignment ID', assignment.id, yPosition)
    yPosition = this.addText('Payment Date', new Date().toLocaleDateString('id-ID'), yPosition)
    
    // Technician Information
    yPosition += 10
    yPosition = this.addSection('Paid To', yPosition)
    yPosition = this.addText('Technician Name', assignment.leadTechnician.name, yPosition)
    yPosition = this.addText('Phone', assignment.leadTechnician.phone, yPosition)
    yPosition = this.addText('Address', assignment.leadTechnician.address, yPosition)
    
    // Cost Breakdown
    yPosition += 10
    yPosition = this.addSection('Payment Breakdown', yPosition)
    
    const headers = ['Description', 'Amount (IDR)']
    const data = [
      ['Technician Fee', `Rp ${costBreakdown.technicianFee.toLocaleString('id-ID')}`],
      ['Transport Cost', `Rp ${costBreakdown.transportCost.toLocaleString('id-ID')}`],
      ['Accommodation', `Rp ${costBreakdown.accommodation.toLocaleString('id-ID')}`],
      ['Incidental Equipment Cost', `Rp ${costBreakdown.incidentalEquipmentCost.toLocaleString('id-ID')}`],
      ['TOTAL', `Rp ${costBreakdown.total.toLocaleString('id-ID')}`]
    ]
    yPosition = this.addTable(headers, data, yPosition)
    
    // Payment Confirmation
    yPosition += 10
    yPosition = this.addSection('Payment Confirmation', yPosition)
    yPosition = this.addText('Payment Status', 'PAID', yPosition)
    yPosition = this.addText('Payment Method', 'Bank Transfer', yPosition)
    
    // Notes
    if (assignment.notes) {
      yPosition += 10
      yPosition = this.addSection('Notes', yPosition)
      yPosition = this.addText('', assignment.notes, yPosition)
    }
    
    // Signatures
    yPosition += 20
    yPosition = this.addSignatureSection(yPosition, 'Paid By (Company Representative)')
    yPosition = this.addSignatureSection(yPosition + 40, 'Received By (Technician)')
    
    // Save the PDF
    this.doc.save(`payment-receipt-${assignment.id}.pdf`)
  }

  async generateFromHTML(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`)
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = this.pageWidth - (this.margin * 2)
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    this.doc.addImage(imgData, 'PNG', this.margin, this.margin, imgWidth, imgHeight)
    this.doc.save(filename)
  }
}

export default PDFService