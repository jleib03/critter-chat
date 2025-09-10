"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Database, CheckCircle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function InitializeCRM() {
  const [professionalId, setProfessionalId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [initializationStatus, setInitializationStatus] = useState<"idle" | "success" | "error">("idle")
  const [rawData, setRawData] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [retryCount, setRetryCount] = useState(0)

  const handleInitialize = async (isRetry = false) => {
    if (!professionalId.trim()) {
      setErrorMessage("Please enter a valid Professional ID")
      return
    }

    setIsLoading(true)
    setInitializationStatus("idle")
    setErrorMessage("")

    try {
      console.log("[v0] Sending initialize_crm webhook for professional:", professionalId)

      const response = await fetch("https://jleib03.app.n8n.cloud/webhook-test/fc7f0236-5f3f-4a3c-b9cc-07d172b21956", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "initialize_crm",
          professional_id: professionalId.trim(),
        }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("CRM service is currently unavailable. The webhook endpoint may not be active yet.")
        } else if (response.status === 500) {
          throw new Error("Server error occurred. Please try again in a few moments.")
        } else if (response.status === 403) {
          throw new Error("Access denied. Please check your Professional ID.")
        } else {
          throw new Error(`Service error (${response.status}). Please try again or contact support.`)
        }
      }

      const data = await response.json()
      console.log("[v0] Received CRM data:", data)

      setRawData(data)
      setInitializationStatus("success")
      setRetryCount(0)

      // Store the data in localStorage for use across CRM components
      localStorage.setItem("crm_raw_data", JSON.stringify(data))
      localStorage.setItem("crm_professional_id", professionalId.trim())
    } catch (error) {
      console.error("[v0] CRM initialization error:", error)
      setInitializationStatus("error")

      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage("Failed to initialize CRM data. Please check your connection and try again.")
      }

      if (isRetry) {
        setRetryCount((prev) => prev + 1)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getDataSummary = () => {
    if (!rawData) return null

    return {
      customers: rawData.customers?.length || 0,
      bookings: rawData.bookings?.length || 0,
      pets: rawData.pets?.length || 0,
      lastBooking: rawData.bookings?.[0]?.booking_date || "N/A",
    }
  }

  const summary = getDataSummary()

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold title-font" style={{ color: "var(--text)" }}>
            Initialize CRM Data
          </h1>
          <p className="body-font mt-2" style={{ color: "var(--text-light)" }}>
            Enter your Professional ID to load your customer and booking data into the CRM system.
          </p>
        </div>

        <Card className="shadow-lg border-0" style={{ backgroundColor: "var(--card-bg)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 header-font" style={{ color: "var(--text)" }}>
              <Database className="h-5 w-5" style={{ color: "var(--primary)" }} />
              CRM Data Initialization
            </CardTitle>
            <CardDescription className="body-font" style={{ color: "var(--text-light)" }}>
              This will fetch all your customer, booking, and pet data from the database to power your CRM campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="professional-id" className="header-font" style={{ color: "var(--text)" }}>
                Professional ID
              </Label>
              <Input
                id="professional-id"
                type="text"
                placeholder="Enter your Professional ID"
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                disabled={isLoading}
                className="body-font"
              />
            </div>

            {errorMessage && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <div className="flex items-start gap-2">
                  <WifiOff className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <AlertDescription className="body-font text-red-800">
                      <div className="font-medium">Connection Error</div>
                      <div className="text-sm mt-1">{errorMessage}</div>
                      {errorMessage.includes("unavailable") && (
                        <div className="text-xs mt-2 text-red-600">
                          The CRM service may still be starting up. Please try again in a moment.
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {initializationStatus === "success" && summary && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="body-font">
                  <div className="font-medium text-green-800">CRM Data Loaded Successfully!</div>
                  <div className="text-sm mt-1 text-green-700">
                    Found {summary.customers} customers, {summary.bookings} bookings, and {summary.pets} pets. Last
                    booking: {summary.lastBooking}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => handleInitialize(false)}
                disabled={isLoading || !professionalId.trim()}
                className="flex-1 font-medium body-font text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing CRM Data...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Initialize CRM Data
                  </>
                )}
              </Button>

              {initializationStatus === "error" && (
                <Button
                  onClick={() => handleInitialize(true)}
                  disabled={isLoading}
                  variant="outline"
                  className="body-font border-2 hover:bg-gray-50"
                  style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>

            {initializationStatus === "success" && (
              <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <Button
                  variant="outline"
                  className="w-full body-font border-2 hover:bg-gray-50 bg-transparent"
                  style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                  onClick={() => (window.location.href = "/pro/crm")}
                >
                  Continue to CRM Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div
          className="mt-4 flex items-center justify-center gap-2 text-sm body-font"
          style={{ color: "var(--text-light)" }}
        >
          <Wifi className="h-4 w-4" style={{ color: "var(--primary)" }} />
          <span>Connecting to CRM service...</span>
        </div>

        {rawData && (
          <Card className="mt-6 shadow-lg border-0" style={{ backgroundColor: "var(--card-bg)" }}>
            <CardHeader>
              <CardTitle className="header-font" style={{ color: "var(--text)" }}>
                Raw Data Preview
              </CardTitle>
              <CardDescription className="body-font" style={{ color: "var(--text-light)" }}>
                This is the raw data returned from your database (for debugging purposes).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre
                className="p-4 rounded-lg text-xs overflow-auto max-h-96 body-font"
                style={{ backgroundColor: "var(--background)", color: "var(--text)" }}
              >
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
