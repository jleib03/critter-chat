"use client"
import { useState, useEffect } from "react"
import { Target, Users, Clock, Heart, Star, Search, Mail, Calendar } from "lucide-react"
import Header from "../../../../components/header"
import PasswordProtection from "../../../../components/password-protection"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCRMData, getInactiveCustomers, getCustomersByPetType, getRepeatCustomers } from "../../../../utils/crm-data"

type CampaignTemplate = {
  id: string
  name: string
  description: string
  category: "retention" | "acquisition" | "engagement" | "seasonal"
  targetAudience: string
  estimatedReach: number
  avgOpenRate: string
  icon: any
  color: string
  tags: string[]
  previewSubject: string
  callToAction: string
}

export default function CampaignLibrary() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null)
  const [realReachData, setRealReachData] = useState<Record<string, number>>({})
  const router = useRouter()

  useEffect(() => {
    const crmData = getCRMData()
    if (crmData) {
      const inactiveCustomers = getInactiveCustomers(crmData, 60)
      const exoticPetOwners = getCustomersByPetType(crmData, "exotic")
      const repeatCustomers = getRepeatCustomers(crmData)

      const customerBookingCounts = new Map()
      crmData.bookings.forEach((booking) => {
        const count = customerBookingCounts.get(booking.customer_email) || 0
        customerBookingCounts.set(booking.customer_email, count + 1)
      })
      const newCustomers = Array.from(customerBookingCounts.entries())
        .filter(([email, count]) => count <= 1)
        .map(([email]) => email)

      const dogCatOwners = getCustomersByPetType(crmData, "dog").concat(getCustomersByPetType(crmData, "cat"))
      const uniqueDogCatOwners = [...new Set(dogCatOwners)]

      const currentMonth = new Date().getMonth()
      const birthdayPets = Math.floor(crmData.petCare.length * 0.08)

      setRealReachData({
        "inactive-60": inactiveCustomers.length,
        "exotic-pets": exoticPetOwners.length,
        "second-time": repeatCustomers.length,
        "new-customers": newCustomers.length,
        "holiday-grooming": uniqueDogCatOwners.length,
        "birthday-pets": birthdayPets,
      })
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onAuthenticated={() => setIsAuthenticated(true)}
        title="Campaign Library Access"
        description="Enter your professional password to access campaign templates."
      />
    )
  }

  const campaignTemplates: CampaignTemplate[] = [
    {
      id: "inactive-60",
      name: "60-Day Inactive Customers",
      description: "Re-engage customers who haven't booked services in the last 60 days",
      category: "retention",
      targetAudience: "Customers with no bookings in 60+ days",
      estimatedReach: realReachData["inactive-60"] || 0,
      avgOpenRate: "72%",
      icon: Clock,
      color: "text-blue-600",
      tags: ["Win-back", "Retention", "High-impact"],
      previewSubject: "We miss you and [Pet Name]! Special offer inside",
      callToAction: "Book Now - 20% Off",
    },
    {
      id: "exotic-pets",
      name: "Exotic Pet Owners",
      description: "Targeted campaigns for owners of birds, reptiles, and other exotic pets",
      category: "engagement",
      targetAudience: "Owners of birds, reptiles, rabbits, etc.",
      estimatedReach: realReachData["exotic-pets"] || 0,
      avgOpenRate: "68%",
      icon: Heart,
      color: "text-pink-600",
      tags: ["Specialized", "Niche", "Premium"],
      previewSubject: "Specialized care for your exotic companion",
      callToAction: "Schedule Specialized Care",
    },
    {
      id: "second-time",
      name: "Second-Time Clients",
      description: "Welcome back campaigns for customers returning after their first visit",
      category: "engagement",
      targetAudience: "Customers with exactly 2 visits",
      estimatedReach: realReachData["second-time"] || 0,
      avgOpenRate: "75%",
      icon: Star,
      color: "text-blue-600",
      tags: ["Welcome back", "Loyalty", "Growth"],
      previewSubject: "Welcome back! Here's what's new for [Pet Name]",
      callToAction: "Book Your Next Visit",
    },
    {
      id: "new-customers",
      name: "New Customer Welcome",
      description: "Onboarding sequence for first-time customers",
      category: "acquisition",
      targetAudience: "Customers with 1 or fewer visits",
      estimatedReach: realReachData["new-customers"] || 0,
      avgOpenRate: "81%",
      icon: Users,
      color: "text-green-600",
      tags: ["Welcome", "Onboarding", "First impression"],
      previewSubject: "Welcome to our pet family, [Customer Name]!",
      callToAction: "Complete Your Profile",
    },
    {
      id: "holiday-grooming",
      name: "Holiday Grooming Special",
      description: "Seasonal campaign for holiday pet grooming services",
      category: "seasonal",
      targetAudience: "All customers with dogs or cats",
      estimatedReach: realReachData["holiday-grooming"] || 0,
      avgOpenRate: "65%",
      icon: Calendar,
      color: "text-amber-600",
      tags: ["Seasonal", "Grooming", "High-volume"],
      previewSubject: "Get [Pet Name] holiday-ready with our special packages",
      callToAction: "Book Holiday Grooming",
    },
    {
      id: "birthday-pets",
      name: "Pet Birthday Celebration",
      description: "Personalized birthday wishes and special offers for pets",
      category: "engagement",
      targetAudience: "Pets with birthdays this month",
      estimatedReach: realReachData["birthday-pets"] || 0,
      avgOpenRate: "89%",
      icon: Heart,
      color: "text-pink-500",
      tags: ["Personal", "Birthday", "High-engagement"],
      previewSubject: "Happy Birthday [Pet Name]! 🎉",
      callToAction: "Claim Birthday Treat",
    },
  ]

  const filteredTemplates = campaignTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "retention":
        return "bg-blue-100 text-blue-800"
      case "acquisition":
        return "bg-green-100 text-green-800"
      case "engagement":
        return "bg-purple-100 text-purple-800"
      case "seasonal":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center">
                  <selectedTemplate.icon className={`h-7 w-7 ${selectedTemplate.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold header-font">{selectedTemplate.name}</h3>
                  <p className="text-muted-foreground body-font">{selectedTemplate.description}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                ×
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 header-font">Campaign Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="body-font">Estimated Reach:</span>
                      <span className="font-medium">{selectedTemplate.estimatedReach}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="body-font">Avg. Open Rate:</span>
                      <span className="font-medium">{selectedTemplate.avgOpenRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="body-font">Category:</span>
                      <Badge className={getCategoryColor(selectedTemplate.category)}>{selectedTemplate.category}</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 header-font">Target Audience</h4>
                  <p className="text-sm body-font">{selectedTemplate.targetAudience}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {selectedTemplate.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-3 header-font">Email Preview</h4>
                <div className="bg-white rounded border p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground body-font">Subject Line:</p>
                    <p className="font-medium body-font">{selectedTemplate.previewSubject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground body-font">Call to Action:</p>
                    <Button size="sm" className="mt-1">
                      {selectedTemplate.callToAction}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  className="flex-1"
                  onClick={() => router.push(`/pro/crm/campaigns/${selectedTemplate.id}/setup`)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Use This Template
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => router.push(`/pro/crm/campaigns/${selectedTemplate.id}/preview`)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Preview Full Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-4 flex flex-col page-content">
          <div className="mb-8">
            <button
              onClick={() => router.push("/pro/crm")}
              className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              ← Back to CRM Hub
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Campaign Library</h1>
                <p className="text-muted-foreground">Choose from pre-built templates or create custom campaigns</p>
              </div>
              <Button onClick={() => router.push("/pro/crm/campaigns/create")}>Create Campaign</Button>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="acquisition">Acquisition</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="templates" className="flex-1">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="custom">Custom Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="templates">
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-6 bg-card/30 rounded-lg border hover:bg-card/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(template.category)}`}>
                          {template.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-background rounded border">
                        <div>
                          <p className="text-xs text-muted-foreground">Estimated Reach</p>
                          <p className="font-medium text-foreground">{template.estimatedReach}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg. Open Rate</p>
                          <p className="font-medium text-foreground">{template.avgOpenRate}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Target Audience</p>
                        <p className="text-sm text-foreground">{template.targetAudience}</p>
                      </div>

                      <Button
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/pro/crm/campaigns/${template.id}/setup`)
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-foreground mb-2">No campaigns found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search terms or category filter.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">No custom campaigns yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first custom campaign to target specific customer segments.
                </p>
                <Button onClick={() => router.push("/pro/crm/campaigns/create")}>Create Campaign</Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card/30 rounded border text-center">
              <p className="text-sm text-muted-foreground">Avg. Open Rate</p>
              <p className="text-xl font-bold text-foreground">72%</p>
            </div>
            <div className="p-4 bg-card/30 rounded border text-center">
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-xl font-bold text-foreground">1,247</p>
            </div>
            <div className="p-4 bg-card/30 rounded border text-center">
              <p className="text-sm text-muted-foreground">Campaigns Sent</p>
              <p className="text-xl font-bold text-foreground">23</p>
            </div>
            <div className="p-4 bg-card/30 rounded border text-center">
              <p className="text-sm text-muted-foreground">Emails Delivered</p>
              <p className="text-xl font-bold text-foreground">18,492</p>
            </div>
          </div>
        </div>
      </main>

      {renderTemplatePreview()}
    </div>
  )
}
