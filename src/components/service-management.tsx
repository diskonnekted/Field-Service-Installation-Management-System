"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Search, Wrench, Package } from 'lucide-react'

interface ServiceType {
  id: string
  name: string
  category: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface Equipment {
  id: string
  name: string
  unit: string
  stockQuantity: number
  createdAt: string
  updatedAt: string
}

export default function ServiceManagement() {
  // Service Types State
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [serviceLoading, setServiceLoading] = useState(true)
  const [serviceSearchTerm, setServiceSearchTerm] = useState('')
  const [serviceFilterCategory, setServiceFilterCategory] = useState<string>('all')
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  const [editingServiceType, setEditingServiceType] = useState<ServiceType | null>(null)
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    category: '',
    description: ''
  })

  // Equipment State
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [equipmentLoading, setEquipmentLoading] = useState(true)
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('')
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [equipmentFormData, setEquipmentFormData] = useState({
    name: '',
    unit: 'unit',
    stockQuantity: ''
  })

  useEffect(() => {
    fetchServiceTypes()
    fetchEquipment()
  }, [serviceSearchTerm, serviceFilterCategory, equipmentSearchTerm])

  // Service Types Functions
  const fetchServiceTypes = async () => {
    try {
      const params = new URLSearchParams()
      if (serviceSearchTerm) params.append('search', serviceSearchTerm)
      if (serviceFilterCategory !== 'all') params.append('category', serviceFilterCategory)
      
      const response = await fetch(`/api/service-types?${params}`)
      const data = await response.json()
      setServiceTypes(data)
    } catch (error) {
      console.error('Error fetching service types:', error)
    } finally {
      setServiceLoading(false)
    }
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingServiceType ? `/api/service-types/${editingServiceType.id}` : '/api/service-types'
      const method = editingServiceType ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceFormData),
      })

      if (response.ok) {
        await fetchServiceTypes()
        setIsServiceDialogOpen(false)
        resetServiceForm()
      }
    } catch (error) {
      console.error('Error saving service type:', error)
    }
  }

  const handleServiceEdit = (serviceType: ServiceType) => {
    setEditingServiceType(serviceType)
    setServiceFormData({
      name: serviceType.name,
      category: serviceType.category,
      description: serviceType.description || ''
    })
    setIsServiceDialogOpen(true)
  }

  const handleServiceDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service type?')) {
      try {
        const response = await fetch(`/api/service-types/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchServiceTypes()
        }
      } catch (error) {
        console.error('Error deleting service type:', error)
      }
    }
  }

  const resetServiceForm = () => {
    setServiceFormData({
      name: '',
      category: '',
      description: ''
    })
    setEditingServiceType(null)
  }

  // Equipment Functions
  const fetchEquipment = async () => {
    try {
      const params = new URLSearchParams()
      if (equipmentSearchTerm) params.append('search', equipmentSearchTerm)
      
      const response = await fetch(`/api/equipment?${params}`)
      const data = await response.json()
      setEquipment(data)
    } catch (error) {
      console.error('Error fetching equipment:', error)
    } finally {
      setEquipmentLoading(false)
    }
  }

  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingEquipment ? `/api/equipment/${editingEquipment.id}` : '/api/equipment'
      const method = editingEquipment ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentFormData),
      })

      if (response.ok) {
        await fetchEquipment()
        setIsEquipmentDialogOpen(false)
        resetEquipmentForm()
      }
    } catch (error) {
      console.error('Error saving equipment:', error)
    }
  }

  const handleEquipmentEdit = (item: Equipment) => {
    setEditingEquipment(item)
    setEquipmentFormData({
      name: item.name,
      unit: item.unit,
      stockQuantity: item.stockQuantity.toString()
    })
    setIsEquipmentDialogOpen(true)
  }

  const handleEquipmentDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      try {
        const response = await fetch(`/api/equipment/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchEquipment()
        }
      } catch (error) {
        console.error('Error deleting equipment:', error)
      }
    }
  }

  const resetEquipmentForm = () => {
    setEquipmentFormData({
      name: '',
      unit: 'unit',
      stockQuantity: ''
    })
    setEditingEquipment(null)
  }

  const getCategories = () => {
    const categories = [...new Set(serviceTypes.map(st => st.category))]
    return categories
  }

  if (serviceLoading || equipmentLoading) {
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
          <h2 className="text-2xl font-bold">Service Management</h2>
          <p className="text-muted-foreground">Manage service types and equipment inventory</p>
        </div>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Service Types</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>

        {/* Service Types Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Service Types</h3>
              <p className="text-sm text-muted-foreground">Define the services you offer to clients</p>
            </div>
            <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetServiceForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Type
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingServiceType ? 'Edit Service Type' : 'Add New Service Type'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingServiceType ? 'Update service type information' : 'Add a new service type'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceName">Service Name *</Label>
                    <Input
                      id="serviceName"
                      value={serviceFormData.name}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={serviceFormData.category}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                      placeholder="e.g., Installation, Maintenance, Repair"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={serviceFormData.description}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                      placeholder="Detailed description of the service"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingServiceType ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Service Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search service types..."
                value={serviceSearchTerm}
                onChange={(e) => setServiceSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={serviceFilterCategory} onValueChange={setServiceFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getCategories().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Types Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceTypes.map((serviceType) => (
                    <TableRow key={serviceType.id}>
                      <TableCell className="font-medium">{serviceType.name}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {serviceType.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {serviceType.description || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleServiceEdit(serviceType)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleServiceDelete(serviceType.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {serviceTypes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No service types found. Add your first service type to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Equipment Inventory</h3>
              <p className="text-sm text-muted-foreground">Manage your equipment stock</p>
            </div>
            <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetEquipmentForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingEquipment ? 'Update equipment information' : 'Add new equipment to inventory'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEquipmentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipmentName">Equipment Name *</Label>
                    <Input
                      id="equipmentName"
                      value={equipmentFormData.name}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Input
                      id="unit"
                      value={equipmentFormData.unit}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, unit: e.target.value })}
                      placeholder="e.g., unit, set, meter"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      min="0"
                      value={equipmentFormData.stockQuantity}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, stockQuantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsEquipmentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingEquipment ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Equipment Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={equipmentSearchTerm}
              onChange={(e) => setEquipmentSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Equipment Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Stock Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${item.stockQuantity <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.stockQuantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.stockQuantity <= 5 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.stockQuantity <= 5 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEquipmentEdit(item)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEquipmentDelete(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {equipment.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No equipment found. Add your first equipment item to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}