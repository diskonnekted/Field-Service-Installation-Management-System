"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Wrench, Calendar, DollarSign, Plus, Search, Filter, LogOut } from 'lucide-react'
import TechnicianManagement from '@/components/technician-management'
import ClientManagement from '@/components/client-management'
import AssignmentManagement from '@/components/assignment-management'
import ServiceManagement from '@/components/service-management'
import Login from '@/components/login'

interface DashboardStats {
  totalTechnicians: number
  freelanceTechnicians: number
  activeAssignments: number
  pendingAssignments: number
  completedAssignments: number
  totalClients: number
  upcomingJobs: number
}

interface RecentAssignment {
  id: string
  clientName: string
  serviceType: string
  leadTechnician: string
  status: string
  startDate: string
  endDate: string
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalTechnicians: 0,
    freelanceTechnicians: 0,
    activeAssignments: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    totalClients: 0,
    upcomingJobs: 0
  })
  
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
      setIsAuthenticated(true)
      fetchDashboardData()
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/dashboard/stats')
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Fetch recent assignments
      const assignmentsResponse = await fetch('/api/assignments?limit=5')
      const assignmentsData = await assignmentsResponse.json()
      
      const formattedAssignments = assignmentsData.assignments.map((assignment: any) => ({
        id: assignment.id,
        clientName: assignment.client.name,
        serviceType: assignment.serviceType.name,
        leadTechnician: assignment.leadTechnician.name,
        status: assignment.status,
        startDate: assignment.startDate,
        endDate: assignment.endDate
      }))
      
      setRecentAssignments(formattedAssignments)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Fallback to mock data
      setStats({
        totalTechnicians: 12,
        freelanceTechnicians: 8,
        activeAssignments: 5,
        pendingAssignments: 3,
        completedAssignments: 24,
        totalClients: 18,
        upcomingJobs: 7
      })
      
      setRecentAssignments([
        {
          id: '1',
          clientName: 'PT. Maju Bersama',
          serviceType: 'Network Installation',
          leadTechnician: 'Ahmad Wijaya',
          status: 'IN_PROGRESS',
          startDate: '2024-01-15',
          endDate: '2024-01-18'
        },
        {
          id: '2',
          clientName: 'CV. Teknologi Solusi',
          serviceType: 'CCTV Setup',
          leadTechnician: 'Budi Santoso',
          status: 'PENDING',
          startDate: '2024-01-20',
          endDate: '2024-01-21'
        },
        {
          id: '3',
          clientName: 'PT. Digital Kreatif',
          serviceType: 'Server Maintenance',
          leadTechnician: 'Siti Nurhaliza',
          status: 'COMPLETED',
          startDate: '2024-01-10',
          endDate: '2024-01-12'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData: any) => {
    setUser(userData)
    setIsAuthenticated(true)
    fetchDashboardData()
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    setStats({
      totalTechnicians: 0,
      freelanceTechnicians: 0,
      activeAssignments: 0,
      pendingAssignments: 0,
      completedAssignments: 0,
      totalClients: 0,
      upcomingJobs: 0
    })
    setRecentAssignments([])
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Clasnet Group</h1>
                <p className="text-sm text-gray-500">Technician Assignment Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Info */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Clasnet Group</strong> | Jl. Serulingmas No. 32, Banjarnegara, Indonesia
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Technicians</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTechnicians}</div>
              <p className="text-xs text-muted-foreground">
                {stats.freelanceTechnicians} freelance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAssignments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingAssignments} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                {stats.upcomingJobs} upcoming jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedAssignments}</div>
              <p className="text-xs text-muted-foreground">
                All time assignments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assignments">Recent Assignments</TabsTrigger>
            <TabsTrigger value="assignment-management">Assignment Management</TabsTrigger>
            <TabsTrigger value="technicians">Technicians</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="services">Services & Equipment</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Assignments</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </div>
            
            <div className="grid gap-4">
              {recentAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{assignment.clientName}</h3>
                        <p className="text-sm text-muted-foreground">{assignment.serviceType}</p>
                        <p className="text-sm">Lead: {assignment.leadTechnician}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace('_', ' ')}
                        </Badge>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignment-management" className="space-y-4">
            <AssignmentManagement />
          </TabsContent>

          <TabsContent value="technicians" className="space-y-4">
            <TechnicianManagement />
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <ServiceManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}