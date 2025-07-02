"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, MessageSquare, Settings, Heart, Clock, CheckCircle2, ArrowRight, Play } from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#FBF8F3] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#E75837] mb-4 header-font">Critter Pet Services Demo</h1>
          <p className="text-gray-700 text-lg body-font max-w-3xl mx-auto">
            Experience the complete pet care ecosystem - from customer requests to professional service delivery
          </p>
        </div>

        {/* Demo Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Customer Experience */}
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 header-font">
                <Heart className="w-5 h-5" />
                Customer Experience
              </CardTitle>
              <Badge variant="outline" className="w-fit body-font">
                Start Here
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 body-font">
                See how pet owners request services through our concierge platform
              </p>

              <div className="space-y-2">
                <Link href="/concierge">
                  <Button className="w-full justify-between bg-blue-600 hover:bg-blue-700 text-white body-font">
                    Concierge Request
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/schedule/sarah-johnson">
                  <Button variant="outline" className="w-full justify-between body-font bg-transparent">
                    Direct Booking
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-gray-500 body-font">
                • Pre-populated with demo data
                <br />• Shows AI-powered matching
                <br />• Real-time notifications
              </div>
            </CardContent>
          </Card>

          {/* Professional Tools */}
          <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 header-font">
                <Users className="w-5 h-5" />
                Professional Tools
              </CardTitle>
              <Badge variant="outline" className="w-fit body-font">
                Business Side
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 body-font">
                Professional dashboard, setup, and opportunity management
              </p>

              <div className="space-y-2">
                <Link href="/pro/opportunities">
                  <Button className="w-full justify-between bg-green-600 hover:bg-green-700 text-white body-font">
                    Opportunities
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/pro/set-up">
                  <Button variant="outline" className="w-full justify-between body-font bg-transparent">
                    Setup & Config
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-gray-500 body-font">
                • Claim opportunities
                <br />• Configure services
                <br />• Team management
              </div>
            </CardContent>
          </Card>

          {/* Service Delivery */}
          <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800 header-font">
                <Clock className="w-5 h-5" />
                Service Delivery
              </CardTitle>
              <Badge variant="outline" className="w-fit body-font">
                Quality Focus
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 body-font">
                Professional service execution with real-time tracking and reporting
              </p>

              <div className="space-y-2">
                <Link href="/service/demo-service-123">
                  <Button className="w-full justify-between bg-purple-600 hover:bg-purple-700 text-white body-font">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Start Service Demo
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-gray-500 body-font">
                • Smart care plans
                <br />• Real-time tracking
                <br />• AI-generated reports
                <br />• Quality assurance
              </div>
            </CardContent>
          </Card>

          {/* Admin/Concierge */}
          <Card className="border-2 border-orange-200 hover:border-orange-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800 header-font">
                <MessageSquare className="w-5 h-5" />
                Admin & Concierge
              </CardTitle>
              <Badge variant="outline" className="w-fit body-font">
                Operations
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 body-font">
                Behind-the-scenes request management and professional coordination
              </p>

              <div className="space-y-2">
                <Link href="/admin/concierge">
                  <Button className="w-full justify-between bg-orange-600 hover:bg-orange-700 text-white body-font">
                    Concierge Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-gray-500 body-font">
                • Request management
                <br />• AI-powered matching
                <br />• Professional coordination
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="border-2 border-gray-200 hover:border-gray-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 header-font">
                <Settings className="w-5 h-5" />
                Platform Setup
              </CardTitle>
              <Badge variant="outline" className="w-fit body-font">
                Configuration
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 body-font">
                Platform configuration and professional onboarding tools
              </p>

              <div className="space-y-2">
                <Link href="/pro/custom-agent">
                  <Button variant="outline" className="w-full justify-between body-font bg-transparent">
                    Custom AI Agent
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/pro/how-to-use">
                  <Button variant="outline" className="w-full justify-between body-font bg-transparent">
                    How to Use
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-gray-500 body-font">
                • AI agent setup
                <br />• Platform tutorials
                <br />• Integration guides
              </div>
            </CardContent>
          </Card>

          {/* Demo Flow */}
          <Card className="border-2 border-[#E75837] hover:border-[#d04e30] transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E75837] header-font">
                <CheckCircle2 className="w-5 h-5" />
                Complete Demo Flow
              </CardTitle>
              <Badge variant="outline" className="w-fit body-font">
                Recommended
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 body-font">
                Experience the complete customer-to-professional journey
              </p>

              <div className="space-y-3">
                <div className="text-xs space-y-1 body-font">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                      1
                    </div>
                    <span>Customer submits concierge request</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                      2
                    </div>
                    <span>Admin reviews and matches professionals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                      3
                    </div>
                    <span>Professional claims opportunity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">
                      4
                    </div>
                    <span>Service delivery with real-time tracking</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Guide */}
        <Card className="mt-8 bg-gradient-to-r from-[#E75837] to-[#d04e30] text-white">
          <CardHeader>
            <CardTitle className="text-white header-font">🚀 Quick Start for Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 header-font">Customer Journey (2 min)</h4>
                <ol className="text-sm space-y-1 body-font">
                  <li>1. Start with Concierge Request</li>
                  <li>2. See AI matching in action</li>
                  <li>3. View professional selection</li>
                  <li>4. Experience service delivery</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2 header-font">Professional Tools (3 min)</h4>
                <ol className="text-sm space-y-1 body-font">
                  <li>1. Check opportunities dashboard</li>
                  <li>2. Review setup and configuration</li>
                  <li>3. Experience service delivery interface</li>
                  <li>4. See AI-generated reporting</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
