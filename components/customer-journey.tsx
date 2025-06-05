"use client"
import { useState } from "react"
import type React from "react"

import {
  UserPlus,
  Search,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  Star,
  Shield,
  Zap,
  Heart,
  Smartphone,
  Users,
} from "lucide-react"

type JourneyStep = {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
  valueProps: string[]
  tacticalActions: {
    title: string
    description: string
    benefit: string
  }[]
  customerThought: string
  businessValue: string
}

const journeySteps: JourneyStep[] = [
  {
    id: "discover",
    title: "Discover",
    subtitle: "Find your perfect pet care professional",
    icon: <Search className="h-8 w-8" />,
    color: "#E75837",
    valueProps: ["No app downloads", "Instant browsing", "Real reviews", "Direct contact"],
    tacticalActions: [
      {
        title: "Browse local professionals",
        description: "Search by location, service type, and availability",
        benefit: "Find exactly what you need, when you need it",
      },
      {
        title: "Read authentic reviews",
        description: "See real feedback from other pet parents",
        benefit: "Make confident decisions with social proof",
      },
      {
        title: "Compare services & pricing",
        description: "View detailed service offerings and transparent pricing",
        benefit: "No surprises - know exactly what you're getting",
      },
    ],
    customerThought: "I need someone I can trust with my furry family member",
    businessValue: "Quality professionals vetted by real customer feedback",
  },
  {
    id: "connect",
    title: "Connect",
    subtitle: "Get onboarded seamlessly",
    icon: <UserPlus className="h-8 w-8" />,
    color: "#7C3AED",
    valueProps: ["Custom intake process", "One-time setup", "Secure data", "Personal touch"],
    tacticalActions: [
      {
        title: "Complete personalized intake",
        description: "Share your pet's unique needs, preferences, and medical info",
        benefit: "Tailored care from day one",
      },
      {
        title: "Set communication preferences",
        description: "Choose how and when you want to receive updates",
        benefit: "Stay informed your way",
      },
      {
        title: "Establish emergency protocols",
        description: "Provide emergency contacts and special instructions",
        benefit: "Peace of mind for unexpected situations",
      },
    ],
    customerThought: "I want them to know my pet as well as I do",
    businessValue: "Professionals get complete context for exceptional care",
  },
  {
    id: "book",
    title: "Book",
    subtitle: "Request services effortlessly",
    icon: <Calendar className="h-8 w-8" />,
    color: "#10B981",
    valueProps: ["No account needed", "Flexible scheduling", "Instant confirmation", "Easy modifications"],
    tacticalActions: [
      {
        title: "Request your preferred times",
        description: "Pick dates and times that work with your schedule",
        benefit: "Convenience that fits your life",
      },
      {
        title: "Add special instructions",
        description: "Include any specific needs or requests for this visit",
        benefit: "Personalized service every time",
      },
      {
        title: "Get instant confirmation",
        description: "Receive immediate confirmation from your professional",
        benefit: "No waiting, no uncertainty",
      },
    ],
    customerThought: "This should work around my busy schedule",
    businessValue: "Streamlined booking reduces back-and-forth communication",
  },
  {
    id: "support",
    title: "Get Support",
    subtitle: "Instant answers, anytime",
    icon: <MessageSquare className="h-8 w-8" />,
    color: "#3B82F6",
    valueProps: ["24/7 availability", "Instant responses", "Professional knowledge", "No phone tag"],
    tacticalActions: [
      {
        title: "Chat with AI assistant",
        description: "Get immediate answers about policies, services, and availability",
        benefit: "No waiting for business hours",
      },
      {
        title: "Access professional knowledge",
        description: "AI trained on your professional's specific expertise",
        benefit: "Accurate, personalized information",
      },
      {
        title: "Seamless handoff when needed",
        description: "Complex questions automatically routed to your professional",
        benefit: "Human touch when you need it most",
      },
    ],
    customerThought: "I have questions and I need answers now",
    businessValue: "Reduced support burden while improving customer satisfaction",
  },
  {
    id: "manage",
    title: "Manage",
    subtitle: "Stay organized effortlessly",
    icon: <FileText className="h-8 w-8" />,
    color: "#EC4899",
    valueProps: ["All-in-one dashboard", "Real-time updates", "Complete history", "Easy access"],
    tacticalActions: [
      {
        title: "View upcoming appointments",
        description: "See your schedule at a glance with all important details",
        benefit: "Never miss an appointment again",
      },
      {
        title: "Access service history",
        description: "Review past visits, notes, and photos from your professional",
        benefit: "Track your pet's care journey",
      },
      {
        title: "Download invoices & receipts",
        description: "Get organized records for insurance or tax purposes",
        benefit: "Simplified record keeping",
      },
    ],
    customerThought: "I want to stay on top of my pet's care",
    businessValue: "Transparent communication builds trust and loyalty",
  },
  {
    id: "adjust",
    title: "Adjust",
    subtitle: "Flexible changes made simple",
    icon: <Clock className="h-8 w-8" />,
    color: "#F59E0B",
    valueProps: ["Easy modifications", "Clear policies", "Quick responses", "No hassle"],
    tacticalActions: [
      {
        title: "Request changes easily",
        description: "Modify or cancel appointments through simple requests",
        benefit: "Life happens - we get it",
      },
      {
        title: "Understand policies clearly",
        description: "Know exactly what to expect with transparent policies",
        benefit: "No confusion or surprise fees",
      },
      {
        title: "Get quick confirmations",
        description: "Receive prompt responses to all change requests",
        benefit: "Fast resolution when plans change",
      },
    ],
    customerThought: "Sometimes life gets in the way",
    businessValue: "Clear policies and easy changes reduce conflicts",
  },
]

export default function CustomerJourney() {
  const [activeStep, setActiveStep] = useState<string>("discover")
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  const currentStep = journeySteps.find((step) => step.id === activeStep) || journeySteps[0]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#E75837] to-[#f07a5f] rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center mb-4">
          <Heart className="h-8 w-8 mr-3" />
          <div>
            <h2 className="text-3xl font-bold header-font">Your Pet Care Journey</h2>
            <p className="text-lg opacity-90 body-font">
              Experience seamless pet care from discovery to ongoing support
            </p>
          </div>
        </div>
        <div className="flex items-center text-sm opacity-90 mt-4">
          <Smartphone className="h-4 w-4 mr-2" />
          <span className="body-font">Works on any device - no app required</span>
        </div>
      </div>

      {/* Interactive Journey Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-center mb-6 header-font">Your Journey Steps</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {journeySteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                activeStep === step.id ? "shadow-lg transform scale-105" : "hover:shadow-md hover:scale-102"
              }`}
              style={{
                backgroundColor: activeStep === step.id ? step.color : "#F8FAFC",
                color: activeStep === step.id ? "white" : "#64748B",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                style={{
                  backgroundColor: activeStep === step.id ? "rgba(255,255,255,0.2)" : step.color,
                  color: activeStep === step.id ? "white" : "white",
                }}
              >
                <span className="text-xs font-bold">{index + 1}</span>
              </div>
              <div className="text-left">
                <div className="font-bold text-sm header-font">{step.title}</div>
                <div className="text-xs opacity-75 body-font">{step.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Side - Value Proposition */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg"
              style={{ backgroundColor: currentStep.color }}
            >
              {currentStep.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold header-font">{currentStep.title}</h3>
              <p className="text-[#64748B] body-font">{currentStep.subtitle}</p>
            </div>
          </div>

          {/* Customer Thought */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <Users className="h-5 w-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm text-blue-800 header-font">What you're thinking:</div>
                <p className="text-blue-700 italic body-font">"{currentStep.customerThought}"</p>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="mb-6">
            <h4 className="font-bold text-[#1E293B] mb-3 header-font">Why you'll love this:</h4>
            <div className="grid grid-cols-2 gap-3">
              {currentStep.valueProps.map((prop, idx) => (
                <div key={idx} className="flex items-center text-sm">
                  <Star className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                  <span className="body-font">{prop}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Business Value */}
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm text-green-800 header-font">The result:</div>
                <p className="text-green-700 body-font">{currentStep.businessValue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Tactical Actions */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold header-font">What you'll do:</h4>
          {currentStep.tacticalActions.map((action, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-102"
              onMouseEnter={() => setHoveredAction(`${currentStep.id}-${idx}`)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <div className="flex items-start">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0"
                  style={{ backgroundColor: currentStep.color }}
                >
                  <span className="text-sm font-bold">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-[#1E293B] mb-2 header-font">{action.title}</h5>
                  <p className="text-[#64748B] text-sm mb-3 body-font">{action.description}</p>
                  <div
                    className={`transition-all duration-300 ${
                      hoveredAction === `${currentStep.id}-${idx}` ? "opacity-100 max-h-20" : "opacity-70 max-h-12"
                    }`}
                  >
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-700 body-font">{action.benefit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Journey Progress */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h4 className="text-lg font-bold text-center mb-4 header-font">Your Journey Progress</h4>
        <div className="flex items-center justify-between">
          {journeySteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                  journeySteps.findIndex((s) => s.id === activeStep) >= index ? "scale-110" : "scale-100 opacity-50"
                }`}
                style={{
                  backgroundColor: journeySteps.findIndex((s) => s.id === activeStep) >= index ? step.color : "#E5E7EB",
                }}
              >
                {journeySteps.findIndex((s) => s.id === activeStep) > index ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              {index < journeySteps.length - 1 && (
                <div
                  className={`w-12 h-1 mx-2 transition-all duration-300 ${
                    journeySteps.findIndex((s) => s.id === activeStep) > index ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#E75837] to-[#f07a5f] rounded-2xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-4 header-font">Ready to Start Your Journey?</h3>
        <p className="mb-6 body-font">
          Experience the future of pet care - where convenience meets exceptional service.
        </p>
        <a
          href="/findprofessional"
          className="bg-white text-[#E75837] px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors body-font inline-flex items-center shadow-lg"
        >
          <Search className="h-5 w-5 mr-2" />
          Find Your Professional
        </a>
      </div>
    </div>
  )
}
