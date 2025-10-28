"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Edit, Trash2, Search, Calendar, Users, Wrench, Download, Eye, FileText } from 'lucide-react'

interface Assignment {
  id: string
  client: { id: string; name: string }
  serviceType: { id: string; name: string }
  leadTechnician: { id: string; name: string; type: string }
  assistants: Array<{ technician: { id: string; name: string } }>
  equipment: Array<{ equipment: { id: string; name: string; unit: string }; quantity: number }>
  startDate: string
  endDate: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  totalCost: number
  manualCostOverride: boolean
}

interface Client {
  id: string
  name: string
}

interface ServiceType {
  id: string
  name: string
}

interface Technician {
  id: string
  name: string
  type: 'FREELANCE' | 'PERMANENT'
}

interface Equipment {
  id: string
  name: string
  unit: string
  stockQuantity: number
}

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [formData, setFormData] = useState({
    clientId: '',
    serviceTypeId: '',
    leadTechnicianId: '',
    startDate: '',
    endDate: '',
    notes: '',
    totalCost: '',
    manualCostOverride: false,
    assistantIds: [] as string[],
    equipment: [] as Array<{ equipmentId: string; quantity: number }>
  })

  useEffect(() => {
    fetchAssignments()
    fetchClients()
    fetchServiceTypes()
    fetchTechnicians()
    fetchEquipment()
  }, [searchTerm, filterStatus])

  const fetchAssignments = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      
      const response = await fetch(`/api/assignments?${params}`)
      const data = await response.json()
      setAssignments(data.assignments || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchServiceTypes = async () => {
    try {
      const response = await fetch('/api/service-types')
      const data = await response.json()
      setServiceTypes(data)
    } catch (error) {
      console.error('Error fetching service types:', error)
    }
  }

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/api/technicians')
      const data = await response.json()
      setTechnicians(data)
    } catch (error) {
      console.error('Error fetching technicians:', error)
    }
  }

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment')
      const data = await response.json()
      setEquipment(data)
    } catch (error) {
      console.error('Error fetching equipment:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchAssignments()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving assignment:', error)
    }
  }

  const handleAssistantToggle = (technicianId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        assistantIds: [...formData.assistantIds, technicianId]
      })
    } else {
      setFormData({
        ...formData,
        assistantIds: formData.assistantIds.filter(id => id !== technicianId)
      })
    }
  }

  const handleEquipmentChange = (equipmentId: string, quantity: number) => {
    const existingIndex = formData.equipment.findIndex(e => e.equipmentId === equipmentId)
    if (existingIndex >= 0) {
      const newEquipment = [...formData.equipment]
      if (quantity > 0) {
        newEquipment[existingIndex].quantity = quantity
      } else {
        newEquipment.splice(existingIndex, 1)
      }
      setFormData({ ...formData, equipment: newEquipment })
    } else if (quantity > 0) {
      setFormData({
        ...formData,
        equipment: [...formData.equipment, { equipmentId, quantity }]
      })
    }
  }

  const resetForm = () => {
    setFormData({
      clientId: '',
      serviceTypeId: '',
      leadTechnicianId: '',
      startDate: '',
      endDate: '',
      notes: '',
      totalCost: '',
      manualCostOverride: false,
      assistantIds: [],
      equipment: []
    })
    setEditingAssignment(null)
  }

  const handleDownloadPDF = async (assignmentId: string, type: 'work-order' | 'completion-report' | 'payment-receipt', event?: React.MouseEvent<HTMLButtonElement>) => {
    try {
      // Show loading state
      const button = event?.currentTarget as HTMLButtonElement
      if (button) {
        button.disabled = true
        const originalText = button.textContent || ''
        button.innerHTML = '<span class="animate-spin">⏳</span> Mengunduh...'
        
        // Store original text
        button.setAttribute('data-original-text', originalText)
      }

      // Create download link
      const response = await fetch(`/api/assignments/${assignmentId}/pdf?type=${type}`)
      
      if (response.ok) {
        // Get blob from response
        const blob = await response.blob()
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = getFilename(type, assignmentId)
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        // Show success message
        if (button) {
          button.innerHTML = '✅ Berhasil'
          setTimeout(() => {
            button.disabled = false
            const originalText = button.getAttribute('data-original-text')
            button.innerHTML = originalText || 'Download'
          }, 2000)
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to generate PDF:', errorData)
        
        // Show error message
        if (button) {
          button.innerHTML = '❌ Gagal'
          setTimeout(() => {
            button.disabled = false
            const originalText = button.getAttribute('data-original-text')
            button.innerHTML = originalText || 'Download'
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      
      // Show error message
      const button = event?.currentTarget as HTMLButtonElement
      if (button) {
        button.innerHTML = '❌ Error'
        setTimeout(() => {
          button.disabled = false
          const originalText = button.getAttribute('data-original-text')
          button.innerHTML = originalText || 'Download'
        }, 2000)
      }
    }
  }

  const getFilename = (type: string, assignmentId: string): string => {
    switch (type) {
      case 'work-order':
        return `surat-tugas-${assignmentId}.pdf`
      case 'completion-report':
        return `berita-acara-${assignmentId}.pdf`
      case 'payment-receipt':
        return `tagihan-${assignmentId}.pdf`
      default:
        return `document-${assignmentId}.pdf`
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Assignment Management</h2>
          <p className="text-muted-foreground">Create and manage service assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>
                Assign technicians to service jobs for clients
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select value={formData.serviceTypeId} onValueChange={(value) => setFormData({ ...formData, serviceTypeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadTechnician">Lead Technician (PIC) *</Label>
                <Select value={formData.leadTechnicianId} onValueChange={(value) => setFormData({ ...formData, leadTechnicianId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((technician) => (
                      <SelectItem key={technician.id} value={technician.id}>
                        {technician.name} ({technician.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assistant Technicians</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                  {technicians
                    .filter(t => t.id !== formData.leadTechnicianId)
                    .map((technician) => (
                      <div key={technician.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`assistant-${technician.id}`}
                          checked={formData.assistantIds.includes(technician.id)}
                          onCheckedChange={(checked) => handleAssistantToggle(technician.id, checked as boolean)}
                        />
                        <Label htmlFor={`assistant-${technician.id}`} className="text-sm">
                          {technician.name} ({technician.type})
                        </Label>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Equipment</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                  {equipment.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 py-1">
                      <Label className="text-sm flex-1">{item.name} ({item.unit})</Label>
                      <Input
                        type="number"
                        min="0"
                        max={item.stockQuantity}
                        placeholder="Qty"
                        className="w-20 h-8"
                        value={formData.equipment.find(e => e.equipmentId === item.id)?.quantity || ''}
                        onChange={(e) => handleEquipmentChange(item.id, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalCost">Total Cost (IDR)</Label>
                <Input
                  id="totalCost"
                  type="number"
                  step="0.01"
                  value={formData.totalCost}
                  onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                  placeholder="Auto-calculated or manual override"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes for this assignment"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Assignment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="font-medium">{assignment.client.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{assignment.serviceType.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {assignment.leadTechnician.name}
                    </div>
                    {assignment.assistants.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        +{assignment.assistants.length} assistant(s)
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(assignment.startDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        to {formatDate(assignment.endDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      Rp {assignment.totalCost.toLocaleString('id-ID')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Lihat
                      </Button>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => handleDownloadPDF(assignment.id, 'work-order', e)}
                          title="Download Surat Tugas"
                          data-original-text="Surat Tugas"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Surat Tugas
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => handleDownloadPDF(assignment.id, 'completion-report', e)}
                          title="Download Berita Acara"
                          data-original-text="Berita Acara"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Berita Acara
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => handleDownloadPDF(assignment.id, 'payment-receipt', e)}
                          title="Download Tagihan"
                          data-original-text="Tagihan"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Tagihan
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {assignments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No assignments found. Create your first assignment to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}