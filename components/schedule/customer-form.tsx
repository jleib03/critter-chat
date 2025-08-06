"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'
import type { CustomerInfo, PetResponse, Service, SelectedTimeSlot } from "@/types/schedule"
import { getWebhookEndpoint, logWebhookUsage } from "@/types/webhook-endpoints"

interface CustomerFormProps {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalId: string
  professionalName: string
  sessionId: string
  onPetsReceived: (customerInfo: CustomerInfo, petResponse: PetResponse) => void
  onBack: () => void
  bookingType: string | null
  recurringConfig: any
  showPrices: boolean
  multiDayTimeSlot: { start: Date; end: Date } | null
}

export function CustomerForm({
  professionalId,
  sessionId,
  onPetsReceived,
  onBack,
}: CustomerFormProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [loadingPets, setLoadingPets] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailBlur = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return

    setLoadingPets(true)
    setError(null)
    try {
      const webhookUrl = getWebhookEndpoint("PROFESSIONAL_CONFIG")
      logWebhookUsage("PROFESSIONAL_CONFIG", "get_customer_pets")

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_customer_pets",
          email: email.trim().toLowerCase(),
          professional_id: professionalId,
          session_id: sessionId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to fetch pets: ${errorData}`)
      }

      const petResponse: PetResponse = await response.json()
      onPetsReceived({ firstName, lastName, email }, petResponse)
    } catch (err: any) {
      console.error("Error fetching pets:", err)
      setError("Could not find customer. Please continue as a new customer.")
      onPetsReceived({ firstName, lastName, email }, { pets: [] })
    } finally {
      setLoadingPets(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (firstName && lastName && email) {
      handleEmailBlur()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-8">
      <h2 className="text-2xl font-bold text-gray-900 header-font mb-2">Your Information</h2>
      <p className="text-gray-600 body-font mb-6">
        Please provide your details. If you're an existing customer, we'll find your pets.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="body-font">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="body-font"
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="body-font">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="body-font"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email" className="body-font">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            required
            className="body-font"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-between items-center pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={loadingPets || !firstName || !lastName || !email}>
            {loadingPets ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
