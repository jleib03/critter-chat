"use client"
import { useState, useEffect } from "react"
import { Mail, Send, Eye, Save, ArrowLeft, Users, Target, Settings, CheckCircle, Plus, Trash2 } from "lucide-react"
import Header from "../../../../../../components/header"
import PasswordProtection from "../../../../../../components/password-protection"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import CustomerSelectionInterface from "../../../../../../components/customer-selection-interface"
import EmailPreview from "../../../../../../components/email-preview"
import {
  waitForCRMData,
  getInactiveCustomers,
  getCustomersByPetType,
  getRepeatCustomers,
} from "../../../../../../utils/crm-data"

type CampaignStep = "setup" | "sequence" | "audience" | "preview"

type EmailSequenceItem = {
  id: string
  subject: string
  content: string
  delayDays: number
  isActive: boolean
}

const templateConfigs: Record<string, any> = {
  "inactive-60": {
    name: "60-Day Inactive Customer Re-engagement",
    description: "Re-engage customers who haven't booked services in the last 60 days",
    audience: "inactive-60",
    emails: [
      {
        subject: "We miss you and [Pet Name]! Special offer inside",
        content: `Hi [Customer Name],

We noticed it's been a while since [Pet Name] visited us for their care. We miss seeing you both!

As one of our valued customers, we'd love to welcome you back with a special 20% discount on your next service.

[Pet Name] deserves the best care, and we're here to provide it. Whether it's grooming, health check-ups, or just some pampering, we're ready to help.

Book your appointment today and save 20%!`,
        delayDays: 0,
      },
      {
        subject: "Last chance: 20% off for [Pet Name]",
        content: `Hi [Customer Name],

This is a friendly reminder that your 20% discount for [Pet Name] expires soon!

We understand life gets busy, but [Pet Name]'s health and happiness are important. Our team is ready to provide the excellent care you've come to expect.

Don't let this opportunity slip away - book now and save!`,
        delayDays: 7,
      },
    ],
  },
  "exotic-pets": {
    name: "Exotic Pet Specialized Care Campaign",
    description: "Targeted campaigns for owners of birds, reptiles, and other exotic pets",
    audience: "exotic-pets",
    emails: [
      {
        subject: "Specialized care for your exotic companion",
        content: `Hi [Customer Name],

Caring for [Pet Name] requires specialized knowledge and expertise. As an exotic pet owner, you understand the unique needs of your companion.

Our team has extensive experience with exotic pets and we're here to provide the specialized care [Pet Name] deserves.

From nutrition advice to health check-ups, we offer comprehensive care tailored specifically for exotic pets.`,
        delayDays: 0,
      },
    ],
  },
  "second-time": {
    name: "Second-Time Client Welcome Back",
    description: "Welcome back campaigns for customers returning after their first visit",
    audience: "repeat-customers",
    emails: [
      {
        subject: "Welcome back! Here's what's new for [Pet Name]",
        content: `Hi [Customer Name],

Welcome back! We're so happy to see you and [Pet Name] again.

Since your last visit, we've added some exciting new services that [Pet Name] might enjoy. We'd love to tell you about our new wellness packages and preventive care options.

As a returning customer, you're eligible for our loyalty program benefits. Let us show you how we can make [Pet Name]'s care even better!`,
        delayDays: 0,
      },
    ],
  },
  "new-customers": {
    name: "New Customer Welcome Series",
    description: "Onboarding sequence for first-time customers",
    audience: "new-customers",
    emails: [
      {
        subject: "Welcome to our pet family, [Customer Name]!",
        content: `Hi [Customer Name],

Welcome to our pet care family! We're thrilled that you've chosen us to care for [Pet Name].

Here's what you can expect from us:
- Personalized care plans for [Pet Name]
- Regular health updates and reminders
- Access to our 24/7 support line
- Exclusive member discounts and offers

We're here to make sure [Pet Name] gets the best possible care. If you have any questions, don't hesitate to reach out!`,
        delayDays: 0,
      },
      {
        subject: "How was [Pet Name]'s first visit?",
        content: `Hi [Customer Name],

We hope [Pet Name] enjoyed their first visit with us! We'd love to hear about your experience.

Your feedback helps us provide even better care for [Pet Name] and all our furry, feathered, and scaled friends.

Would you mind taking a moment to share your thoughts? As a thank you, we'll send you a 10% discount for your next visit.`,
        delayDays: 3,
      },
    ],
  },
  "holiday-grooming": {
    name: "Holiday Grooming Special",
    description: "Seasonal campaign for holiday pet grooming services",
    audience: "all",
    emails: [
      {
        subject: "Get [Pet Name] holiday-ready with our special packages",
        content: `Hi [Customer Name],

The holidays are coming, and we want [Pet Name] to look their absolute best for all those family photos!

Our holiday grooming packages include:
- Full grooming and styling
- Nail trimming and ear cleaning
- Holiday-themed accessories (optional)
- Special holiday scents

Book now for the holiday season - appointments fill up quickly during this busy time!`,
        delayDays: 0,
      },
    ],
  },
  "birthday-pets": {
    name: "Pet Birthday Celebration",
    description: "Personalized birthday wishes and special offers for pets",
    audience: "all",
    emails: [
      {
        subject: "Happy Birthday [Pet Name]! 🎉",
        content: `Hi [Customer Name],

It's [Pet Name]'s special day! Happy Birthday to your wonderful companion!

To celebrate, we'd like to offer [Pet Name] a special birthday treat:
- Complimentary birthday grooming session
- Special birthday photo session
- A birthday treat bag to take home

Because every pet deserves to feel special on their birthday. Book [Pet Name]'s birthday celebration today!`,
        delayDays: 0,
      },
    ],
  },
}

export default function TemplateCampaignSetup() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentStep, setCurrentStep] = useState<CampaignStep>("setup")
  const params = useParams()
  const templateId = params.templateId as string
  const template = templateConfigs[templateId]

  const [campaignData, setCampaignData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    type: "drip",
    bookingUrl: "",
    ctaText: "Book Now",
    ctaColor: "#E75837",
    audience: template?.audience || "all",
    customAudience: "",
    personalizeSubject: true,
    trackOpens: true,
    trackClicks: true,
  })

  const [emailSequence, setEmailSequence] = useState<EmailSequenceItem[]>([])
  const [crmData, setCrmData] = useState<any>(null)
  const [crmLoading, setCrmLoading] = useState(true)
  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const loadCRMData = async () => {
      setCrmLoading(true)
      console.log("[v0] Template page: Starting CRM data load")

      const data = await waitForCRMData(10, 500)
      console.log("[v0] Template page: CRM data loaded:", !!data)

      setCrmData(data)
      setCrmLoading(false)
      console.log("[v0] Template page: CRM data set, loading complete")

      if (data && template?.audience) {
        let initialCustomers: any[] = []

        switch (template.audience) {
          case "inactive-60":
            initialCustomers = getInactiveCustomers(data, 60)
            break
          case "new-customers":
            const customerBookingCounts = new Map()
            data.bookings.forEach((booking: any) => {
              const count = customerBookingCounts.get(booking.customer_email) || 0
              customerBookingCounts.set(booking.customer_email, count + 1)
            })
            initialCustomers = Array.from(customerBookingCounts.entries())
              .filter(([email, count]) => count <= 1)
              .map(([email]) => data.bookings.find((b: any) => b.customer_email === email))
              .filter(Boolean)
            break
          case "repeat-customers":
            initialCustomers = getRepeatCustomers(data)
            break
          case "exotic-pets":
            initialCustomers = getCustomersByPetType(data, "exotic")
            break
          case "dog-owners":
            initialCustomers = getCustomersByPetType(data, "dog")
            break
          case "cat-owners":
            initialCustomers = getCustomersByPetType(data, "cat")
            break
          default:
            const uniqueEmails = new Set(data.bookings.map((b: any) => b.customer_email))
            initialCustomers = Array.from(uniqueEmails)
              .map((email) => data.bookings.find((b: any) => b.customer_email === email))
              .filter(Boolean)
        }

        setSelectedCustomers(initialCustomers)
      }

      if (template?.emails) {
        const templateEmails = template.emails.map((email: any, index: number) => ({
          id: (index + 1).toString(),
          subject: email.subject,
          content: email.content,
          delayDays: email.delayDays,
          isActive: true,
        }))
        setEmailSequence(templateEmails)
      }
    }

    loadCRMData()
  }, [template])

  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onAuthenticated={() => setIsAuthenticated(true)}
        title="Campaign Builder Access"
        description="Enter your professional password to create email campaigns."
      />
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="pt-8 flex-1 flex flex-col">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Template Not Found</h1>
            <p className="text-muted-foreground mb-6">The requested campaign template could not be found.</p>
            <Button onClick={() => router.push("/pro/crm/campaigns")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const addEmailToSequence = () => {
    const newEmail: EmailSequenceItem = {
      id: Date.now().toString(),
      subject: "",
      content: "",
      delayDays: emailSequence.length > 0 ? emailSequence[emailSequence.length - 1].delayDays + 3 : 0,
      isActive: true,
    }
    setEmailSequence([...emailSequence, newEmail])
  }

  const removeEmailFromSequence = (id: string) => {
    setEmailSequence(emailSequence.filter((email) => email.id !== id))
  }

  const updateEmailInSequence = (id: string, updates: Partial<EmailSequenceItem>) => {
    setEmailSequence(emailSequence.map((email) => (email.id === id ? { ...email, ...updates } : email)))
  }

  const getAudienceCount = () => {
    if (!crmData) return 0

    switch (campaignData.audience) {
      case "all":
        return crmData.bookings.length > 0 ? new Set(crmData.bookings.map((b: any) => b.customer_email)).size : 0
      case "inactive-60":
        return getInactiveCustomers(crmData, 60).length
      case "new-customers":
        const customerBookingCounts = new Map()
        crmData.bookings.forEach((booking: any) => {
          const count = customerBookingCounts.get(booking.customer_email) || 0
          customerBookingCounts.set(booking.customer_email, count + 1)
        })
        return Array.from(customerBookingCounts.entries()).filter(([email, count]) => count <= 1).length
      case "repeat-customers":
        return getRepeatCustomers(crmData).length
      case "dog-owners":
        return getCustomersByPetType(crmData, "dog").length
      case "cat-owners":
        return getCustomersByPetType(crmData, "cat").length
      case "exotic-pets":
        return getCustomersByPetType(crmData, "exotic").length
      default:
        return 0
    }
  }

  const renderStepIndicator = () => {
    const steps = [
      { id: "setup", label: "Campaign Setup", icon: Settings },
      { id: "sequence", label: "Email Sequence", icon: Mail },
      { id: "audience", label: "Select Audience", icon: Users },
      { id: "preview", label: "Preview & Launch", icon: Eye },
    ]

    return (
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = steps.findIndex((s) => s.id === currentStep) > index

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                <StepIcon className="h-5 w-5" />
              </div>
              <span
                className={`ml-2 text-sm whitespace-nowrap ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderSetupStep = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="header-font">Template Campaign Setup</CardTitle>
          <CardDescription className="body-font">Customize this pre-built template for your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription className="body-font">
              This template is pre-configured with proven email sequences and targeting. You can customize any aspect to
              fit your needs.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="campaignName" className="body-font">
              Campaign Name *
            </Label>
            <Input
              id="campaignName"
              value={campaignData.name}
              onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
              placeholder="e.g., New Customer Welcome Series"
            />
          </div>

          <div>
            <Label htmlFor="description" className="body-font">
              Campaign Description
            </Label>
            <Textarea
              id="description"
              value={campaignData.description}
              onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
              placeholder="Describe the purpose and goals of this campaign"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="bookingUrl" className="body-font">
              Booking Page URL *
            </Label>
            <Input
              id="bookingUrl"
              value={campaignData.bookingUrl}
              onChange={(e) => setCampaignData({ ...campaignData, bookingUrl: e.target.value })}
              placeholder="https://booking.critter.pet/your-business"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ctaText" className="body-font">
                Call-to-Action Text
              </Label>
              <Input
                id="ctaText"
                value={campaignData.ctaText}
                onChange={(e) => setCampaignData({ ...campaignData, ctaText: e.target.value })}
                placeholder="Book Now"
              />
            </div>
            <div>
              <Label htmlFor="ctaColor" className="body-font">
                Button Color
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="ctaColor"
                  type="color"
                  value={campaignData.ctaColor}
                  onChange={(e) => setCampaignData({ ...campaignData, ctaColor: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={campaignData.ctaColor}
                  onChange={(e) => setCampaignData({ ...campaignData, ctaColor: e.target.value })}
                  placeholder="#E75837"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/pro/crm/campaigns")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <Button onClick={() => setCurrentStep("sequence")} disabled={!campaignData.name || !campaignData.bookingUrl}>
          Next: Review Email Sequence
        </Button>
      </div>
    </div>
  )

  const renderSequenceStep = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="header-font">Pre-built Email Sequence</CardTitle>
              <CardDescription className="body-font">
                Review and customize the template's email sequence
              </CardDescription>
            </div>
            <Button onClick={addEmailToSequence} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Email
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {emailSequence.map((email, index) => (
            <Card key={email.id} className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium header-font">Email {index + 1}</h4>
                      <p className="text-sm text-muted-foreground body-font">
                        {email.delayDays === 0
                          ? "Sent immediately"
                          : `Sent ${email.delayDays} days after previous email`}
                      </p>
                    </div>
                  </div>
                  {emailSequence.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeEmailFromSequence(email.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {index > 0 && (
                  <div>
                    <Label className="body-font">Delay (days after previous email)</Label>
                    <Input
                      type="number"
                      value={email.delayDays}
                      onChange={(e) =>
                        updateEmailInSequence(email.id, { delayDays: Number.parseInt(e.target.value) || 0 })
                      }
                      min="0"
                      max="365"
                    />
                  </div>
                )}

                <div>
                  <Label className="body-font">Subject Line *</Label>
                  <Input
                    value={email.subject}
                    onChange={(e) => updateEmailInSequence(email.id, { subject: e.target.value })}
                    placeholder="e.g., Welcome to our pet family, [Customer Name]!"
                  />
                  <p className="text-xs text-muted-foreground mt-1 body-font">
                    Use [Pet Name] and [Customer Name] for personalization
                  </p>
                </div>

                <div>
                  <Label className="body-font">Email Content *</Label>
                  <Textarea
                    value={email.content}
                    onChange={(e) => updateEmailInSequence(email.id, { content: e.target.value })}
                    placeholder="Write your email message here. Use [Pet Name] and [Customer Name] for personalization."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="body-font">Email Active</Label>
                  <Switch
                    checked={email.isActive}
                    onCheckedChange={(checked) => updateEmailInSequence(email.id, { isActive: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("setup")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep("audience")}
          disabled={emailSequence.some((email) => !email.subject || !email.content)}
        >
          Next: Confirm Audience
        </Button>
      </div>
    </div>
  )

  const renderAudienceStep = () => (
    <div className="max-w-6xl mx-auto">
      <Alert className="mb-6">
        <Users className="h-4 w-4" />
        <AlertDescription className="body-font">
          This template is optimized for the <strong>{campaignData.audience.replace("-", " ")}</strong> audience
          segment. {selectedCustomers.length} customers match this criteria.
        </AlertDescription>
      </Alert>

      <CustomerSelectionInterface
        crmData={crmData}
        crmLoading={crmLoading}
        selectedAudience={campaignData.audience}
        onAudienceChange={(audience) => {
          setCampaignData({ ...campaignData, audience })
          if (crmData) {
            let newCustomers: any[] = []

            switch (audience) {
              case "inactive-60":
                newCustomers = getInactiveCustomers(crmData, 60)
                break
              case "new-customers":
                const customerBookingCounts = new Map()
                crmData.bookings.forEach((booking: any) => {
                  const count = customerBookingCounts.get(booking.customer_email) || 0
                  customerBookingCounts.set(booking.customer_email, count + 1)
                })
                newCustomers = Array.from(customerBookingCounts.entries())
                  .filter(([email, count]) => count <= 1)
                  .map(([email]) => crmData.bookings.find((b: any) => b.customer_email === email))
                  .filter(Boolean)
                break
              case "repeat-customers":
                newCustomers = getRepeatCustomers(crmData)
                break
              case "exotic-pets":
                newCustomers = getCustomersByPetType(crmData, "exotic")
                break
              case "dog-owners":
                newCustomers = getCustomersByPetType(crmData, "dog")
                break
              case "cat-owners":
                newCustomers = getCustomersByPetType(crmData, "cat")
                break
              default:
                const uniqueEmails = new Set(crmData.bookings.map((b: any) => b.customer_email))
                newCustomers = Array.from(uniqueEmails)
                  .map((email) => crmData.bookings.find((b: any) => b.customer_email === email))
                  .filter(Boolean)
            }

            setSelectedCustomers(newCustomers)
          }
        }}
        onCustomersSelected={setSelectedCustomers}
        personalizeSubject={campaignData.personalizeSubject}
        onPersonalizeChange={(personalize) => setCampaignData({ ...campaignData, personalizeSubject: personalize })}
        trackOpens={campaignData.trackOpens}
        onTrackOpensChange={(track) => setCampaignData({ ...campaignData, trackOpens: track })}
        trackClicks={campaignData.trackClicks}
        onTrackClicksChange={(track) => setCampaignData({ ...campaignData, trackClicks: track })}
      />

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setCurrentStep("sequence")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => setCurrentStep("preview")} disabled={selectedCustomers.length === 0}>
          Next: Preview Campaign ({selectedCustomers.length} recipients)
        </Button>
      </div>
    </div>
  )

  const renderPreviewStep = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="header-font">Template Campaign Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 header-font">Campaign Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="body-font">Name:</span>
                  <span className="font-medium">{campaignData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-font">Template:</span>
                  <Badge variant="secondary">{templateId}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="body-font">Active Emails:</span>
                  <span className="font-medium">{emailSequence.filter((e) => e.isActive).length}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 header-font">Audience</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="body-font">Recipients:</span>
                  <span className="font-medium">{selectedCustomers.length} customers</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-font">Segment:</span>
                  <span className="font-medium capitalize">{campaignData.audience.replace("-", " ")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <EmailPreview
            emailSequence={emailSequence}
            campaignData={campaignData}
            sampleCustomer={selectedCustomers[0]}
          />
        </div>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="body-font">
          <strong>Ready to launch!</strong> Your customized template campaign will be activated and start sending emails
          according to your sequence settings.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("audience")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="space-x-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => router.push("/pro/crm/campaigns")}>
            <Send className="h-4 w-4 mr-2" />
            Launch Campaign
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-4 flex flex-col page-content">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl title-font mb-2 text-foreground">Setup Template Campaign</h1>
            <p className="text-lg text-muted-foreground body-font">
              Customize the "{template.name}" template for your business
            </p>
          </div>

          {renderStepIndicator()}

          <div className="flex-1">
            {currentStep === "setup" && renderSetupStep()}
            {currentStep === "sequence" && renderSequenceStep()}
            {currentStep === "audience" && renderAudienceStep()}
            {currentStep === "preview" && renderPreviewStep()}
          </div>
        </div>
      </main>
    </div>
  )
}
