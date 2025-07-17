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
        <a
          href="https://apps.apple.com/us/app/critter-pet-owners-pros/id1630023733"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="text-left">
              <div className="text-xs">Download on</div>
              <div className="text-lg font-semibold">iOS</div>
            </div>
          </div>
        </a>
        <a
          href="https://play.google.com/store/apps/details?id=com.critterclient&pli=1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            <div className="text-left">
              <div className="text-xs">Download on</div>
              <div className="text-lg font-semibold">Android</div>
            </div>
          </div>
        </a>
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
