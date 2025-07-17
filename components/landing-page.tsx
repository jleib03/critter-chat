"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type UserInfo = {
  email: string
  firstName: string
  lastName: string
}

interface LandingPageProps {
  webhookUrl: string
  onExistingCustomer: (userData: UserInfo) => void
  onNewCustomer: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ webhookUrl, onExistingCustomer, onNewCustomer }) => {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleExistingCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !firstName || !lastName) return

    setIsLoading(true)

    // Simulate validation/lookup (you can add real validation here)
    setTimeout(() => {
      onExistingCustomer({
        email,
        firstName,
        lastName,
      })
      setIsLoading(false)
    }, 1000)
  }

  const handleNewCustomerClick = () => {
    onNewCustomer()
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold mb-6 text-gray-900 font-sangbleu">Welcome to Critter</h1>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto body-font">
          Your trusted platform for connecting with professional pet care services. Book grooming, sitting, walking, and
          more with verified local professionals.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
        {/* Existing Customer Card */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-sangbleu">Existing Customer</CardTitle>
            <CardDescription>
              Welcome back! Enter your details to continue with your Critter experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExistingCustomerSubmit} className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full bg-[#E75837] hover:bg-[#d14d2a] text-white" disabled={isLoading}>
                {isLoading ? "Loading..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* New Customer Card */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-sangbleu">New Customer</CardTitle>
            <CardDescription>
              New to Critter? Let's get you set up with a professional pet care provider.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-full">
            <div className="space-y-4 text-center">
              <p className="text-gray-600">Join thousands of pet parents who trust Critter for their pet care needs.</p>
              <ul className="text-left space-y-2 text-sm text-gray-600">
                <li>• Connect with verified professionals</li>
                <li>• Easy online booking and scheduling</li>
                <li>• Secure payments and communication</li>
                <li>• 24/7 customer support</li>
              </ul>
              <Button
                onClick={handleNewCustomerClick}
                className="w-full bg-[#E75837] hover:bg-[#d14d2a] text-white mt-6"
              >
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">
          Questions? Contact us at{" "}
          <a href="mailto:support@critter.pet" className="text-[#E75837] hover:underline">
            support@critter.pet
          </a>
        </p>
      </div>
    </div>
  )
}

export default LandingPage
