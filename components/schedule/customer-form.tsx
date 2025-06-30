"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, Mail, Phone, MapPin, MessageSquare } from "lucide-react"

interface CustomerFormProps {
  onSubmit: (customerData: any) => void
  loading?: boolean
}

export function CustomerForm({ onSubmit, loading = false }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    specialRequests: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Send customer data to webhook
      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      const payload = {
        action: "save_customer_data",
        customer_data: formData,
        timestamp: new Date().toISOString(),
      }

      console.log("Sending customer data:", payload)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Customer data saved:", data)

      // Call the onSubmit callback
      onSubmit(formData)
    } catch (error) {
      console.error("Error saving customer data:", error)
      // Still proceed to next step even if webhook fails
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl header-font">
          <User className="w-5 h-5 text-[#E75837]" />
          Customer Information
        </CardTitle>
        <p className="text-gray-600 body-font">Please provide your contact details for the appointment.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="body-font">
                First Name *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter your first name"
                className={`body-font ${errors.firstName ? "border-red-500" : ""}`}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1 body-font">{errors.firstName}</p>}
            </div>
            <div>
              <Label htmlFor="lastName" className="body-font">
                Last Name *
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter your last name"
                className={`body-font ${errors.lastName ? "border-red-500" : ""}`}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1 body-font">{errors.lastName}</p>}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2 body-font">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.email@example.com"
                className={`body-font ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1 body-font">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2 body-font">
                <Phone className="w-4 h-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
                className={`body-font ${errors.phone ? "border-red-500" : ""}`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1 body-font">{errors.phone}</p>}
            </div>
          </div>

          {/* Address Fields */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 body-font">
              <MapPin className="w-4 h-4" />
              Address (Optional)
            </Label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Street address"
              className="body-font"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
                className="body-font"
              />
              <Input
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="State"
                className="body-font"
              />
              <Input
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                placeholder="ZIP Code"
                className="body-font"
              />
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <Label htmlFor="specialRequests" className="flex items-center gap-2 body-font">
              <MessageSquare className="w-4 h-4" />
              Special Requests or Notes (Optional)
            </Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => handleInputChange("specialRequests", e.target.value)}
              placeholder="Any special requirements, allergies, or additional information..."
              className="body-font min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E75837] hover:bg-[#d14a2a] text-white py-3 text-lg header-font"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue to Pet Selection"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default CustomerForm
