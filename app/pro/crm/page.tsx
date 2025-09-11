"use client"
import { useState, useEffect } from "react"
import { Database, AlertCircle, Loader2 } from "lucide-react"
import Header from "../../../components/header"
import PasswordProtection from "../../../components/password-protection"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">CRM Dashboard</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Manage customer relationships and grow your pet service business with data-driven insights.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between mb-8 p-4 bg-card/50 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">Data loaded: {professionalId}</span>
              </div>
              <button
                onClick={handleInitialization}
                disabled={isInitializing}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isInitializing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/pro/crm/upload")} className="text-sm">
              Upload Data
            </Button>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="p-6 bg-card/30 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Customers</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalCustomers.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-card/30 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Bookings</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalBookings.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-card/30 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Pets</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalPets.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-card/30 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Revenue</p>
              <p className="text-2xl font-bold text-foreground">{stats.revenue}</p>
            </div>
          </div>

          {/* Main Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="p-8 bg-card/30 rounded-lg border">
              <h3 className="text-xl font-semibold text-foreground mb-2">Email Campaigns</h3>
              <p className="text-muted-foreground mb-6">Create and manage targeted email campaigns</p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => router.push("/pro/crm/campaigns")}
                  className="w-full p-4 text-left bg-background rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium text-foreground">Browse Templates</div>
                  <div className="text-sm text-muted-foreground">Pre-built campaigns for common scenarios</div>
                </button>

                <button
                  onClick={() => router.push("/pro/crm/campaigns/create")}
                  className="w-full p-4 text-left bg-background rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium text-foreground">Create Custom Campaign</div>
                  <div className="text-sm text-muted-foreground">Build targeted campaigns for your audience</div>
                </button>
              </div>

              <div className="p-4 bg-background rounded-lg border">
                <h4 className="font-medium text-foreground mb-3">Campaign Opportunities</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exotic Pet Owners</span>
                    <span className="text-foreground">{stats.exoticPets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recent Bookings (30d)</span>
                    <span className="text-foreground">{stats.recentBookings}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-card/30 rounded-lg border">
              <h3 className="text-xl font-semibold text-foreground mb-2">Email Marketing</h3>
              <p className="text-muted-foreground mb-6">Compose and track email performance</p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => router.push("/pro/crm/email/compose")}
                  className="w-full p-4 text-left bg-background rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium text-foreground">Compose Email</div>
                  <div className="text-sm text-muted-foreground">Create and send new campaigns</div>
                </button>

                <button
                  onClick={() => router.push("/pro/crm/email/analytics")}
                  className="w-full p-4 text-left bg-background rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium text-foreground">View Analytics</div>
                  <div className="text-sm text-muted-foreground">Track campaign performance</div>
                </button>
              </div>

              <div className="p-4 bg-background rounded-lg border">
                <h4 className="font-medium text-foreground mb-3">Performance Overview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Customers</div>
                    <div className="font-medium text-foreground">{stats.totalCustomers}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Revenue</div>
                    <div className="font-medium text-foreground">{stats.revenue}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Insights */}
          {crmData && (
            <div className="p-8 bg-card/30 rounded-lg border mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-medium text-foreground mb-4">Pet Care Plans</h4>
                  <div className="space-y-3">
                    {crmData.petCare?.slice(0, 3).map((pet, index) => (
                      <div key={index} className="p-3 bg-background rounded border">
                        <div className="font-medium text-foreground text-sm">{pet.name || "Unnamed Pet"}</div>
                        <div className="text-xs text-muted-foreground">
                          {pet.pet_type || "Unknown"} • {pet.contacts?.[0]?.email || "No email"}
                        </div>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No pet care plans found</p>}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-4">Recent Bookings</h4>
                  <div className="space-y-3">
                    {crmData.bookings?.slice(0, 3).map((booking, index) => (
                      <div key={index} className="p-3 bg-background rounded border">
                        <div className="font-medium text-foreground text-sm">{booking.service_type || "Service"}</div>
                        <div className="text-xs text-muted-foreground">{booking.customer_email || "No email"}</div>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No recent bookings found</p>}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-4">Key Metrics</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-background rounded border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Onboarding Complete</span>
                        <span className="text-sm font-medium text-foreground">{stats.onboardingRate}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-background rounded border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Exotic Pet Owners</span>
                        <span className="text-sm font-medium text-foreground">{stats.exoticPets}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Getting Started Section */}
          <div className="p-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border">
            <h3 className="text-xl font-semibold text-foreground mb-2">Getting Started</h3>
            <p className="text-muted-foreground mb-6">
              New to email marketing? Follow these steps to set up your first campaign.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Upload Data</h4>
                  <p className="text-sm text-muted-foreground">Import your customer list or connect booking data</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Choose Campaign</h4>
                  <p className="text-sm text-muted-foreground">Select templates or create custom campaigns</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Send & Track</h4>
                  <p className="text-sm text-muted-foreground">Launch campaigns and monitor performance</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => router.push("/pro/crm/upload")}>Start with Data Upload</Button>
              <Button variant="outline" onClick={() => router.push("/pro/crm/campaigns")}>
                Browse Templates
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
