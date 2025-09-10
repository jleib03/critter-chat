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
} from "lucide-react"
import Header from "../../../components/header"
import PasswordProtection from "../../../components/password-protection"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCRMData, getCRMProfessionalId, type CRMRawData } from "@/utils/crm-data"

export default function CRMDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [crmData, setCrmData] = useState<CRMRawData | null>(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const data = getCRMData()
    const professionalId = getCRMProfessionalId()

    console.log("[v0] Checking CRM data:", { data: !!data, professionalId })

    if (data && professionalId) {
      setCrmData(data)
      setIsDataLoaded(true)
    }
  }, [])

  // If not authenticated, show password protection
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
                Before you can use the CRM and email marketing tools, you need to load your customer data.
              </p>
            </div>

            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>No CRM data found.</strong> Please initialize your CRM data to access customer management and
                email marketing features.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Load your customer and booking data to unlock powerful CRM and email marketing capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => router.push("/pro/crm/initialize")} className="w-full" size="lg">
                  <Database className="h-5 w-5 mr-2" />
                  Initialize CRM Data
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    This will fetch your customer data and enable all CRM features.
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
    ? {
        totalCustomers: crmData.customers.length,
        totalBookings: crmData.bookings.length,
        totalPets: crmData.pets.length,
        // Calculate average based on actual data or use placeholder
        avgOpenRate: "68%", // This would come from email campaign data later
        revenue: "$12,450", // This would be calculated from booking amounts
      }
    : {
        totalCustomers: 0,
        totalBookings: 0,
        totalPets: 0,
        avgOpenRate: "0%",
        revenue: "$0",
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
              <Badge variant="outline" className="px-4 py-2 text-sm">
                <Database className="h-4 w-4 mr-2" />
                Data Loaded: {getCRMProfessionalId()}
              </Badge>
            </div>
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
                    <p className="text-2xl font-bold text-foreground header-font">{stats.totalPets.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground body-font">Revenue This Month</p>
                    <p className="text-2xl font-bold text-foreground header-font">{stats.revenue}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-chart-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Data Management Section */}
            <Card className="border-border hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="header-font">Customer Data Management</CardTitle>
                      <CardDescription className="body-font">
                        Import and organize your customer information
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted bg-transparent"
                    onClick={() => router.push("/pro/crm/upload")}
                  >
                    <div className="flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span className="font-medium body-font">Upload Data</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-left body-font">
                      Import customer lists, booking history, and pet information
                    </p>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted bg-transparent"
                    onClick={() => router.push("/pro/crm/customers")}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium body-font">Manage Customers</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-left body-font">
                      View, edit, and organize your customer database
                    </p>
                  </Button>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2 header-font">Supported Data Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Critter Bookings
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      CSV Files
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Excel Sheets
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Manual Entry
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  <h4 className="font-medium text-sm mb-2 header-font">Popular Campaign Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="body-font">60-Day Inactive Customers</span>
                      <Badge variant="outline" className="text-xs">
                        12 sent
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="body-font">Exotic Pet Owners</span>
                      <Badge variant="outline" className="text-xs">
                        8 sent
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="body-font">Second-Time Clients</span>
                      <Badge variant="outline" className="text-xs">
                        15 sent
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Marketing Section */}
          <Card className="border-border mb-12">
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
                      <span className="text-sm body-font">Total Sent</span>
                      <span className="font-medium header-font">2,847</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm body-font">Avg. Open Rate</span>
                      <span className="font-medium header-font">68%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm body-font">Click Rate</span>
                      <span className="font-medium header-font">24%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm body-font">Conversions</span>
                      <span className="font-medium header-font">156</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started Section */}
          <Card className="border-border bg-gradient-to-r from-primary/5 to-accent/5">
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
              <p className="text-sm text-muted-foreground">
                CRM data loaded for Professional ID: {getCRMProfessionalId()}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/pro/crm/initialize")}>
              <Database className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
