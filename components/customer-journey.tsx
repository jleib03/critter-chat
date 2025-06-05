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
  ArrowRight,
  Globe,
} from "lucide-react"

type CustomerStep = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  details: string[]
  requirements?: string[]
}

const customerSteps: CustomerStep[] = [
  {
    id: "discover",
    title: "Discover Your Professional",
    description: "Find the right pet care professional for your needs",
    icon: <Search className="h-6 w-6" />,
    color: "#94ABD6",
    details: [
      "Browse professionals in your area",
      "View profiles, services, and reviews",
      "Check availability and pricing",
      "Contact professionals directly",
    ],
  },
  {
    id: "intake",
    title: "Complete Intake Process",
    description: "Get onboarded with your chosen professional",
    icon: <UserPlus className="h-6 w-6" />,
    color: "#745E25",
    details: [
      "Fill out detailed pet information",
      "Specify service preferences",
      "Provide emergency contacts",
      "Set communication preferences",
    ],
    requirements: ["Professional's custom intake link", "Pet details and photos", "Emergency contact information"],
  },
  {
    id: "booking",
    title: "Request Services",
    description: "Book appointments without creating an account",
    icon: <Calendar className="h-6 w-6" />,
    color: "#E75837",
    details: [
      "Request specific services",
      "Choose preferred dates and times",
      "Add special instructions",
      "Receive confirmation from professional",
    ],
    requirements: ["Same email/name used in your profile", "Service details and preferences"],
  },
  {
    id: "support",
    title: "Get Instant Support",
    description: "Chat with your professional's AI assistant",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "#059669",
    details: [
      "Ask questions about services",
      "Get policy information",
      "Check availability",
      "Receive instant responses",
    ],
    requirements: ["Professional's website with chat widget"],
  },
  {
    id: "manage",
    title: "Manage Your Information",
    description: "Access schedules and invoices easily",
    icon: <FileText className="h-6 w-6" />,
    color: "#7C3AED",
    details: [
      "View upcoming appointments",
      "Check past service history",
      "Access outstanding invoices",
      "Download receipts and records",
    ],
    requirements: ["Same email/name used in your profile"],
  },
  {
    id: "changes",
    title: "Request Changes",
    description: "Easily modify or cancel appointments",
    icon: <Clock className="h-6 w-6" />,
    color: "#DC2626",
    details: [
      "Request appointment cancellations",
      "Ask for reschedule options",
      "Submit via email or chat",
      "Receive confirmation of changes",
    ],
    requirements: ["Same email/name used in your profile", "Advance notice per professional's policy"],
  },
]

export default function CustomerJourney() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const toggleExpanded = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Introduction */}
      <div className="bg-gradient-to-r from-[#94ABD6] to-[#b0c1e3] rounded-xl p-8 text-white mb-8">
        <h2 className="text-2xl font-bold mb-4 header-font">Customer Experience Journey</h2>
        <p className="body-font mb-4">
          Discover how easy it is to find, book, and manage pet care services through the Critter ecosystem - no app
          download required for most features.
        </p>
        <div className="flex items-center text-sm opacity-90">
          <Globe className="h-4 w-4 mr-2" />
          <span className="body-font">Most features available directly through your professional's website</span>
        </div>
      </div>

      {/* Journey Steps */}
      <div className="space-y-6">
        {customerSteps.map((step, index) => (
          <div key={step.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div
              className="p-6 text-white relative overflow-hidden cursor-pointer"
              style={{ backgroundColor: step.color }}
              onClick={() => toggleExpanded(step.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                    {step.icon}
                  </div>
                  <div>
                    <div className="text-sm opacity-90 body-font">Step {index + 1}</div>
                    <h3 className="text-xl font-bold header-font">{step.title}</h3>
                    <p className="text-sm opacity-90 body-font">{step.description}</p>
                  </div>
                </div>
                <ArrowRight className={`h-5 w-5 transition-transform ${expandedStep === step.id ? "rotate-90" : ""}`} />
              </div>

              {/* Decorative elements */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white bg-opacity-10 rounded-full" />
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white bg-opacity-5 rounded-full" />
            </div>

            {/* Expandable Content */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                expandedStep === step.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* What You Can Do */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 header-font">What You Can Do</h4>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600 body-font">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Requirements */}
                  {step.requirements && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 header-font">What You'll Need</h4>
                      <ul className="space-y-2">
                        {step.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600 body-font">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 mt-2 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Always visible summary */}
            {expandedStep !== step.id && (
              <div className="p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 body-font">
                    {step.details.length} available actions
                    {step.requirements && ` • ${step.requirements.length} requirements`}
                  </div>
                  <button
                    onClick={() => toggleExpanded(step.id)}
                    className="text-sm text-[#E75837] hover:text-[#d04e30] font-medium body-font"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Key Benefits */}
      <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold mb-6 header-font">Why Choose Critter?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1 header-font">No App Required</h4>
              <p className="text-sm text-gray-600 body-font">
                Access most features directly through your professional's website without downloading anything.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1 header-font">Instant Support</h4>
              <p className="text-sm text-gray-600 body-font">
                Get immediate answers from AI assistants trained on your professional's specific policies.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1 header-font">Easy Booking</h4>
              <p className="text-sm text-gray-600 body-font">
                Request services and manage appointments without creating accounts or remembering passwords.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1 header-font">Complete Access</h4>
              <p className="text-sm text-gray-600 body-font">
                View your schedules, invoices, and service history all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 bg-gradient-to-r from-[#E75837] to-[#f07a5f] rounded-xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-4 header-font">Ready to Experience Better Pet Care?</h3>
        <p className="mb-6 body-font">
          Find a Critter professional in your area and discover how easy pet care booking can be.
        </p>
        <a
          href="/findprofessional"
          className="bg-white text-[#E75837] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors body-font inline-block"
        >
          Find a Professional
        </a>
      </div>
    </div>
  )
}
