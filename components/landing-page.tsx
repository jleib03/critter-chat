"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, UserPlus, Search, Calendar, FileText, Edit, Users, Star, Clock } from "lucide-react"

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
  const handleExistingCustomer = () => {
    // For now, we'll simulate the existing customer flow
    // In a real implementation, this might show a login form or redirect
    onExistingCustomer({
      email: "existing@example.com",
      firstName: "Existing",
      lastName: "Customer",
    })
  }

  const handleFindProfessional = () => {
    // Navigate to find professional page
    window.location.href = "/findprofessional"
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
            <CardHeader className="text-center p-8">
              <div className="w-16 h-16 bg-[#E75837] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="w-full h-1 bg-[#E75837] rounded-full mb-4"></div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">I'm an existing customer</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Already use Critter? Book services, manage appointments, and check invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-[#E75837]" />
                  <span>Request or view appointments</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <FileText className="w-5 h-5 text-[#E75837]" />
                  <span>Check invoices</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Edit className="w-5 h-5 text-[#E75837]" />
                  <span>Request changes to bookings</span>
                </div>
              </div>
              <Button
                onClick={handleExistingCustomer}
                className="w-full bg-[#E75837] hover:bg-[#d14d2a] text-white font-medium py-3 rounded-xl transition-all duration-200"
              >
                Continue →
              </Button>
            </CardContent>
          </Card>

          {/* New Customer Card */}
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            <CardHeader className="text-center p-8">
              <div className="w-16 h-16 bg-[#8B7355] rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div className="w-full h-1 bg-[#8B7355] rounded-full mb-4"></div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">I'm a new customer</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Know your Critter professional? Get the onboarding and booking request process started.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-gray-700">
                  <UserPlus className="w-5 h-5 text-[#8B7355]" />
                  <span>Complete quick intake</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <FileText className="w-5 h-5 text-[#8B7355]" />
                  <span>Provide detailed pet information</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-[#8B7355]" />
                  <span>Request your first appointment</span>
                </div>
              </div>
              <Button
                onClick={onNewCustomer}
                className="w-full bg-[#8B7355] hover:bg-[#7a6449] text-white font-medium py-3 rounded-xl transition-all duration-200"
              >
                Get Started →
              </Button>
            </CardContent>
          </Card>

          {/* Find Professional Card */}
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            <CardHeader className="text-center p-8">
              <div className="w-16 h-16 bg-[#6B9BD2] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <div className="w-full h-1 bg-[#6B9BD2] rounded-full mb-4"></div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">I need to find a professional</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Looking for pet care services? We'll help you find the perfect match in your area.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Users className="w-5 h-5 text-[#6B9BD2]" />
                  <span>Browse professionals</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Star className="w-5 h-5 text-[#6B9BD2]" />
                  <span>View profiles & reviews</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Clock className="w-5 h-5 text-[#6B9BD2]" />
                  <span>Check availability</span>
                </div>
              </div>
              <Button
                onClick={handleFindProfessional}
                className="w-full bg-[#6B9BD2] hover:bg-[#5a8bc4] text-white font-medium py-3 rounded-xl transition-all duration-200"
              >
                Find a professional →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
