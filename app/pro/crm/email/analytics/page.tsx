"use client"
import { useState } from "react"
import { Mail, ArrowLeft, Eye, MousePointer, Calendar } from "lucide-react"
import Header from "../../../../../components/header"
import PasswordProtection from "../../../../../components/password-protection"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function EmailAnalytics() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onAuthenticated={() => setIsAuthenticated(true)}
        title="Email Analytics Access"
        description="Enter your professional password to view campaign analytics."
      />
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-4 flex flex-col page-content">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.push("/pro/crm")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to CRM Hub
            </Button>
            <h1 className="text-3xl md:text-4xl title-font mb-2 text-foreground">Campaign Analytics</h1>
            <p className="text-lg text-muted-foreground body-font">Track the performance of your email campaigns</p>
          </div>

          {/* Success Message */}
          <Card className="border-green-200 bg-green-50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800 header-font">Campaign Sent Successfully!</h3>
                  <p className="text-green-700 body-font">Your email campaign has been delivered to 1,247 customers.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground body-font">Emails Sent</p>
                    <p className="text-2xl font-bold text-foreground header-font">1,247</p>
                  </div>
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground body-font">Opens</p>
                    <p className="text-2xl font-bold text-foreground header-font">848</p>
                    <p className="text-xs text-green-600 body-font">68% open rate</p>
                  </div>
                  <Eye className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground body-font">Clicks</p>
                    <p className="text-2xl font-bold text-foreground header-font">203</p>
                    <p className="text-xs text-blue-600 body-font">24% click rate</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground body-font">Bookings</p>
                    <p className="text-2xl font-bold text-foreground header-font">47</p>
                    <p className="text-xs text-purple-600 body-font">23% conversion</p>
                  </div>
                  <Calendar className="h-8 w-8 text-chart-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Campaigns */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="header-font">Recent Campaigns</CardTitle>
              <CardDescription className="body-font">
                Performance overview of your latest email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium header-font">Holiday Grooming Special</h4>
                    <p className="text-sm text-muted-foreground body-font">Sent today to 1,247 customers</p>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium">68%</p>
                      <p className="text-muted-foreground body-font">Opens</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">24%</p>
                      <p className="text-muted-foreground body-font">Clicks</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">47</p>
                      <p className="text-muted-foreground body-font">Bookings</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
