"use client"
import { useState, useEffect } from "react"
import {
  Mail,
  Users,
  Upload,
  Target,
  BarChart3,
  Plus,
  Database,
  Zap,
  TrendingUp,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Header from "../../../components/header"
import PasswordProtection from "../../../components/password-protection"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCRMData, getCRMProfessionalId, initializeCRMData, type CRMRawData } from "@/utils/crm-data"

export default function CRMDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [crmData, setCrmData] = useState<CRMRawData | null>(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [professionalId, setProfessionalId] = useState("")
  const [isInitializing, setIsInitializing] = useState(false)
  const [initError, setInitError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const data = getCRMData()
    const storedProfessionalId = getCRMProfessionalId()

    console.log("[v0] Checking CRM data:", { data: !!data, professionalId: storedProfessionalId })
    console.log("[v0] Full CRM data structure:", data)
    console.log("[v0] Data keys:", data ? Object.keys(data) : "No data")

    if (data && storedProfessionalId) {
      setCrmData(data)
      setIsDataLoaded(true)
      setProfessionalId(storedProfessionalId)
    }
  }, [])

  const handleInitialization = async () => {
    if (!professionalId.trim()) {
      setInitError("Please enter your Professional ID")
      return
    }

    setIsInitializing(true)
    setInitError("")

    try {
      console.log("[v0] Initializing CRM for professional:", professionalId)
      const crmData = await initializeCRMData(professionalId.trim())

      if (crmData) {
        setCrmData(crmData)
        setIsDataLoaded(true)
        console.log("[v0] CRM initialization successful")
      } else {
        setInitError("No data found for this Professional ID. Please check your ID and try again.")
      }
    } catch (error) {
      console.error("[v0] CRM initialization error:", error)
      if (error instanceof Error) {
        setInitError(`Failed to initialize CRM data: ${error.message}`)
      } else {
        setInitError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsInitializing(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onAuthenticated={() => setIsAuthenticated(true)}
        title="CRM Hub Access"
        description="Enter your professional password to access CRM and email marketing tools."
      />
    )
  }

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="pt-8 flex-1 flex flex-col">
          <div className="max-w-4xl mx-auto px-4 flex flex-col page-content">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl title-font mb-4 text-foreground">Initialize Your CRM</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto body-font">
                Enter your Professional ID to load your customer data and access CRM tools.
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center">CRM Data Initialization</CardTitle>
                <CardDescription className="text-center">
                  This will fetch all your customer, booking, and pet data from the database to power your CRM
                  campaigns.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="professionalId">Professional ID</Label>
                  <Input
                    id="professionalId"
                    type="text"
                    placeholder="Enter your Professional ID"
                    value={professionalId}
                    onChange={(e) => setProfessionalId(e.target.value)}
                    disabled={isInitializing}
                  />
                </div>

                {initError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{initError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleInitialization}
                  className="w-full"
                  size="lg"
                  disabled={isInitializing || !professionalId.trim()}
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Initializing CRM Data...
                    </>
                  ) : (
                    <>
                      <Database className="h-5 w-5 mr-2" />
                      Initialize CRM Data
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    This will connect to your database and load all customer information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const stats = crmData
    ? (() => {
        console.log("[v0] Calculating stats from crmData:", crmData)

        const petCarePlans = crmData.petCare || []
        const bookings = crmData.bookings || []
        const invoices = crmData.invoices?.invoices || []
        const onboardingData = crmData.onboarding ? [crmData.onboarding] : []

        console.log("[v0] Data arrays:", {
          petCarePlans: petCarePlans.length,
          bookings: bookings.length,
          invoices: invoices.length,
          onboardingData: onboardingData.length,
        })

        // Extract unique customers from bookings
        const uniqueCustomers = new Set()
        bookings.forEach((booking) => {
          if (booking.customer_email) {
            uniqueCustomers.add(booking.customer_email)
          }
        })

        // Calculate total pets from pet care plans
        const totalPets = petCarePlans.length

        // Calculate revenue from invoices
        const totalRevenue = invoices.reduce((sum, invoice) => {
          const amount = Number.parseFloat(invoice.amount || "0")
          return sum + (isNaN(amount) ? 0 : amount)
        }, 0)

        const onboardingRate = crmData.onboarding?.onboarding_complete ? 100 : 0

        return {
          totalCustomers: uniqueCustomers.size,
          totalBookings: bookings.length,
          totalPets: totalPets,
          revenue: `$${totalRevenue.toLocaleString()}`,
          onboardingRate: `${onboardingRate}%`,
          exoticPets: petCarePlans.filter((pet) => pet.pet_type && !["dog", "cat"].includes(pet.pet_type.toLowerCase()))
            .length,
          recentBookings: bookings.filter((booking) => {
            if (!booking.booking_date) return false
            const bookingDate = new Date(booking.booking_date)
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            return bookingDate >= thirtyDaysAgo
          }).length,
        }
      })()
    : {
        totalCustomers: 0,
        totalBookings: 0,
        totalPets: 0,
        revenue: "$0",
        onboardingRate: "0%",
        exoticPets: 0,
        recentBookings: 0,
      }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-4 flex flex-col page-content">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl title-font mb-4 text-foreground">CRM & Email Marketing Hub</h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto body-font">
              Manage customer relationships, create targeted campaigns, and grow your pet service business with powerful
              marketing automation tools.
            </p>

            {/* Status Badge */}
            <div className="mt-6 flex justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Zap className="h-4 w-4 mr-2" />
                Professional CRM Tools
              </Badge>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  <Database className="h-4 w-4 mr-2" />
                  Data Loaded: {professionalId}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleInitialization}
                  disabled={isInitializing}
                  className="h-8 w-8 p-0"
                  title="Refresh CRM Data"
                >
                  {isInitializing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/pro/crm/upload")}
                className="px-4 py-2 text-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </Button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground body-font">Total Customers</p>
                      <p className="text-2xl font-bold text-foreground header-font">
                        {stats.totalCustomers.toLocaleString()}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground body-font">Total Bookings</p>
                      <p className="text-2xl font-bold text-foreground header-font">
                        {stats.totalBookings.toLocaleString()}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground body-font">Registered Pets</p>
                      <p className="text-2xl font-bold text-foreground header-font">
                        {stats.totalPets.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground body-font">Total Revenue</p>
                      <p className="text-2xl font-bold text-foreground header-font">{stats.revenue}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-chart-4" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {crmData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg header-font">Customer Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm body-font">Onboarding Complete</span>
                      <Badge variant="secondary">{stats.onboardingRate}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm body-font">Recent Bookings (30d)</span>
                      <span className="font-medium header-font">{stats.recentBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm body-font">Exotic Pet Owners</span>
                      <span className="font-medium header-font">{stats.exoticPets}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg header-font">Pet Care Plans</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {crmData.petCare?.slice(0, 3).map((pet, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium body-font">{pet.name || "Unnamed Pet"}</p>
                          <p className="text-xs text-muted-foreground body-font">
                            {pet.pet_type || "Unknown"} • {pet.contacts?.[0]?.email || "No email"}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Care Plan
                        </Badge>
                      </div>
                    )) || <p className="text-sm text-muted-foreground body-font">No pet care plans found</p>}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg header-font">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {crmData.bookings?.slice(0, 3).map((booking, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium body-font">{booking.service_type || "Service"}</p>
                          <p className="text-xs text-muted-foreground body-font">
                            {booking.customer_email || "No email"}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground body-font">
                          {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : "No date"}
                        </span>
                      </div>
                    )) || <p className="text-sm text-muted-foreground body-font">No recent bookings found</p>}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Feature Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Campaign Library Section */}
              <Card className="border-border hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <CardTitle className="header-font">Campaign Library</CardTitle>
                        <CardDescription className="body-font">Pre-built and custom email campaigns</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted bg-transparent"
                      onClick={() => router.push("/pro/crm/campaigns")}
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium body-font">Browse Templates</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left body-font">
                        Ready-made campaigns for common scenarios
                      </p>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted bg-transparent"
                      onClick={() => router.push("/pro/crm/campaigns/create")}
                    >
                      <div className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span className="font-medium body-font">Create Custom</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left body-font">
                        Build targeted campaigns for your audience
                      </p>
                    </Button>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2 header-font">Campaign Opportunities</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="body-font">Exotic Pet Owners</span>
                        <Badge variant="outline" className="text-xs">
                          {stats.exoticPets} customers
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="body-font">Incomplete Onboarding</span>
                        <Badge variant="outline" className="text-xs">
                          {stats.totalCustomers -
                            Math.round((Number.parseInt(stats.onboardingRate) / 100) * stats.totalCustomers)}{" "}
                          customers
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="body-font">Recent Clients (30d)</span>
                        <Badge variant="outline" className="text-xs">
                          {stats.recentBookings} bookings
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Marketing Section */}
              <Card className="border-border hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="header-font">Email Marketing Center</CardTitle>
                        <CardDescription className="body-font">Create, send, and track email campaigns</CardDescription>
                      </div>
                    </div>
                    <Button onClick={() => router.push("/pro/crm/email/compose")}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Campaign
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium header-font">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => router.push("/pro/crm/email/compose")}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Compose Email
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => router.push("/pro/crm/email/templates")}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Email Templates
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => router.push("/pro/crm/email/analytics")}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Campaign Analytics
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium header-font">Recent Campaigns</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium body-font">Holiday Grooming Special</p>
                            <p className="text-xs text-muted-foreground body-font">Sent 2 days ago</p>
                          </div>
                          <Badge variant="secondary">68% open</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium body-font">New Client Welcome</p>
                            <p className="text-xs text-muted-foreground body-font">Sent 1 week ago</p>
                          </div>
                          <Badge variant="secondary">72% open</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium header-font">Performance Overview</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm body-font">Total Customers</span>
                          <span className="font-medium header-font">{stats.totalCustomers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm body-font">Onboarding Rate</span>
                          <span className="font-medium header-font">{stats.onboardingRate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm body-font">Total Revenue</span>
                          <span className="font-medium header-font">{stats.revenue}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm body-font">Active Pets</span>
                          <span className="font-medium header-font">{stats.totalPets}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Getting Started Section */}
              <Card className="border-border bg-gradient-to-r from-primary/5 to-accent/5 mb-12">
                <CardHeader>
                  <CardTitle className="header-font">Getting Started with CRM</CardTitle>
                  <CardDescription className="body-font">
                    New to email marketing? Follow these steps to set up your first campaign.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium mb-1 header-font">Upload Your Data</h4>
                        <p className="text-sm text-muted-foreground body-font">
                          Import your customer list or connect your Critter booking data to get started.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium mb-1 header-font">Choose a Campaign</h4>
                        <p className="text-sm text-muted-foreground body-font">
                          Select from our pre-built templates or create a custom campaign for your audience.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium mb-1 header-font">Send & Track</h4>
                        <p className="text-sm text-muted-foreground body-font">
                          Launch your campaign and monitor performance with detailed analytics.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => router.push("/pro/crm/upload")} className="flex-1">
                      <Upload className="h-4 w-4 mr-2" />
                      Start with Data Upload
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/pro/crm/campaigns")} className="flex-1">
                      <Target className="h-4 w-4 mr-2" />
                      Browse Campaign Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Data Refresh Option */}
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">CRM data loaded for Professional ID: {professionalId}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/pro/crm/initialize")}>
                  <Database className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
