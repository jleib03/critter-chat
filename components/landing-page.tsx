"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { User, UserPlus, Search, Calendar, FileText, Edit, Users, Star, Clock, X } from "lucide-react"

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

export default function LandingPage({ webhookUrl, onExistingCustomer, onNewCustomer }: LandingPageProps) {
  const [showExistingCustomerModal, setShowExistingCustomerModal] = useState(false)
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleExistingCustomerClick = () => {
    setShowExistingCustomerModal(true)
  }

  const handleExistingCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !firstName || !lastName) return

    setIsLoading(true)

    // Simulate validation/lookup
    setTimeout(() => {
      onExistingCustomer({
        email,
        firstName,
        lastName,
      })
      setIsLoading(false)
      setShowExistingCustomerModal(false)
    }, 1000)
  }

  const handleFindProfessional = () => {
    // Navigate to find professional page
    window.location.href = "/findprofessional"
  }

  const handleCancel = () => {
    setShowExistingCustomerModal(false)
    setEmail("")
    setFirstName("")
    setLastName("")
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 font-sangbleu">Book pet care with Critter</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto body-font leading-relaxed">
          Welcome to Critter's online booking portal, an extension of Critter's mobile app
          <br />
          designed for fast and simple booking.
        </p>
      </div>

      {/* Three Main Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Existing Customer Card */}
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            <div className="w-full h-2 bg-[#E75837]"></div>
            <CardHeader className="text-center p-8">
              <div className="w-16 h-16 bg-[#E75837] rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">I'm an existing customer</CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Already use Critter? Book services, manage appointments, and check invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Request or view appointments</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Check invoices</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Edit className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Request changes to bookings</span>
                </div>
              </div>
              <Button
                onClick={handleExistingCustomerClick}
                variant="link"
                className="text-[#E75837] hover:text-[#d14d2a] font-medium p-0 h-auto text-base"
              >
                Continue →
              </Button>
            </CardContent>
          </Card>

          {/* New Customer Card */}
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            <div className="w-full h-2 bg-[#8B7355]"></div>
            <CardHeader className="text-center p-8">
              <div className="w-16 h-16 bg-[#8B7355] rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">I'm a new customer</CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Know your Critter professional? Get the onboarding and booking request process started.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-gray-700">
                  <UserPlus className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Complete quick intake</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Provide detailed pet information</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Request your first appointment</span>
                </div>
              </div>
              <Button
                onClick={onNewCustomer}
                variant="link"
                className="text-[#8B7355] hover:text-[#7a6449] font-medium p-0 h-auto text-base"
              >
                Get Started →
              </Button>
            </CardContent>
          </Card>

          {/* Find Professional Card */}
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            <div className="w-full h-2 bg-[#6B9BD2]"></div>
            <CardHeader className="text-center p-8">
              <div className="w-16 h-16 bg-[#6B9BD2] rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">I need to find a professional</CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Looking for pet care services? We'll help you find the perfect match in your area.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Browse professionals</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Star className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">View profiles & reviews</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Check availability</span>
                </div>
              </div>
              <Button
                onClick={handleFindProfessional}
                variant="link"
                className="text-[#6B9BD2] hover:text-[#5a8bc4] font-medium p-0 h-auto text-base"
              >
                Find a professional →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* App Store Buttons */}
      <div className="flex justify-center space-x-4 pb-16">
        <img
          src="/placeholder.svg?height=60&width=180&text=Download+on+App+Store"
          alt="Download on App Store"
          className="h-15 rounded-lg"
        />
        <img
          src="/placeholder.svg?height=60&width=180&text=Get+it+on+Google+Play"
          alt="Get it on Google Play"
          className="h-15 rounded-lg"
        />
      </div>

      {/* Existing Customer Modal */}
      <Dialog open={showExistingCustomerModal} onOpenChange={setShowExistingCustomerModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-0 border-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-gray-900">Welcome back!</DialogTitle>
              <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600 text-base mt-2">Enter your information to access your bookings and services.</p>
          </DialogHeader>
          <div className="px-6 pb-6">
            <form onSubmit={handleExistingCustomerSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email address*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:border-[#E75837] focus:ring-[#E75837] rounded-lg"
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="First name*"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:border-[#E75837] focus:ring-[#E75837] rounded-lg"
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Last name*"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:border-[#E75837] focus:ring-[#E75837] rounded-lg"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#E75837] hover:bg-[#d14d2a] text-white font-medium rounded-lg mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Continue to Booking"}
              </Button>
              <div className="text-center mt-4">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 p-0 h-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
