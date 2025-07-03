"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Calendar, Heart, ArrowRight, Clock, CheckCircle2, Star, Sparkles } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(1)

  const demoSteps = [
    {
      id: 1,
      title: "Customer Request",
      description: "See how customers submit service requests",
      icon: Users,
      color: "bg-blue-500",
      path: "/concierge",
      status: "available",
    },
    {
      id: 2,
      title: "Admin Concierge",
      description: "AI-powered request analysis and professional matching",
      icon: UserCheck,
      color: "bg-green-500",
      path: "/admin/concierge",
      status: "available",
    },
    {
      id: 3,
      title: "Professional Opportunities",
      description: "How professionals claim and manage opportunities",
      icon: Calendar,
      color: "bg-purple-500",
      path: "/pro/opportunities",
      status: "available",
    },
    {
      id: 4,
      title: "Service Delivery",
      description: "Real-time care execution and quality tracking",
      icon: Heart,
      color: "bg-orange-500",
      path: "/service/demo-service-123",
      status: "available",
    },
    {
      id: 5,
      title: "Customer Live View",
      description: "Real-time updates during service delivery",
      icon: Clock,
      color: "bg-pink-500",
      path: "/customer/service/demo-service-123",
      status: "new",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#E75837] rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 header-font">Critter Platform Demo</h1>
          </div>
          <p className="text-xl text-gray-600 body-font max-w-3xl mx-auto">
            Experience the complete pet care ecosystem - from customer request to professional service delivery
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="w-5 h-5 text-[#E75837]" />
            <span className="text-sm text-gray-600 body-font">
              Full end-to-end demonstration with real-time features
            </span>
          </div>
        </div>

        {/* Demo Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {demoSteps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <Card
                key={step.id}
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  isActive ? "ring-2 ring-[#E75837] shadow-lg" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      {step.status === "new" && (
                        <Badge variant="secondary" className="text-xs body-font bg-green-100 text-green-800">
                          New!
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500 body-font">Step {step.id}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg header-font">{step.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 body-font mb-4">{step.description}</p>

                  <Link href={step.path}>
                    <Button
                      className="w-full body-font"
                      variant={isActive ? "default" : "outline"}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          View Again
                        </>
                      ) : (
                        <>
                          {step.status === "new" ? "Try New Feature" : "Start Demo"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </Link>
                </CardContent>

                {/* Connection line */}
                {index < demoSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 header-font text-center">Platform Highlights</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 header-font">Smart Matching</h3>
              <p className="text-sm text-gray-600 body-font">
                AI-powered professional matching based on pet needs and location
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 header-font">Real-Time Updates</h3>
              <p className="text-sm text-gray-600 body-font">
                Live service tracking with instant notifications to customers
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 header-font">Quality Care</h3>
              <p className="text-sm text-gray-600 body-font">
                Comprehensive care plans with professional documentation
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 header-font">Professional Network</h3>
              <p className="text-sm text-gray-600 body-font">
                Vetted professionals with specialized expertise and ratings
              </p>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 body-font mb-4">Jump directly to any part of the demo:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {demoSteps.map((step) => (
              <Link key={step.id} href={step.path}>
                <Button
                  variant="outline"
                  size="sm"
                  className="body-font bg-transparent"
                  onClick={() => setCurrentStep(step.id)}
                >
                  {step.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
