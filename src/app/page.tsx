"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Wrench, Calendar, DollarSign, Plus, Search, Filter, LogOut, Activity, TrendingUp, Clock, CheckCircle, AlertCircle, ArrowUpRight, ArrowDownRight, MoreHorizontal, FileText, MapPin, Star, Camera, Settings, User, FileSpreadsheet, BarChart3, Sparkles, Zap } from 'lucide-react'
import TechnicianManagement from '@/components/technician-management'
import ClientManagement from '@/components/client-management'
import AssignmentManagement from '@/components/assignment-management'
import ServiceManagement from '@/components/service-management'
import UserManagement from '@/components/user-management'
// User management component for admin users
import Login from '@/components/login'
import ReportingPage from '@/app/reporting/page'
import ReportsPage from '@/app/reports/page'
import EnhancedDashboardStats from '@/components/enhanced-dashboard-stats'
import ActivityPhotoGallery from '@/components/activity-photo-gallery'
import SimpleWorkMap from '@/components/simple-work-map'
import AssignmentTimeline from '@/components/assignment-timeline'

interface DashboardStats {
  totalTechnicians: number
  freelanceTechnicians: number
  activeAssignments: number
  pendingAssignments: number
  completedAssignments: number
  totalClients: number
  upcomingJobs: number
}

interface GalleryStats {
  todayPhotosCount: number
  uniqueLocations: number
  averageRating: number
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
  const [isLoaded, setIsLoaded] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalTechnicians: 0,
    freelanceTechnicians: 0,
    activeAssignments: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    totalClients: 0,
    upcomingJobs: 0
  })

  const [galleryStats, setGalleryStats] = useState<GalleryStats>({
    todayPhotosCount: 0,
    uniqueLocations: 0,
    averageRating: 0
  })

  const [mapAssignments, setMapAssignments] = useState<any[]>([])
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [activeReportTab, setActiveReportTab] = useState('create')
  const [shouldOpenNewAssignment, setShouldOpenNewAssignment] = useState(false)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      setUser(JSON.parse(userData))
      setIsAuthenticated(true)
      fetchDashboardData()
    }

    // Trigger load animation
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  // Redirect to profile page when profile tab is selected
  useEffect(() => {
    if (activeTab === 'profile') {
      window.location.href = '/profile'
    }
  }, [activeTab])

  // Refresh gallery stats when gallery tab is opened
  useEffect(() => {
    if (activeTab === 'gallery' && isAuthenticated) {
      fetchGalleryStats()
      fetchMapAssignments()
    }
  }, [activeTab, isAuthenticated])

  const fetchGalleryStats = async () => {
    try {
      const galleryResponse = await fetch('/api/dashboard/gallery-stats')
      const galleryData = await galleryResponse.json()
      setGalleryStats(galleryData)
    } catch (error) {
      console.error('Error fetching gallery stats:', error)
    }
  }

  const fetchMapAssignments = async () => {
    try {
      const mapResponse = await fetch('/api/assignments/map')
      const mapData = await mapResponse.json()
      setMapAssignments(mapData || [])
    } catch (error) {
      console.error('Error fetching map assignments:', error)
      setMapAssignments([])
    }
  }

  // Auto-refresh gallery stats every 5 minutes when on gallery tab
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (activeTab === 'gallery' && isAuthenticated) {
      interval = setInterval(() => {
        fetchGalleryStats()
      }, 5 * 60 * 1000) // 5 minutes
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeTab, isAuthenticated])

  // Handle user management & profile tab for admin users
  const handleUsersTabClick = () => {
    if (user?.role === 'ADMIN') {
      setActiveTab('users')
    } else {
      window.location.href = '/profile'
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/dashboard/stats')
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Fetch gallery stats
      try {
        const galleryResponse = await fetch('/api/dashboard/gallery-stats')
        const galleryData = await galleryResponse.json()
        setGalleryStats(galleryData)
      } catch (galleryError) {
        console.error('Error fetching gallery stats:', galleryError)
        // Fallback gallery stats
        setGalleryStats({
          todayPhotosCount: 0,
          uniqueLocations: 0,
          averageRating: 0
        })
      }

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

      setGalleryStats({
        todayPhotosCount: 0,
        uniqueLocations: 0,
        averageRating: 0
      })

      setRecentAssignments([
        {
          id: '1',
          clientName: 'PT. Maju Bersama',
          serviceType: 'Instalasi Jaringan',
          leadTechnician: 'Ahmad Wijaya',
          status: 'IN_PROGRESS',
          startDate: '2024-01-15',
          endDate: '2024-01-18'
        },
        {
          id: '2',
          clientName: 'CV. Teknologi Solusi',
          serviceType: 'Setup CCTV',
          leadTechnician: 'Budi Santoso',
          status: 'PENDING',
          startDate: '2024-01-20',
          endDate: '2024-01-21'
        },
        {
          id: '3',
          clientName: 'PT. Digital Kreatif',
          serviceType: 'Maintenance Server',
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
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3" />
      case 'IN_PROGRESS': return <Activity className="h-3 w-3" />
      case 'COMPLETED': return <CheckCircle className="h-3 w-3" />
      case 'CANCELLED': return <AlertCircle className="h-3 w-3" />
      default: return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Menunggu'
      case 'IN_PROGRESS': return 'Dalam Proses'
      case 'COMPLETED': return 'Selesai'
      case 'CANCELLED': return 'Dibatalkan'
      default: return status
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-primary"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/40 animate-pulse"></div>
          </div>
          <p className="text-sm text-slate-600 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Clasnet Group</h1>
                <p className="text-sm text-slate-500">Sistem Manajemen Penugasan Teknisi</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-600">Selamat datang, <span className="font-semibold text-slate-900">{user?.name}</span></span>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-rose-600 hover:bg-rose-50">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="relative bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 backdrop-blur-lg p-2 rounded-2xl border border-white/20 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-2xl"></div>
          <div className="relative flex flex-wrap gap-2">
            <TabsTrigger
              value="overview"
              className="group rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/50 text-slate-700 font-medium"
            >
              <div className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === 'overview' ? 'text-white' : 'text-blue-600'}`}>
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="relative z-10">Ringkasan</span>
              {activeTab === 'overview' && (
                <Sparkles className="h-3 w-3 text-white/80 animate-pulse" />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="assignments"
              className="group rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/50 text-slate-700 font-medium"
            >
              <div className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === 'assignments' ? 'text-white' : 'text-emerald-600'}`}>
                <Wrench className="h-4 w-4" />
              </div>
              <span className="relative z-10">Penugasan</span>
              {activeTab === 'assignments' && (
                <Zap className="h-3 w-3 text-white/80 animate-pulse" />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="gallery"
              className="group rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/50 text-slate-700 font-medium"
            >
              <div className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === 'gallery' ? 'text-white' : 'text-pink-600'}`}>
                <Camera className="h-4 w-4" />
              </div>
              <span className="relative z-10">Galeri</span>
              {activeTab === 'gallery' && (
                <Star className="h-3 w-3 text-white/80 animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="group rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/50 text-slate-700 font-medium"
            >
              <div className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === 'timeline' ? 'text-white' : 'text-purple-600'}`}>
                <Clock className="h-4 w-4" />
              </div>
              <span className="relative z-10">Timeline</span>
              {activeTab === 'timeline' && (
                <div className="h-3 w-3 bg-white/80 rounded-full animate-pulse"></div>
              )}
            </TabsTrigger>

            {/* Admin/Finance only tabs */}
            {(user?.role === 'ADMIN' || user?.role === 'FINANCE') && (
              <TabsTrigger
                value="assignment-management"
                data-value="assignment-management"
                className="group rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/50 text-slate-700 font-medium"
              >
                <div className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === 'assignment-management' ? 'text-white' : 'text-orange-600'}`}>
                  <FileText className="h-4 w-4" />
                </div>
                <span className="relative z-10">Manajemen</span>
                {activeTab === 'assignment-management' && (
                  <BarChart3 className="h-3 w-3 text-white/80 animate-pulse" />
                )}
              </TabsTrigger>
            )}

            {/* Combined Reports Tab */}
            <TabsTrigger
              value="reports"
              className="group rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/50 text-slate-700 font-medium"
            >
              <div className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === 'reports' ? 'text-white' : 'text-purple-600'}`}>
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <span className="relative z-10">Laporan</span>
              {activeTab === 'reports' && (
                <div className="h-2 w-2 bg-white/80 rounded-full animate-ping"></div>
              )}
            </TabsTrigger>

            {/* Admin only tabs */}
            {user?.role === 'ADMIN' && (
              <>
                <TabsTrigger
                  value="technicians"
                  className="group rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/50 text-slate-700 font-medium"
                >
                  <div className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === 'technicians' ? 'text-white' : 'text-cyan-600'}`}>
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="relative z-10">Teknisi</span>
                  {activeTab === 'technicians' && (
                    <div className="h-2 w-2 bg-white/80 rounded-full animate-pulse"></div>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="clients"
                  className="group rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/50 text-slate-700 font-medium"
                >
                  <div className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === 'clients' ? 'text-white' : 'text-green-600'}`}>
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="relative z-10">Klien</span>
                  {activeTab === 'clients' && (
                    <div className="h-2 w-2 bg-white/80 rounded-full animate-pulse"></div>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="services"
                  className="group rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/50 text-slate-700 font-medium"
                >
                  <div className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === 'services' ? 'text-white' : 'text-amber-600'}`}>
                    <Settings className="h-4 w-4" />
                  </div>
                  <span className="relative z-10">Layanan</span>
                  {activeTab === 'services' && (
                    <div className="h-2 w-2 bg-white/80 rounded-full animate-pulse"></div>
                  )}
                </TabsTrigger>

                <div
                  onClick={handleUsersTabClick}
                  className={`group rounded-xl px-4 py-2.5 cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-white/50 text-slate-700 font-medium ${
                    activeTab === 'users'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : ''
                  }`}
                >
                  <div className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === 'users' ? 'text-white' : 'text-violet-600'}`}>
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="relative z-10">User</span>
                  {activeTab === 'users' && (
                    <div className="h-2 w-2 bg-white/80 rounded-full animate-pulse"></div>
                  )}
                </div>
              </>
            )}

            {/* Profile tab for non-admin users */}
            {user?.role !== 'ADMIN' && (
              <TabsTrigger
                value="profile"
                className="group rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/50 text-slate-700 font-medium"
              >
                <div className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === 'profile' ? 'text-white' : 'text-slate-600'}`}>
                  <User className="h-4 w-4" />
                </div>
                <span className="relative z-10">Profil</span>
                {activeTab === 'profile' && (
                  <div className="h-2 w-2 bg-white/80 rounded-full animate-pulse"></div>
                )}
              </TabsTrigger>
            )}
          </div>
        </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-8">
              {/* Company Info Banner - Only appears on overview tab */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-blue-900 mb-1">Clasnet Group</h2>
                    <p className="text-sm text-blue-700">Jl. Serulingmas No. 32, Banjarnegara, Indonesia</p>
                  </div>
                  <div className="hidden md:flex items-center space-x-2 text-blue-600">
                    <Activity className="h-5 w-5" />
                    <span className="text-sm font-medium">Sistem Aktif</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Ringkasan Dashboard</h2>
                  <p className="text-sm text-slate-600 mt-1">Gambaran umum performa dan aktivitas terkini</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Activity className="h-3 w-3 mr-1" />
                    Sistem Aktif
                  </Badge>
                  <Badge variant="outline">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </Badge>
                </div>
              </div>

              {/* Enhanced Stats Section */}
              <EnhancedDashboardStats />

              {/* Quick Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Teknisi</p>
                      <p className="text-3xl font-bold mt-1">{stats.totalTechnicians}</p>
                      <p className="text-blue-100 text-xs mt-2">{stats.freelanceTechnicians} freelance</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">Penugasan Aktif</p>
                      <p className="text-3xl font-bold mt-1">{stats.activeAssignments}</p>
                      <p className="text-emerald-100 text-xs mt-2">{stats.pendingAssignments} menunggu</p>
                    </div>
                    <Wrench className="h-8 w-8 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Klien</p>
                      <p className="text-3xl font-bold mt-1">{stats.totalClients}</p>
                      <p className="text-purple-100 text-xs mt-2">{stats.upcomingJobs} mendatang</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm">Selesai Bulan Ini</p>
                      <p className="text-3xl font-bold mt-1">{stats.completedAssignments}</p>
                      <p className="text-amber-100 text-xs mt-2">Performa baik</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-amber-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

              {/* Activity Photo Gallery Preview */}
              <ActivityPhotoGallery limit={12} />
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Galeri Kegiatan</h2>
                <p className="text-sm text-slate-600 mt-1">Dokumentasi visual dari pekerjaan teknisi di lapangan</p>
              </div>
              <Button
                onClick={() => window.open('/reports', '_blank')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <FileText className="h-4 w-4 mr-2" />
                Lihat Semua Laporan
              </Button>
            </div>

            {/* Full Activity Gallery */}
            <ActivityPhotoGallery limit={20} />

            {/* Work Map */}
            <SimpleWorkMap assignments={mapAssignments} />

            {/* Additional Gallery Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-blue-900 flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    Foto Terbaru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-900">{galleryStats.todayPhotosCount}</p>
                  <p className="text-xs text-blue-600 mt-1">Diunggah hari ini</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-green-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Lokasi Terlayani
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-900">{galleryStats.uniqueLocations}</p>
                  <p className="text-xs text-green-600 mt-1">Lokasi berbeda</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-purple-900 flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Kualitas Dokumentasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-purple-900">
                      {galleryStats.averageRating > 0 ? galleryStats.averageRating.toFixed(1) : '0.0'}
                    </p>
                    <Star className={`h-4 w-4 ml-1 ${galleryStats.averageRating > 0 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                  </div>
                  <p className="text-xs text-purple-600 mt-1">Rating rata-rata</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Timeline Penugasan</h2>
                <p className="text-sm text-slate-600 mt-1">Riwayat kronologis penugasan per klien</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Urut Berdasarkan Tanggal
                </Badge>
              </div>
            </div>

            <AssignmentTimeline />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Penugasan Terbaru</h2>
                <p className="text-sm text-slate-600 mt-1">Kelola dan pantau semua penugasan teknisi</p>
              </div>
              <Button
                onClick={() => {
                  setActiveTab('assignment-management')
                  setShouldOpenNewAssignment(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Penugasan Baru
              </Button>
            </div>

            <div className="grid gap-4">
              {recentAssignments.map((assignment, index) => (
                <Card
                  key={assignment.id}
                  className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm animate-slide-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <h3 className="text-lg font-semibold text-slate-900">{assignment.clientName}</h3>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                            {getStatusIcon(assignment.status)}
                            <span>{getStatusText(assignment.status)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <Wrench className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600">{assignment.serviceType}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600">PIC: {assignment.leadTechnician}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600">{formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedAssignmentId(assignment.id)
                            setActiveTab('reports')
                            setActiveReportTab('list')
                          }}
                          title="Lihat Laporan Terkait"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignment-management" className="space-y-4">
            <AssignmentManagement
              triggerNewAssignment={shouldOpenNewAssignment}
              onTriggeredNewAssignment={() => setShouldOpenNewAssignment(false)}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
              {/* Sub-tabs for Reports */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Manajemen Laporan
                  </h2>
                  <p className="text-slate-600 mt-1">Buat laporan baru atau kelola laporan yang sudah ada</p>
                </div>
                <div className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-50 to-indigo-50 backdrop-blur-sm p-1 rounded-xl border border-purple-200/60 flex gap-1">
                  <button
                    onClick={() => setActiveReportTab('create')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeReportTab === 'create'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'text-slate-600 hover:text-purple-700 hover:bg-white/50'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Buat Laporan
                  </button>
                  <button
                    onClick={() => setActiveReportTab('list')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeReportTab === 'list'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'text-slate-600 hover:text-purple-700 hover:bg-white/50'
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Daftar Laporan
                  </button>
                </div>
              </div>

              {/* Report Content based on active sub-tab */}
              <div className="mt-6">
                {activeReportTab === 'create' ? (
                  <div className="animate-fadeIn">
                    <ReportingPage />
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    {selectedAssignmentId ? (
                      <div>
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-blue-900">Menampilkan Laporan untuk Penugasan Tertentu</h3>
                              <p className="text-sm text-blue-700">Laporan yang terkait dengan penugasan yang dipilih</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAssignmentId(null)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Tampilkan Semua
                            </Button>
                          </div>
                        </div>
                        <ReportsPage assignmentId={selectedAssignmentId || undefined} />
                      </div>
                    ) : (
                      <ReportsPage />
                    )}
                  </div>
                )}
              </div>
            </div>
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

          {/* Profile Tab - Available to all users */}
          <TabsContent value="profile" className="space-y-4">
            <div className="text-center py-8">
              <p>Redirecting to profile page...</p>
            </div>
          </TabsContent>

          {/* User Management - Admin only */}
          {user?.role === 'ADMIN' && (
            <TabsContent value="users" className="space-y-4">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}