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
    this.doc.text('Telepon: +62 286 123456', this.pageWidth / 2, 44, { align: 'center' })
    
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
    this.doc.text('Tanda Tangan', this.margin, signatureY + 5)
    
    this.doc.text('_________________________', this.pageWidth - this.margin - 60, signatureY)
    this.doc.text('Tanggal', this.pageWidth - this.margin - 60, signatureY + 5)
    
    return signatureY + 20
  }

  private formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  private getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return 'Menunggu'
      case 'IN_PROGRESS': return 'Dalam Proses'
      case 'COMPLETED': return 'Selesai'
      case 'CANCELLED': return 'Dibatalkan'
      default: return status
    }
  }

  async generateWorkOrder(assignment: AssignmentData): Promise<void> {
    this.addHeader('SURAT PERINTAH KERJA (SPK)')
    
    let yPosition = 80
    
    // Assignment Details
    yPosition = this.addSection('Detail Penugasan', yPosition)
    yPosition = this.addText('Nomor SPK', assignment.id, yPosition)
    yPosition = this.addText('Nama Klien', assignment.client.name, yPosition)
    yPosition = this.addText('Jenis Layanan', assignment.serviceType.name, yPosition)
    yPosition = this.addText('Tanggal Mulai', this.formatDate(assignment.startDate), yPosition)
    yPosition = this.addText('Tanggal Selesai', this.formatDate(assignment.endDate), yPosition)
    yPosition = this.addText('Status', this.getStatusText(assignment.status), yPosition)
    
    // Client Information
    yPosition += 10
    yPosition = this.addSection('Informasi Klien', yPosition)
    yPosition = this.addText('Perusahaan', assignment.client.name, yPosition)
    yPosition = this.addText('Kontak Person', assignment.client.contactPerson || '-', yPosition)
    yPosition = this.addText('Telepon', assignment.client.phone, yPosition)
    yPosition = this.addText('Alamat', assignment.client.address, yPosition)
    
    // Technician Information
    yPosition += 10
    yPosition = this.addSection('Informasi Teknisi', yPosition)
    yPosition = this.addText('Teknisi Utama (PIC)', assignment.leadTechnician.name, yPosition)
    yPosition = this.addText('Telepon', assignment.leadTechnician.phone, yPosition)
    
    if (assignment.assistants.length > 0) {
      yPosition = this.addText('Teknisi Asisten', assignment.assistants.map(a => a.technician.name).join(', '), yPosition)
    }
    
    // Equipment List
    if (assignment.equipment.length > 0) {
      yPosition += 10
      yPosition = this.addSection('Peralatan yang Diperlukan', yPosition)
      
      const headers = ['Nama Peralatan', 'Jumlah', 'Satuan']
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
      yPosition = this.addSection('Catatan', yPosition)
      yPosition = this.addText('', assignment.notes, yPosition)
    }
    
    // Signatures
    yPosition += 20
    yPosition = this.addSignatureSection(yPosition, 'Tanda Tangan')
    
    // Save the PDF
    this.doc.save(`surat-tugas-${assignment.id}.pdf`)
  }

  async generateWorkOrderBuffer(assignment: AssignmentData): Promise<Uint8Array> {
    this.addHeader('SURAT PERINTAH KERJA (SPK)')
    
    let yPosition = 80
    
    // Assignment Details
    yPosition = this.addSection('Detail Penugasan', yPosition)
    yPosition = this.addText('Nomor SPK', assignment.id, yPosition)
    yPosition = this.addText('Nama Klien', assignment.client.name, yPosition)
    yPosition = this.addText('Jenis Layanan', assignment.serviceType.name, yPosition)
    yPosition = this.addText('Tanggal Mulai', this.formatDate(assignment.startDate), yPosition)
    yPosition = this.addText('Tanggal Selesai', this.formatDate(assignment.endDate), yPosition)
    yPosition = this.addText('Status', this.getStatusText(assignment.status), yPosition)
    
    // Client Information
    yPosition += 10
    yPosition = this.addSection('Informasi Klien', yPosition)
    yPosition = this.addText('Perusahaan', assignment.client.name, yPosition)
    yPosition = this.addText('Kontak Person', assignment.client.contactPerson || '-', yPosition)
    yPosition = this.addText('Telepon', assignment.client.phone, yPosition)
    yPosition = this.addText('Alamat', assignment.client.address, yPosition)
    
    // Technician Information
    yPosition += 10
    yPosition = this.addSection('Informasi Teknisi', yPosition)
    yPosition = this.addText('Teknisi Utama (PIC)', assignment.leadTechnician.name, yPosition)
    yPosition = this.addText('Telepon', assignment.leadTechnician.phone, yPosition)
    
    if (assignment.assistants.length > 0) {
      yPosition = this.addText('Teknisi Asisten', assignment.assistants.map(a => a.technician.name).join(', '), yPosition)
    }
    
    // Equipment List
    if (assignment.equipment.length > 0) {
      yPosition += 10
      yPosition = this.addSection('Peralatan yang Diperlukan', yPosition)
      
      const headers = ['Nama Peralatan', 'Jumlah', 'Satuan']
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
      yPosition = this.addSection('Catatan', yPosition)
      yPosition = this.addText('', assignment.notes, yPosition)
    }
    
    // Signatures
    yPosition += 20
    yPosition = this.addSignatureSection(yPosition, 'Tanda Tangan')
    
    // Return PDF as buffer
    return this.doc.output('arraybuffer')
  }

  async generateCompletionReport(assignment: AssignmentData): Promise<void> {
    this.addHeader('BERITA ACARA SERAH TERIMA PEKERJAAN')
    
    let yPosition = 80
    
    // Assignment Details
    yPosition = this.addSection('Detail Penugasan', yPosition)
    yPosition = this.addText('Nomor Laporan', assignment.id, yPosition)
    yPosition = this.addText('Nama Klien', assignment.client.name, yPosition)
    yPosition = this.addText('Jenis Layanan', assignment.serviceType.name, yPosition)
    yPosition = this.addText('Periode Pekerjaan', `${this.formatDate(assignment.startDate)} - ${this.formatDate(assignment.endDate)}`, yPosition)
    
    // Work Summary
    yPosition += 10
    yPosition = this.addSection('Ringkasan Pekerjaan', yPosition)
    yPosition = this.addText('Deskripsi Layanan', assignment.serviceType.description || 'Pekerjaan telah selesai sesuai kesepakatan', yPosition)
    yPosition = this.addText('Kondisi Akhir', 'Semua pekerjaan telah selesai dengan baik dan telah diuji', yPosition)
    
    // Equipment Used
    if (assignment.equipment.length > 0) {
      yPosition += 10
      yPosition = this.addSection('Peralatan yang Digunakan', yPosition)
      
      const headers = ['Nama Peralatan', 'Jumlah Digunakan', 'Satuan']
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
      yPosition = this.addSection('Catatan Tambahan', yPosition)
      yPosition = this.addText('', assignment.notes, yPosition)
    }
    
    // Signatures
    yPosition += 20
    yPosition = this.addSignatureSection(yPosition, 'Tanda Tangan Klien')
    yPosition = this.addSignatureSection(yPosition + 40, 'Tanda Tangan Teknisi')
    
    // Save the PDF
    this.doc.save(`berita-acara-${assignment.id}.pdf`)
  }

  async generateCompletionReportBuffer(assignment: AssignmentData): Promise<Uint8Array> {
    this.addHeader('BERITA ACARA SERAH TERIMA PEKERJAAN')
    
    let yPosition = 80
    
    // Assignment Details
    yPosition = this.addSection('Detail Penugasan', yPosition)
    yPosition = this.addText('Nomor Laporan', assignment.id, yPosition)
    yPosition = this.addText('Nama Klien', assignment.client.name, yPosition)
    yPosition = this.addText('Jenis Layanan', assignment.serviceType.name, yPosition)
    yPosition = this.addText('Periode Pekerjaan', `${this.formatDate(assignment.startDate)} - ${this.formatDate(assignment.endDate)}`, yPosition)
    
    // Work Summary
    yPosition += 10
    yPosition = this.addSection('Ringkasan Pekerjaan', yPosition)
    yPosition = this.addText('Deskripsi Layanan', assignment.serviceType.description || 'Pekerjaan telah selesai sesuai kesepakatan', yPosition)
    yPosition = this.addText('Kondisi Akhir', 'Semua pekerjaan telah selesai dengan baik dan telah diuji', yPosition)
    
    // Equipment Used
    if (assignment.equipment.length > 0) {
      yPosition += 10
      yPosition = this.addSection('Peralatan yang Digunakan', yPosition)
      
      const headers = ['Nama Peralatan', 'Jumlah Digunakan', 'Satuan']
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
      yPosition = this.addSection('Catatan Tambahan', yPosition)
      yPosition = this.addText('', assignment.notes, yPosition)
    }
    
    // Signatures
    yPosition += 20
    yPosition = this.addSignatureSection(yPosition, 'Tanda Tangan Klien')
    yPosition = this.addSignatureSection(yPosition + 40, 'Tanda Tangan Teknisi')
    
    // Return PDF as buffer
    return this.doc.output('arraybuffer')
  }

  async generatePaymentReceipt(assignment: AssignmentData, costBreakdown: CostBreakdown): Promise<void> {
    this.addHeader('TAGIHAN PEMBAYARAN TEKNISI')
    
    let yPosition = 80
    
    // Receipt Details
    yPosition = this.addSection('Detail Tagihan', yPosition)
    yPosition = this.addText('Nomor Tagihan', assignment.id, yPosition)
    yPosition = this.addText('Nomor Penugasan', assignment.id, yPosition)
    yPosition = this.addText('Tanggal Tagihan', new Date().toLocaleDateString('id-ID'), yPosition)
    
    // Company Information (Pihak yang membayar)
    yPosition += 10
    yPosition = this.addSection('Diterbitkan Oleh', yPosition)
    yPosition = this.addText('Perusahaan', 'Clasnet Group', yPosition)
    yPosition = this.addText('Alamat', 'Jl. Serulingmas No. 32, Banjarnegara, Indonesia', yPosition)
    yPosition = this.addText('Telepon', '+62 286 123456', yPosition)
    
    // Technician Information (Pihak yang menerima pembayaran)
    yPosition += 10
    yPosition = this.addSection('Dibayarkan Kepada', yPosition)
    yPosition = this.addText('Nama Teknisi', assignment.leadTechnician.name, yPosition)
    yPosition = this.addText('Telepon', assignment.leadTechnician.phone, yPosition)
    yPosition = this.addText('Alamat', assignment.leadTechnician.address, yPosition)
    
    // Assignment Information
    yPosition += 10
    yPosition = this.addSection('Informasi Penugasan', yPosition)
    yPosition = this.addText('Klien', assignment.client.name, yPosition)
    yPosition = this.addText('Jenis Layanan', assignment.serviceType.name, yPosition)
    yPosition = this.addText('Periode', `${this.formatDate(assignment.startDate)} - ${this.formatDate(assignment.endDate)}`, yPosition)
    
    // Cost Breakdown
    yPosition += 10
    yPosition = this.addSection('Rincian Tagihan', yPosition)
    
    const headers = ['Deskripsi', 'Jumlah (IDR)']
    const data = [
      ['Fee Teknisi', this.formatRupiah(costBreakdown.technicianFee)],
      ['Biaya Transport', this.formatRupiah(costBreakdown.transportCost)],
      ['Akomodasi', this.formatRupiah(costBreakdown.accommodation)],
      ['Biaya Peralatan Insidental', this.formatRupiah(costBreakdown.incidentalEquipmentCost)],
      ['TOTAL TAGIHAN', this.formatRupiah(costBreakdown.total)]
    ]
    yPosition = this.addTable(headers, data, yPosition)
    
    // Payment Confirmation
    yPosition += 10
    yPosition = this.addSection('Konfirmasi Pembayaran', yPosition)
    yPosition = this.addText('Status Pembayaran', 'LUNAS', yPosition)
    yPosition = this.addText('Metode Pembayaran', 'Transfer Bank', yPosition)
    yPosition = this.addText('Tanggal Pembayaran', new Date().toLocaleDateString('id-ID'), yPosition)
    
    // Notes
    if (assignment.notes) {
      yPosition += 10
      yPosition = this.addSection('Catatan', yPosition)
      yPosition = this.addText('', assignment.notes, yPosition)
    }
    
    // Signatures
    yPosition += 20
    yPosition = this.addSignatureSection(yPosition, 'Dibayar Oleh (Wakil Perusahaan)')
    yPosition = this.addSignatureSection(yPosition + 40, 'Diterima Oleh (Teknisi)')
    
    // Save the PDF
    this.doc.save(`tagihan-${assignment.id}.pdf`)
  }

  async generatePaymentReceiptBuffer(assignment: AssignmentData, costBreakdown: CostBreakdown): Promise<Uint8Array> {
    this.addHeader('TAGIHAN PEMBAYARAN TEKNISI')
    
    let yPosition = 80
    
    // Receipt Details
    yPosition = this.addSection('Detail Tagihan', yPosition)
    yPosition = this.addText('Nomor Tagihan', assignment.id, yPosition)
    yPosition = this.addText('Nomor Penugasan', assignment.id, yPosition)
    yPosition = this.addText('Tanggal Tagihan', new Date().toLocaleDateString('id-ID'), yPosition)
    
    // Company Information (Pihak yang membayar)
    yPosition += 10
    yPosition = this.addSection('Diterbitkan Oleh', yPosition)
    yPosition = this.addText('Perusahaan', 'Clasnet Group', yPosition)
    yPosition = this.addText('Alamat', 'Jl. Serulingmas No. 32, Banjarnegara, Indonesia', yPosition)
    yPosition = this.addText('Telepon', '+62 286 123456', yPosition)
    
    // Technician Information (Pihak yang menerima pembayaran)
    yPosition += 10
    yPosition = this.addSection('Dibayarkan Kepada', yPosition)
    yPosition = this.addText('Nama Teknisi', assignment.leadTechnician.name, yPosition)
    yPosition = this.addText('Telepon', assignment.leadTechnician.phone, yPosition)
    yPosition = this.addText('Alamat', assignment.leadTechnician.address, yPosition)
    
    // Assignment Information
    yPosition += 10
    yPosition = this.addSection('Informasi Penugasan', yPosition)
    yPosition = this.addText('Klien', assignment.client.name, yPosition)
    yPosition = this.addText('Jenis Layanan', assignment.serviceType.name, yPosition)
    yPosition = this.addText('Periode', `${this.formatDate(assignment.startDate)} - ${this.formatDate(assignment.endDate)}`, yPosition)
    
    // Cost Breakdown
    yPosition += 10
    yPosition = this.addSection('Rincian Tagihan', yPosition)
    
    const headers = ['Deskripsi', 'Jumlah (IDR)']
    const data = [
      ['Fee Teknisi', this.formatRupiah(costBreakdown.technicianFee)],
      ['Biaya Transport', this.formatRupiah(costBreakdown.transportCost)],
      ['Akomodasi', this.formatRupiah(costBreakdown.accommodation)],
      ['Biaya Peralatan Insidental', this.formatRupiah(costBreakdown.incidentalEquipmentCost)],
      ['TOTAL TAGIHAN', this.formatRupiah(costBreakdown.total)]
    ]
    yPosition = this.addTable(headers, data, yPosition)
    
    // Payment Confirmation
    yPosition += 10
    yPosition = this.addSection('Konfirmasi Pembayaran', yPosition)
    yPosition = this.addText('Status Pembayaran', 'LUNAS', yPosition)
    yPosition = this.addText('Metode Pembayaran', 'Transfer Bank', yPosition)
    yPosition = this.addText('Tanggal Pembayaran', new Date().toLocaleDateString('id-ID'), yPosition)
    
    // Notes
    if (assignment.notes) {
      yPosition += 10
      yPosition = this.addSection('Catatan', yPosition)
      yPosition = this.addText('', assignment.notes, yPosition)
    }
    
    // Signatures
    yPosition += 20
    yPosition = this.addSignatureSection(yPosition, 'Dibayar Oleh (Wakil Perusahaan)')
    yPosition = this.addSignatureSection(yPosition + 40, 'Diterima Oleh (Teknisi)')
    
    // Return PDF as buffer
    return this.doc.output('arraybuffer')
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