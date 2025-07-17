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

export default function LandingPage({ webhookUrl, onExistingCustomer, onNewCustomer }: LandingPageProps) {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
    }, 1000)
  }

  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl title-font mb-6 font-sangbleu">
          Professional Pet Care,
          <br />
          <span className="text-[#E75837]">Made Simple</span>
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto body-font leading-relaxed">
          Connect with trusted, verified pet care professionals in your area. From grooming to pet sitting, we make it
          easy to find the perfect care for your furry family members.
        </p>
      </div>

      {/* Main Action Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Existing Customer Card */}
        <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#E75837] to-[#ff6b47] text-white p-8">
            <CardTitle className="text-3xl font-sangbleu mb-2">Welcome Back</CardTitle>
            <CardDescription className="text-orange-100 text-lg">Continue your Critter journey</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleExistingCustomerSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-2 h-12 border-gray-200 focus:border-[#E75837] focus:ring-[#E75837]"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-gray-700 font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="mt-2 h-12 border-gray-200 focus:border-[#E75837] focus:ring-[#E75837]"
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 h-12 border-gray-200 focus:border-[#E75837] focus:ring-[#E75837]"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#E75837] hover:bg-[#d14d2a] text-white font-medium text-lg rounded-xl transition-all duration-200 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Continue to Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* New Customer Card */}
        <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-8">
            <CardTitle className="text-3xl font-sangbleu mb-2">New to Critter?</CardTitle>
            <CardDescription className="text-gray-200 text-lg">
              Let's find your perfect pet care professional
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#E75837] rounded-full"></div>
                  <p className="text-gray-700">Connect with verified professionals</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#E75837] rounded-full"></div>
                  <p className="text-gray-700">Easy online booking and scheduling</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#E75837] rounded-full"></div>
                  <p className="text-gray-700">Secure payments and communication</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#E75837] rounded-full"></div>
                  <p className="text-gray-700">24/7 customer support</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-600 text-center mb-4">
                  Join thousands of pet parents who trust Critter for their pet care needs.
                </p>
                <div className="text-center">
                  <span className="text-2xl font-bold text-[#E75837]">4.9/5</span>
                  <p className="text-sm text-gray-500">Average rating from pet parents</p>
                </div>
              </div>

              <Button
                onClick={onNewCustomer}
                className="w-full h-12 bg-gray-800 hover:bg-gray-700 text-white font-medium text-lg rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                Get Started Today
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-[#E75837] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-sangbleu mb-2">Verified Professionals</h3>
          <p className="text-gray-600">
            All our pet care providers are background-checked and verified for your peace of mind.
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-[#E75837] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-sangbleu mb-2">Flexible Scheduling</h3>
          <p className="text-gray-600">
            Book appointments that work with your schedule, from one-time services to recurring care.
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-[#E75837] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-sangbleu mb-2">Trusted Care</h3>
          <p className="text-gray-600">
            Your pets deserve the best. Our professionals provide loving, reliable care every time.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="text-center bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-sangbleu mb-4">Questions? We're Here to Help</h3>
        <p className="text-gray-600 mb-4">
          Our customer support team is available 24/7 to assist you with any questions or concerns.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="mailto:support@critter.pet"
            className="text-[#E75837] hover:text-[#d14d2a] font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            support@critter.pet
          </a>
          <span className="text-gray-400 hidden sm:block">|</span>
          <a
            href="tel:1-800-CRITTER"
            className="text-[#E75837] hover:text-[#d14d2a] font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            1-800-CRITTER
          </a>
        </div>
      </div>
    </>
  )
}
