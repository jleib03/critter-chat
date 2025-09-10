"use client"
import { useState } from "react"
import { Mail, Send, Eye, Save, ArrowLeft, ImageIcon, Link, Type } from "lucide-react"
import Header from "../../../../../components/header"
import PasswordProtection from "../../../../../components/password-protection"
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

type CampaignStep = "setup" | "design" | "audience" | "review" | "send"

export default function EmailCampaignComposer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentStep, setCurrentStep] = useState<CampaignStep>("setup")
  const [campaignData, setCampaignData] = useState({
    name: "",
    subject: "",
    preheader: "",
    template: "welcome",
    audience: "all",
    customAudience: "",
    bookingUrl: "",
    ctaText: "Book Now",
    ctaColor: "#E75837",
    personalizeSubject: true,
    trackOpens: true,
    trackClicks: true,
  })
  const [emailContent, setEmailContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(0)
  const router = useRouter()

  // If not authenticated, show password protection
  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onAuthenticated={() => setIsAuthenticated(true)}
        title="Email Campaign Access"
        description="Enter your professional password to access email campaign tools."
      />
    )
  }

  const handleSendCampaign = () => {
    setIsSending(true)
    setSendProgress(0)

    const interval = setInterval(() => {
      setSendProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsSending(false)
          router.push("/pro/crm/email/analytics")
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const renderStepIndicator = () => {
    const steps = [
      { id: "setup", label: "Campaign Setup" },
      { id: "design", label: "Design Email" },
      { id: "audience", label: "Select Audience" },
      { id: "review", label: "Review & Test" },
      { id: "send", label: "Send Campaign" },
    ]

    return (
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : steps.findIndex((s) => s.id === currentStep) > index
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`ml-2 text-sm whitespace-nowrap ${
                currentStep === step.id ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-4 ${
                  steps.findIndex((s) => s.id === currentStep) > index ? "bg-green-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderSetupStep = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="header-font">Campaign Details</CardTitle>
          <CardDescription className="body-font">Set up the basic information for your email campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="campaignName" className="body-font">
              Campaign Name *
            </Label>
            <Input
              id="campaignName"
              value={campaignData.name}
              onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
              placeholder="e.g., Holiday Grooming Special 2024"
            />
          </div>

          <div>
            <Label htmlFor="subject" className="body-font">
              Email Subject Line *
            </Label>
            <Input
              id="subject"
              value={campaignData.subject}
              onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
              placeholder="e.g., Special holiday grooming for [Pet Name]"
            />
            <p className="text-xs text-muted-foreground mt-1 body-font">
              Use [Pet Name] and [Customer Name] for personalization
            </p>
          </div>

          <div>
            <Label htmlFor="preheader" className="body-font">
              Preheader Text
            </Label>
            <Input
              id="preheader"
              value={campaignData.preheader}
              onChange={(e) => setCampaignData({ ...campaignData, preheader: e.target.value })}
              placeholder="Preview text that appears after the subject line"
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
            <p className="text-xs text-muted-foreground mt-1 body-font">
              Where customers will be directed when they click your call-to-action
            </p>
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
        <Button variant="outline" onClick={() => router.push("/pro/crm")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to CRM
        </Button>
        <Button
          onClick={() => setCurrentStep("design")}
          disabled={!campaignData.name || !campaignData.subject || !campaignData.bookingUrl}
        >
          Next: Design Email
        </Button>
      </div>
    </div>
  )

  const renderDesignStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Email Editor */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="header-font">Email Content</CardTitle>
            <CardDescription className="body-font">Design your email message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template" className="body-font">
                Email Template
              </Label>
              <Select
                value={campaignData.template}
                onValueChange={(value) => setCampaignData({ ...campaignData, template: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome Template</SelectItem>
                  <SelectItem value="promotion">Promotional Template</SelectItem>
                  <SelectItem value="reminder">Reminder Template</SelectItem>
                  <SelectItem value="newsletter">Newsletter Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="emailContent" className="body-font">
                Email Message
              </Label>
              <Textarea
                id="emailContent"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Write your email message here. Use [Pet Name] and [Customer Name] for personalization."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              <Button variant="outline" size="sm">
                <Link className="h-4 w-4 mr-2" />
                Add Link
              </Button>
              <Button variant="outline" size="sm">
                <Type className="h-4 w-4 mr-2" />
                Format Text
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Preview */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="header-font">Email Preview</CardTitle>
            <CardDescription className="body-font">How your email will look to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="bg-white rounded border p-4">
                <div className="text-xs text-gray-500 mb-2 body-font">From: Your Business Name</div>
                <div className="font-bold text-lg mb-1 header-font">{campaignData.subject || "Your Subject Line"}</div>
                {campaignData.preheader && (
                  <div className="text-sm text-gray-600 mb-4 body-font">{campaignData.preheader}</div>
                )}

                <div className="space-y-4">
                  <div className="body-font">{emailContent || "Your email content will appear here..."}</div>

                  <div className="text-center">
                    <Button style={{ backgroundColor: campaignData.ctaColor }} className="text-white">
                      {campaignData.ctaText || "Book Now"}
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 border-t pt-2 body-font">
                    This email was sent to [customer@email.com].
                    <a href="#" className="underline">
                      Unsubscribe
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setCurrentStep("setup")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="space-x-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => setCurrentStep("audience")}>Next: Select Audience</Button>
        </div>
      </div>
    </div>
  )

  const renderAudienceStep = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="header-font">Select Your Audience</CardTitle>
          <CardDescription className="body-font">Choose who will receive this email campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="body-font">Target Audience</Label>
            <Select
              value={campaignData.audience}
              onValueChange={(value) => setCampaignData({ ...campaignData, audience: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers (1,247 people)</SelectItem>
                <SelectItem value="inactive-60">Inactive 60+ Days (247 people)</SelectItem>
                <SelectItem value="new-customers">New Customers (156 people)</SelectItem>
                <SelectItem value="repeat-customers">Repeat Customers (891 people)</SelectItem>
                <SelectItem value="dog-owners">Dog Owners (892 people)</SelectItem>
                <SelectItem value="cat-owners">Cat Owners (445 people)</SelectItem>
                <SelectItem value="exotic-pets">Exotic Pet Owners (89 people)</SelectItem>
                <SelectItem value="custom">Custom Segment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {campaignData.audience === "custom" && (
            <div>
              <Label htmlFor="customAudience" className="body-font">
                Custom Audience Criteria
              </Label>
              <Textarea
                id="customAudience"
                value={campaignData.customAudience}
                onChange={(e) => setCampaignData({ ...campaignData, customAudience: e.target.value })}
                placeholder="Describe your custom audience criteria..."
                rows={3}
              />
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2 header-font">Audience Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="body-font">Estimated Recipients:</span>
                <span className="font-medium">
                  {campaignData.audience === "all"
                    ? "1,247"
                    : campaignData.audience === "inactive-60"
                      ? "247"
                      : campaignData.audience === "new-customers"
                        ? "156"
                        : campaignData.audience === "repeat-customers"
                          ? "891"
                          : campaignData.audience === "dog-owners"
                            ? "892"
                            : campaignData.audience === "cat-owners"
                              ? "445"
                              : campaignData.audience === "exotic-pets"
                                ? "89"
                                : "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="body-font">Expected Open Rate:</span>
                <span className="font-medium">68%</span>
              </div>
              <div className="flex justify-between">
                <span className="body-font">Expected Clicks:</span>
                <span className="font-medium">24%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="personalizeSubject" className="body-font">
                Personalize Subject Lines
              </Label>
              <Switch
                id="personalizeSubject"
                checked={campaignData.personalizeSubject}
                onCheckedChange={(checked) => setCampaignData({ ...campaignData, personalizeSubject: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="trackOpens" className="body-font">
                Track Email Opens
              </Label>
              <Switch
                id="trackOpens"
                checked={campaignData.trackOpens}
                onCheckedChange={(checked) => setCampaignData({ ...campaignData, trackOpens: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="trackClicks" className="body-font">
                Track Link Clicks
              </Label>
              <Switch
                id="trackClicks"
                checked={campaignData.trackClicks}
                onCheckedChange={(checked) => setCampaignData({ ...campaignData, trackClicks: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("design")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => setCurrentStep("review")}>Next: Review Campaign</Button>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="header-font">Campaign Review</CardTitle>
          <CardDescription className="body-font">Review all details before sending your campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 header-font">Campaign Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="body-font">Name:</span>
                    <span className="font-medium">{campaignData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="body-font">Subject:</span>
                    <span className="font-medium">{campaignData.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="body-font">Template:</span>
                    <span className="font-medium capitalize">{campaignData.template}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 header-font">Audience & Settings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="body-font">Recipients:</span>
                    <span className="font-medium">
                      {campaignData.audience === "all"
                        ? "1,247"
                        : campaignData.audience === "inactive-60"
                          ? "247"
                          : campaignData.audience === "new-customers"
                            ? "156"
                            : "891"}{" "}
                      customers
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="body-font">Personalization:</span>
                    <Badge variant={campaignData.personalizeSubject ? "default" : "secondary"}>
                      {campaignData.personalizeSubject ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="body-font">Tracking:</span>
                    <Badge variant="default">
                      {campaignData.trackOpens && campaignData.trackClicks ? "Full" : "Partial"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 header-font">Call-to-Action</h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="text-sm">
                  <span className="body-font">Button Text: </span>
                  <span className="font-medium">{campaignData.ctaText}</span>
                </div>
                <div className="text-sm">
                  <span className="body-font">Destination: </span>
                  <span className="font-medium text-xs break-all">{campaignData.bookingUrl}</span>
                </div>
                <Button style={{ backgroundColor: campaignData.ctaColor }} className="text-white w-full">
                  {campaignData.ctaText}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription className="body-font">
          <strong>Ready to send!</strong> Your campaign will be delivered immediately to all selected recipients. Make
          sure all details are correct before proceeding.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("audience")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="space-x-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Send Test Email
          </Button>
          <Button onClick={() => setCurrentStep("send")}>
            <Send className="h-4 w-4 mr-2" />
            Send Campaign
          </Button>
        </div>
      </div>
    </div>
  )

  const renderSendStep = () => (
    <div className="max-w-2xl mx-auto text-center">
      {!isSending ? (
        <div>
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2 header-font">Ready to Send Campaign</h2>
          <p className="text-muted-foreground body-font mb-6">
            Your email campaign "{campaignData.name}" is ready to be sent to your selected audience.
          </p>

          <div className="bg-muted/50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground body-font">Recipients</p>
                <p className="font-bold text-lg">1,247</p>
              </div>
              <div>
                <p className="text-muted-foreground body-font">Expected Opens</p>
                <p className="font-bold text-lg">848</p>
              </div>
            </div>
          </div>

          <Button onClick={handleSendCampaign} size="lg" className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Campaign Now
          </Button>
        </div>
      ) : (
        <div>
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-primary-foreground animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2 header-font">Sending Campaign</h2>
          <p className="text-muted-foreground body-font mb-6">
            Your email campaign is being delivered to your customers...
          </p>

          <div className="w-full bg-muted rounded-full h-3 mb-4">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${sendProgress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground body-font">{sendProgress}% complete</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-4 flex flex-col page-content">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl title-font mb-2 text-foreground">Email Campaign Composer</h1>
            <p className="text-lg text-muted-foreground body-font">
              Create and send targeted email campaigns to your customers
            </p>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          <div className="flex-1">
            {currentStep === "setup" && renderSetupStep()}
            {currentStep === "design" && renderDesignStep()}
            {currentStep === "audience" && renderAudienceStep()}
            {currentStep === "review" && renderReviewStep()}
            {currentStep === "send" && renderSendStep()}
          </div>
        </div>
      </main>
    </div>
  )
}
