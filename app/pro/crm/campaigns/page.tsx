"use client"
import { useState } from "react"
import {
  Target,
  Users,
  Clock,
  Heart,
  Star,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Mail,
  Calendar,
  TrendingUp,
} from "lucide-react"
import Header from "../../../../components/header"
import PasswordProtection from "../../../../components/password-protection"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const router = useRouter()

  // If not authenticated, show password protection
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
      estimatedReach: 247,
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
      estimatedReach: 89,
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
      estimatedReach: 156,
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
      estimatedReach: 203,
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
      estimatedReach: 892,
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
      estimatedReach: 67,
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

  const renderTemplateCard = (template: CampaignTemplate) => (
    <Card
      key={template.id}
      className="border-border hover:shadow-lg transition-all duration-200 cursor-pointer bg-card/50 backdrop-blur-sm"
      onClick={() => setSelectedTemplate(template)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-muted/80 rounded-lg flex items-center justify-center border`}>
              <template.icon className={`h-5 w-5 ${template.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg header-font text-foreground">{template.name}</CardTitle>
              <CardDescription className="body-font text-muted-foreground">{template.description}</CardDescription>
            </div>
          </div>
          <Badge className={`${getCategoryColor(template.category)} font-medium`}>{template.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 rounded-lg p-3">
            <div>
              <p className="text-muted-foreground body-font text-xs uppercase tracking-wide">Estimated Reach</p>
              <p className="font-semibold header-font text-foreground">{template.estimatedReach} customers</p>
            </div>
            <div>
              <p className="text-muted-foreground body-font text-xs uppercase tracking-wide">Avg. Open Rate</p>
              <p className="font-semibold header-font text-foreground">{template.avgOpenRate}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2 body-font font-medium">Target Audience</p>
            <p className="text-sm body-font text-foreground/90">{template.targetAudience}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-secondary/80 text-secondary-foreground border">
                {tag}
              </Badge>
            ))}
          </div>

          <Button
            className="w-full mt-4"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/pro/crm/campaigns/${template.id}/setup`)
            }}
          >
            <Target className="h-4 w-4 mr-2" />
            Use This Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <selectedTemplate.icon className={`h-6 w-6 ${selectedTemplate.color}`} />
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
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.push("/pro/crm")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to CRM Hub
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl title-font mb-2 text-foreground">Campaign Library</h1>
                <p className="text-lg text-muted-foreground body-font">
                  Choose from pre-built templates or create custom campaigns for your audience
                </p>
              </div>
              <Button onClick={() => router.push("/pro/crm/campaigns/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Campaign
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns, tags, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
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

          {/* Campaign Templates */}
          <Tabs defaultValue="templates" className="flex-1">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="templates">Pre-built Templates</TabsTrigger>
              <TabsTrigger value="custom">My Custom Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-6">
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map(renderTemplateCard)}
                </div>
              ) : (
                <Card className="border-border">
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2 header-font">No campaigns found</h3>
                    <p className="text-muted-foreground body-font mb-4">
                      Try adjusting your search terms or category filter.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedCategory("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="custom" className="mt-6">
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 header-font">No custom campaigns yet</h3>
                  <p className="text-muted-foreground body-font mb-4">
                    Create your first custom campaign to target specific customer segments.
                  </p>
                  <Button onClick={() => router.push("/pro/crm/campaigns/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Campaign
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground body-font">Avg. Open Rate</p>
                <p className="text-xl font-bold header-font">72%</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground body-font">Total Customers</p>
                <p className="text-xl font-bold header-font">1,247</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-sm text-muted-foreground body-font">Campaigns Sent</p>
                <p className="text-xl font-bold header-font">23</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Mail className="h-8 w-8 text-chart-4 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground body-font">Emails Delivered</p>
                <p className="text-xl font-bold header-font">18,492</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Template Preview Modal */}
      {renderTemplatePreview()}
    </div>
  )
}
