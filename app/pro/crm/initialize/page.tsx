"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function InitializeCRM() {
  const [professionalId, setProfessionalId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [initializationStatus, setInitializationStatus] = useState<"idle" | "success" | "error">("idle")
  const [rawData, setRawData] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const handleInitialize = async () => {
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
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Received CRM data:", data)

      setRawData(data)
      setInitializationStatus("success")

      // Store the data in localStorage for use across CRM components
      localStorage.setItem("crm_raw_data", JSON.stringify(data))
      localStorage.setItem("crm_professional_id", professionalId.trim())
    } catch (error) {
      console.error("[v0] CRM initialization error:", error)
      setInitializationStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to initialize CRM data")
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
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Initialize CRM Data</h1>
        <p className="text-gray-600 mt-2">
          Enter your Professional ID to load your customer and booking data into the CRM system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            CRM Data Initialization
          </CardTitle>
          <CardDescription>
            This will fetch all your customer, booking, and pet data from the database to power your CRM campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="professional-id">Professional ID</Label>
            <Input
              id="professional-id"
              type="text"
              placeholder="Enter your Professional ID"
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {initializationStatus === "success" && summary && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">CRM Data Loaded Successfully!</div>
                <div className="text-sm mt-1">
                  Found {summary.customers} customers, {summary.bookings} bookings, and {summary.pets} pets. Last
                  booking: {summary.lastBooking}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleInitialize} disabled={isLoading || !professionalId.trim()} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing CRM Data...
              </>
            ) : (
              "Initialize CRM Data"
            )}
          </Button>

          {initializationStatus === "success" && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => (window.location.href = "/pro/crm")}
              >
                Continue to CRM Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {rawData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Raw Data Preview</CardTitle>
            <CardDescription>
              This is the raw data returned from your database (for debugging purposes).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-96">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
