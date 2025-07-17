"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface EnrollmentStepProps {
  onNext: () => void
  onDataUpdate: (data: any) => void
}

export default function EnrollmentStep({ onNext, onDataUpdate }: EnrollmentStepProps) {
  const [professionalId, setProfessionalId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null)
  const [error, setError] = useState("")
  const [hasVerified, setHasVerified] = useState(false)

  const handleVerifyEnrollment = async () => {
    if (!professionalId.trim()) {
      setError("Please enter your professional ID")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verify_enrollment",
          professional_id: professionalId.trim(),
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to verify enrollment")
      }

      const data = await response.json()

      // Handle the response - adjust based on your webhook response format
      const enrolled = data.enrolled || data.is_enrolled || false
      setIsEnrolled(enrolled)
      setHasVerified(true)

      // Update parent component with professional ID
      onDataUpdate({ professional_id: professionalId.trim(), enrolled })
    } catch (error) {
      console.error("Error verifying enrollment:", error)
      setError("Failed to verify enrollment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnroll = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "enroll_professional",
          professional_id: professionalId.trim(),
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to enroll")
      }

      const data = await response.json()

      if (data.success) {
        setIsEnrolled(true)
        onDataUpdate({ professional_id: professionalId.trim(), enrolled: true })
      } else {
        setError(data.message || "Failed to enroll. Please try again.")
      }
    } catch (error) {
      console.error("Error enrolling:", error)
      setError("Failed to enroll. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    if (isEnrolled) {
      onNext()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Step 1: Enrollment Verification</CardTitle>
        <CardDescription>
          Enter your professional ID to verify your enrollment status in the Custom Support Agent program.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="professionalId">Professional ID *</Label>
          <Input
            id="professionalId"
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
            placeholder="Enter your professional ID"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500">
            Your professional ID can be found in your Critter dashboard or account settings.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasVerified && isEnrolled === false && (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              You are not currently enrolled in the Custom Support Agent program. Click "Enroll Now" to get started.
            </AlertDescription>
          </Alert>
        )}

        {hasVerified && isEnrolled === true && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Great! You are enrolled in the Custom Support Agent program. You can proceed to the next step.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          {!hasVerified && (
            <Button onClick={handleVerifyEnrollment} disabled={isLoading || !professionalId.trim()} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Enrollment"
              )}
            </Button>
          )}

          {hasVerified && isEnrolled === false && (
            <Button onClick={handleEnroll} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                "Enroll Now"
              )}
            </Button>
          )}

          {hasVerified && isEnrolled === true && (
            <Button onClick={handleContinue} className="flex-1">
              Continue →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
