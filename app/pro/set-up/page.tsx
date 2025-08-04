"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, AlertCircle, ExternalLink, Copy, Settings, MessageSquare } from "lucide-react"

// Updated webhook URLs
const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook-test/a306584e-8637-4284-8a41-ecd5d24dc255" // For get-url action
const CUSTOM_URL_WEBHOOK = "https://jleib03.app.n8n.cloud/webhook-test/4ae0fb3d-17dc-482f-be27-1c7ab5c31b16" // For create-url action

export default function ProfessionalSetupPage() {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [professionalId, setProfessionalId] = useState("")
  const [customUrl, setCustomUrl] = useState("")
  const [generatedUrl, setGeneratedUrl] = useState("")
  const [error, setError] = useState("")

  // Step 1: Get Professional ID
  const handleGetProfessionalId = async () => {
    if (!professionalId.trim()) {
      setError("Please enter your Professional ID")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get-url",
          professional_id: professionalId.trim(),
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("Professional ID verification response:", data)

      toast({
        title: "✅ Professional ID Verified",
        description: "Your Professional ID has been verified successfully.",
        duration: 3000,
      })

      setStep(2)
    } catch (err) {
      console.error("Error verifying Professional ID:", err)
      setError("Failed to verify Professional ID. Please check your ID and try again.")
      toast({
        title: "❌ Verification Failed",
        description: "Could not verify your Professional ID. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Create Custom URL
  const handleCreateCustomUrl = async () => {
    if (!customUrl.trim()) {
      setError("Please enter a custom URL")
      return
    }

    // Basic URL validation
    const urlPattern = /^[a-zA-Z0-9-_]+$/
    if (!urlPattern.test(customUrl.trim())) {
      setError("Custom URL can only contain letters, numbers, hyphens, and underscores")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(CUSTOM_URL_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create-url",
          professional_id: professionalId.trim(),
          custom_url: customUrl.trim(),
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("Custom URL creation response:", data)

      const fullUrl = `https://critter-pet-services.vercel.app/${customUrl.trim()}`
      setGeneratedUrl(fullUrl)

      toast({
        title: "🎉 Custom URL Created!",
        description: `Your booking page is now live at ${customUrl.trim()}`,
        duration: 5000,
      })

      setStep(3)
    } catch (err) {
      console.error("Error creating custom URL:", err)
      setError("Failed to create custom URL. It may already be taken or there was a server error.")
      toast({
        title: "❌ URL Creation Failed",
        description: "Could not create your custom URL. Please try a different one.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "📋 Copied!",
        description: "URL copied to clipboard",
        duration: 2000,
      })
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const resetForm = () => {
    setStep(1)
    setProfessionalId("")
    setCustomUrl("")
    setGeneratedUrl("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#E75837] mb-2 header-font">Critter Landing Page Set-Up</h1>
            <p className="text-gray-600 body-font">Create your custom booking page in just a few steps</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNumber
                      ? "bg-[#E75837] text-white"
                      : step === stepNumber
                        ? "bg-[#E75837] text-white animate-pulse"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-20 h-1 mx-4 ${step > stepNumber ? "bg-[#E75837]" : "bg-gray-200"} transition-colors duration-300`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 header-font">
              {step === 1 && "Step 1: Verify Professional ID"}
              {step === 2 && "Step 2: Create Custom URL"}
              {step === 3 && "Step 3: Your Booking Page is Ready!"}
            </h2>
            <p className="text-gray-600 body-font mt-2">
              {step === 1 && "Enter your Professional ID to get started"}
              {step === 2 && "Choose a custom URL for your booking page"}
              {step === 3 && "Share your new booking page with customers"}
            </p>
          </div>

          {/* Step 1: Professional ID */}
          {step === 1 && (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="professionalId" className="body-font font-medium">
                    Professional ID
                  </Label>
                  <Input
                    id="professionalId"
                    value={professionalId}
                    onChange={(e) => setProfessionalId(e.target.value)}
                    placeholder="Enter your Professional ID"
                    className="mt-1"
                    onKeyPress={(e) => e.key === "Enter" && handleGetProfessionalId()}
                  />
                  <p className="text-sm text-gray-500 mt-1 body-font">
                    This is the ID provided when you signed up for Critter
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleGetProfessionalId}
                  disabled={loading || !professionalId.trim()}
                  className="w-full bg-[#E75837] hover:bg-[#d14a2a] text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Professional ID"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Custom URL */}
          {step === 2 && (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="customUrl" className="body-font font-medium">
                    Custom URL
                  </Label>
                  <div className="mt-1 flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm body-font">
                      critter-pet-services.vercel.app/
                    </span>
                    <Input
                      id="customUrl"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                      placeholder="your-business-name"
                      className="rounded-l-none"
                      onKeyPress={(e) => e.key === "Enter" && handleCreateCustomUrl()}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1 body-font">
                    Choose a memorable URL for your customers (letters, numbers, hyphens, and underscores only)
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1" disabled={loading}>
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateCustomUrl}
                    disabled={loading || !customUrl.trim()}
                    className="flex-1 bg-[#E75837] hover:bg-[#d14a2a] text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create URL"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 header-font">🎉 Your Booking Page is Live!</h3>
                  <p className="text-gray-600 body-font">
                    Your custom booking page has been created successfully. Share this URL with your customers to start
                    receiving bookings.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-left">
                        <p className="text-sm text-gray-500 body-font">Your Booking Page URL:</p>
                        <p className="font-mono text-sm text-gray-900 break-all">{generatedUrl}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => copyToClipboard(generatedUrl)}
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => window.open(generatedUrl, "_blank")}
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg header-font">
                      <Settings className="w-5 h-5 text-[#E75837]" />
                      Configure Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 body-font mb-4">
                      Set up your availability, team members, and booking preferences.
                    </p>
                    <Button
                      onClick={() => window.open(`/schedule/set-up/${professionalId}`, "_blank")}
                      className="w-full bg-[#E75837] hover:bg-[#d14a2a] text-white"
                    >
                      Schedule Set-Up
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg header-font">
                      <MessageSquare className="w-5 h-5 text-[#E75837]" />
                      Custom Support Agent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 body-font mb-4">
                      Create an AI-powered support agent for your customers.
                    </p>
                    <Button
                      onClick={() => window.open("/pro/custom-agent", "_blank")}
                      variant="outline"
                      className="w-full"
                    >
                      Set Up Agent
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <Button onClick={resetForm} variant="outline" className="px-8 bg-transparent">
                  Create Another URL
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
