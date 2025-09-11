"use client"
import { useState, useEffect } from "react"
import { Mail, Send, Eye, Save, ArrowLeft, Users, Settings, CheckCircle, Plus, Trash2 } from "lucide-react"
import Header from "../../../../../components/header"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import CustomerSelectionInterface from "../../../../../components/customer-selection-interface"
import EmailPreview from "../../../../../components/email-preview"
import {
  waitForCRMData,
  getInactiveCustomers,
  getCustomersByPetType,
  getRepeatCustomers,
} from "../../../../../utils/crm-data"

type CampaignStep = "setup" | "sequence" | "audience" | "preview"

type EmailSequenceItem = {
  id: string
  subject: string
  content: string
  delayDays: number
  isActive: boolean
}

export default function CreateCampaign() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentStep, setCurrentStep] = useState<CampaignStep>("setup")
  const [campaignData, setCampaignData] = useState({
    name: "",
    description: "",
    type: "drip", // drip, broadcast, automated
    bookingUrl: "",
    ctaText: "Book Now",
    ctaColor: "#E75837",
    audience: "all",
    customAudience: "",
    personalizeSubject: true,
    trackOpens: true,
    trackClicks: true,
  })

  const [emailSequence, setEmailSequence] = useState<EmailSequenceItem[]>([
    {
      id: "1",
      subject: "",
      content: "",
      delayDays: 0,
      isActive: true,
    },
  ])

  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([])
  const [crmData, setCrmData] = useState<any>(null)
  const [crmLoading, setCrmLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadCRMData = async () => {
      setCrmLoading(true)
      console.log("[v0] Campaign page: Starting CRM data load")

      const data = await waitForCRMData(10, 500)
      console.log("[v0] Campaign page: CRM data loaded:", !!data)

      setCrmData(data)
      setCrmLoading(false)
      console.log("[v0] Campaign page: CRM data set, loading complete")
    }

    loadCRMData()
  }, [])

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
          <CardTitle className="header-font">Campaign Setup</CardTitle>
          <CardDescription className="body-font">Configure the basic settings for your email campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <Label htmlFor="campaignType" className="body-font">
              Campaign Type *
            </Label>
            <Select
              value={campaignData.type}
              onValueChange={(value) => setCampaignData({ ...campaignData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drip">Drip Campaign (Automated sequence)</SelectItem>
                <SelectItem value="broadcast">Broadcast (Single email)</SelectItem>
                <SelectItem value="automated">Automated (Trigger-based)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1 body-font">
              {campaignData.type === "drip" && "Send a series of emails over time"}
              {campaignData.type === "broadcast" && "Send one email to all recipients immediately"}
              {campaignData.type === "automated" && "Trigger emails based on customer actions"}
            </p>
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
          Next: Create Email Sequence
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
              <CardTitle className="header-font">Email Sequence</CardTitle>
              <CardDescription className="body-font">
                {campaignData.type === "broadcast"
                  ? "Create your email message"
                  : "Build your email sequence with multiple messages"}
              </CardDescription>
            </div>
            {campaignData.type !== "broadcast" && (
              <Button onClick={addEmailToSequence} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Email
              </Button>
            )}
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
                      <h4 className="font-medium header-font">
                        {campaignData.type === "broadcast" ? "Email Message" : `Email ${index + 1}`}
                      </h4>
                      {campaignData.type !== "broadcast" && (
                        <p className="text-sm text-muted-foreground body-font">
                          {email.delayDays === 0
                            ? "Sent immediately"
                            : `Sent ${email.delayDays} days after previous email`}
                        </p>
                      )}
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
                {campaignData.type !== "broadcast" && index > 0 && (
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
          Next: Select Audience
        </Button>
      </div>
    </div>
  )

  const renderAudienceStep = () => (
    <div className="max-w-6xl mx-auto">
      <CustomerSelectionInterface
        crmData={crmData}
        crmLoading={crmLoading}
        selectedAudience={campaignData.audience}
        onAudienceChange={(audience) => setCampaignData({ ...campaignData, audience })}
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
        <Button onClick={() => setCurrentStep("preview")}>Next: Preview Campaign</Button>
      </div>
    </div>
  )

  const renderPreviewStep = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="header-font">Campaign Summary</CardTitle>
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
                  <span className="body-font">Type:</span>
                  <Badge variant="secondary" className="capitalize">
                    {campaignData.type}
                  </Badge>
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
          <strong>Ready to launch!</strong> Your campaign will be activated and start sending emails according to your
          sequence settings.
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
            <h1 className="text-3xl md:text-4xl title-font mb-2 text-foreground">Create Email Campaign</h1>
            <p className="text-lg text-muted-foreground body-font">
              Build targeted email sequences to engage your customers
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
