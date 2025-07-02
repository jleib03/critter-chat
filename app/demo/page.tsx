"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserCheck, Crown, ArrowRight, Play, Brain, Heart } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DemoPage() {
  const router = useRouter()
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)

  const demoFlows = [
    {
      id: "customer",
      title: "Customer Experience",
      description: "Experience the concierge service from a pet owner's perspective",
      icon: Heart,
      color: "bg-gradient-to-br from-pink-500 to-rose-600",
      features: [
        "Comprehensive pet intake process",
        "Service selection and preferences",
        "Budget and timing configuration",
        "Request submission and confirmation",
      ],
      path: "/concierge",
      demoData: "Luna (German Shepherd) needs post-surgical care",
    },
    {
      id: "admin",
      title: "Concierge Admin Dashboard",
      description: "See how our AI-powered matching system works behind the scenes",
      icon: Brain,
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
      features: [
        "AI-powered professional matching",
        "Detailed reasoning for tier placement",
        "Geographic team management",
        "Request routing and coordination",
      ],
      path: "/admin/concierge",
      demoData: "Chicago Metro Team managing 3 active requests",
    },
    {
      id: "professional",
      title: "Professional Opportunities",
      description: "Discover how professionals claim and manage service opportunities",
      icon: UserCheck,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      features: [
        "Tiered opportunity system",
        "Clear match reasoning",
        "Claiming and response workflow",
        "Earnings and performance tracking",
      ],
      path: "/pro/opportunities",
      demoData: "Dr. Maria Rodriguez - Tier 1 specialist opportunities",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 title-font font-sangbleu">
              Critter Concierge Platform Demo
            </h1>
            <p className="text-xl text-gray-600 body-font">Experience the future of pet care from all perspectives</p>
            <Badge className="mt-4 bg-[#E75837] text-white body-font">Live Demo Environment</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Demo Flow Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {demoFlows.map((flow) => {
            const IconComponent = flow.icon
            const isSelected = selectedDemo === flow.id

            return (
              <Card
                key={flow.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                  isSelected ? "border-[#E75837] shadow-lg scale-105" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedDemo(flow.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-full ${flow.color} mx-auto mb-4 flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl header-font">{flow.title}</CardTitle>
                  <p className="text-gray-600 body-font">{flow.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {flow.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-[#E75837] rounded-full"></div>
                        <span className="body-font">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500 mb-1 body-font">Demo Scenario:</p>
                    <p className="text-sm font-medium text-gray-700 body-font">{flow.demoData}</p>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(flow.path)
                    }}
                    className={`w-full ${
                      isSelected
                        ? "bg-[#E75837] hover:bg-[#d04e30] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } body-font transition-all duration-200`}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Demo
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Demo Flow Visualization */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center header-font">Complete Platform Flow</CardTitle>
            <p className="text-center text-gray-600 body-font">
              See how all three perspectives work together in the Critter ecosystem
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Customer Flow */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 header-font">1. Customer Request</h3>
                <p className="text-sm text-gray-600 body-font mb-4">
                  Pet owner submits comprehensive service request through our intake process
                </p>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                  <p className="text-xs text-pink-700 body-font">
                    "Luna needs post-surgical care and gentle exercise in Lincoln Park"
                  </p>
                </div>
              </div>

              <ArrowRight className="w-8 h-8 text-gray-400 hidden lg:block" />

              {/* Admin Flow */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 header-font">2. AI Matching</h3>
                <p className="text-sm text-gray-600 body-font mb-4">
                  Concierge team uses AI to analyze and match with qualified professionals
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 body-font">
                    "Dr. Rodriguez: 96% match - German Shepherd specialist with post-op experience"
                  </p>
                </div>
              </div>

              <ArrowRight className="w-8 h-8 text-gray-400 hidden lg:block" />

              {/* Professional Flow */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <UserCheck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 header-font">3. Professional Claim</h3>
                <p className="text-sm text-gray-600 body-font mb-4">
                  Qualified professionals see opportunities and claim services they can provide
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700 body-font">
                    "Perfect match! I specialize in German Shepherds and post-surgical care"
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={() => router.push("/concierge")}
                size="lg"
                className="bg-[#E75837] hover:bg-[#d04e30] text-white body-font"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Complete Demo Flow
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: "AI-Powered Matching",
              description: "Advanced algorithms analyze pet needs and professional capabilities",
              stat: "96%",
              statLabel: "Match Accuracy",
            },
            {
              title: "Tiered Professional System",
              description: "Professionals are ranked and routed based on expertise and fit",
              stat: "3",
              statLabel: "Tier Levels",
            },
            {
              title: "Geographic Concierge Teams",
              description: "Local teams provide personalized service and market knowledge",
              stat: "15",
              statLabel: "Metro Areas",
            },
            {
              title: "Real-Time Coordination",
              description: "Seamless communication between customers, admins, and professionals",
              stat: "<2hr",
              statLabel: "Response Time",
            },
          ].map((item, index) => (
            <Card key={index} className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-[#E75837] mb-2 body-font">{item.stat}</div>
                <div className="text-sm text-gray-500 mb-3 body-font">{item.statLabel}</div>
                <h3 className="font-semibold mb-2 header-font">{item.title}</h3>
                <p className="text-sm text-gray-600 body-font">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Navigation */}
        <Card className="bg-gradient-to-r from-[#E75837] to-[#d04e30] text-white">
          <CardContent className="p-8 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 title-font font-sangbleu">Ready to Experience the Future?</h2>
            <p className="text-lg mb-6 body-font opacity-90">
              Choose your perspective and see how Critter revolutionizes pet care coordination
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/concierge")}
                size="lg"
                className="bg-white text-[#E75837] hover:bg-gray-100 body-font"
              >
                <Heart className="w-5 h-5 mr-2" />
                Customer Journey
              </Button>
              <Button
                onClick={() => router.push("/admin/concierge")}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#E75837] body-font"
              >
                <Brain className="w-5 h-5 mr-2" />
                Admin Dashboard
              </Button>
              <Button
                onClick={() => router.push("/pro/opportunities")}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#E75837] body-font"
              >
                <UserCheck className="w-5 h-5 mr-2" />
                Professional Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
