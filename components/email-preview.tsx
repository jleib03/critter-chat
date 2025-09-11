"use client"
import { useState } from "react"
import { Mail, Eye, Smartphone, Monitor, Tablet, Calendar, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EmailSequenceItem {
  id: string
  subject: string
  content: string
  delayDays: number
  isActive: boolean
}

interface Customer {
  email: string
  name?: string
  petName?: string
  petType?: string
}

interface EmailPreviewProps {
  emailSequence: EmailSequenceItem[]
  campaignData: {
    name: string
    ctaText: string
    ctaColor: string
    bookingUrl: string
    personalizeSubject: boolean
  }
  sampleCustomer?: Customer
}

export default function EmailPreview({ emailSequence, campaignData, sampleCustomer }: EmailPreviewProps) {
  const [selectedEmail, setSelectedEmail] = useState(0)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile" | "tablet">("desktop")

  const defaultCustomer: Customer = {
    email: "sarah.johnson@email.com",
    name: "Sarah Johnson",
    petName: "Buddy",
    petType: "Golden Retriever",
  }

  const customer = sampleCustomer || defaultCustomer

  const personalizeText = (text: string) => {
    return text
      .replace(/\[Customer Name\]/g, customer.name || customer.email.split("@")[0])
      .replace(/\[Pet Name\]/g, customer.petName || "your pet")
      .replace(/\[Pet Type\]/g, customer.petType || "pet")
  }

  const getDeviceStyles = () => {
    switch (previewDevice) {
      case "mobile":
        return "max-w-sm mx-auto"
      case "tablet":
        return "max-w-md mx-auto"
      default:
        return "max-w-2xl mx-auto"
    }
  }

  const activeEmails = emailSequence.filter((email) => email.isActive)

  if (activeEmails.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="p-8 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 header-font">No Active Emails</h3>
          <p className="text-muted-foreground body-font">Add at least one active email to see the preview.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="header-font">Email Preview</CardTitle>
              <CardDescription className="body-font">See how your emails will look to customers</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={previewDevice} onValueChange={(value: any) => setPreviewDevice(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">
                    <div className="flex items-center">
                      <Monitor className="h-4 w-4 mr-2" />
                      Desktop
                    </div>
                  </SelectItem>
                  <SelectItem value="tablet">
                    <div className="flex items-center">
                      <Tablet className="h-4 w-4 mr-2" />
                      Tablet
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Mobile
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedEmail.toString()} onValueChange={(value) => setSelectedEmail(Number.parseInt(value))}>
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeEmails.map((email, index) => (
                <TabsTrigger key={email.id} value={index.toString()} className="text-xs">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>Email {index + 1}</span>
                    {email.delayDays > 0 && (
                      <Badge variant="outline" className="text-xs ml-1">
                        Day {email.delayDays}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {activeEmails.map((email, index) => (
              <TabsContent key={email.id} value={index.toString()} className="mt-6">
                <div className={getDeviceStyles()}>
                  {/* Email Client Header */}
                  <div className="bg-gray-100 rounded-t-lg p-3 border-b">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium body-font">Your Business Name</p>
                          <p className="text-xs text-muted-foreground body-font">noreply@yourbusiness.com</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground body-font">
                        {email.delayDays === 0 ? "Today" : `Day ${email.delayDays}`}
                      </div>
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="bg-white rounded-b-lg border border-t-0 overflow-hidden">
                    {/* Subject Line */}
                    <div className="p-4 border-b bg-gray-50">
                      <h2 className="font-bold text-lg header-font">
                        {campaignData.personalizeSubject ? personalizeText(email.subject) : email.subject}
                      </h2>
                      <p className="text-sm text-muted-foreground body-font mt-1">To: {customer.email}</p>
                    </div>

                    {/* Email Body */}
                    <div className="p-6 space-y-4">
                      <div className="prose prose-sm max-w-none">
                        {personalizeText(email.content)
                          .split("\n")
                          .map((paragraph, pIndex) => (
                            <p key={pIndex} className="body-font mb-4 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                      </div>

                      {/* Call to Action */}
                      <div className="text-center py-6">
                        <Button
                          style={{ backgroundColor: campaignData.ctaColor }}
                          className="text-white px-8 py-3 text-lg"
                          size="lg"
                        >
                          {campaignData.ctaText}
                        </Button>
                      </div>

                      {/* Footer */}
                      <div className="border-t pt-4 text-xs text-muted-foreground body-font">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span>Your Business Name</span>
                            <span>•</span>
                            <span>123 Pet Street, City, State</span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span>This email was sent to {customer.email}</span>
                          <a href="#" className="underline hover:no-underline">
                            Unsubscribe
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Metadata */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium body-font">Send Time</p>
                      <p className="text-xs text-muted-foreground body-font">
                        {email.delayDays === 0 ? "Immediately" : `${email.delayDays} days after signup`}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                      <User className="h-6 w-6 text-secondary mx-auto mb-2" />
                      <p className="text-sm font-medium body-font">Sample Recipient</p>
                      <p className="text-xs text-muted-foreground body-font">
                        {customer.name} & {customer.petName}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                      <Eye className="h-6 w-6 text-accent mx-auto mb-2" />
                      <p className="text-sm font-medium body-font">Expected Opens</p>
                      <p className="text-xs text-muted-foreground body-font">68% open rate</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Sequence Timeline */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="header-font">Email Sequence Timeline</CardTitle>
          <CardDescription className="body-font">When each email will be sent to customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeEmails.map((email, index) => (
              <div key={email.id} className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium body-font">
                      {campaignData.personalizeSubject ? personalizeText(email.subject) : email.subject}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {email.delayDays === 0 ? "Day 0" : `Day ${email.delayDays}`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground body-font mt-1">
                    {email.delayDays === 0
                      ? "Sent immediately when customer joins campaign"
                      : `Sent ${email.delayDays} days after the previous email`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
