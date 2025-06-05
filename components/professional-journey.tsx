"use client"
import { useState, useEffect } from "react"
import type React from "react"

import {
  Smartphone,
  Users,
  Database,
  Rocket,
  Settings,
  UserPlus,
  Globe,
  MessageSquare,
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Palette,
  Code,
  Mail,
  Clock,
} from "lucide-react"

type Step = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  details: string[]
  subSteps?: {
    id: string
    title: string
    description: string
    icon: React.ReactNode
  }[]
}

const steps: Step[] = [
  {
    id: "download",
    title: "Download & Join Critter",
    description: "Get started with the Critter platform",
    icon: <Smartphone className="h-6 w-6" />,
    color: "#E75837",
    details: [
      "Download from App Store or Google Play",
      "Join via webapp at critter.pet",
      "Complete professional registration",
    ],
  },
  {
    id: "onboarding",
    title: "Ecosystem Introduction",
    description: "Learn about the complete Critter ecosystem",
    icon: <Users className="h-6 w-6" />,
    color: "#745E25",
    details: [
      "Receive onboarding communication",
      "Understand platform capabilities",
      "Learn about additional resources",
    ],
  },
  {
    id: "platform",
    title: "Critter Platform Hub",
    description: "Your central command center for all activities",
    icon: <Database className="h-6 w-6" />,
    color: "#94ABD6",
    details: [
      "Fully enabled on web and mobile",
      "Manage schedules and appointments",
      "Handle customer communications",
      "Process invoices and payments",
      "Create pet care plans",
    ],
  },
  {
    id: "setup",
    title: "Build Your Customer Base",
    description: "Set up your customer and pet database",
    icon: <Database className="h-6 w-6" />,
    color: "#2D5A87",
    details: [
      "Build customer/pet list manually",
      "Partner with Critter team for data migration",
      "Streamline initial setup process",
    ],
  },
  {
    id: "ready",
    title: "Ready to Launch",
    description: "Your foundation is set - now access additional resources",
    icon: <Rocket className="h-6 w-6" />,
    color: "#16A34A",
    details: ["Platform fully configured", "Customer base established", "Ready for additional tools"],
  },
  {
    id: "hub",
    title: "Professional Hub Access",
    description: "Deploy additional resources via booking.critter.pet",
    icon: <Settings className="h-6 w-6" />,
    color: "#7C3AED",
    details: [
      "Access booking.critter.pet/pro/set-up",
      "Choose from available resources",
      "Customize for your business needs",
    ],
  },
  {
    id: "intake",
    title: "Resource #1: Custom Intake Process",
    description: "Drive new customers through a tailored intake experience",
    icon: <UserPlus className="h-6 w-6" />,
    color: "#DC2626",
    details: [
      "Get your specific intake link",
      "Implement on your website as a button",
      "Share directly on social media",
      "Receive new leads and referrals",
      "Add customers to Critter platform",
      "Begin on-platform onboarding",
    ],
    subSteps: [
      {
        id: "intake-link",
        title: "Get Your Link",
        description: "Generate custom intake URL",
        icon: <ExternalLink className="h-4 w-4" />,
      },
      {
        id: "intake-implement",
        title: "Website Integration",
        description: "Add button to your site",
        icon: <Code className="h-4 w-4" />,
      },
      {
        id: "intake-leads",
        title: "Receive Leads",
        description: "New customers complete intake",
        icon: <Mail className="h-4 w-4" />,
      },
      {
        id: "intake-onboard",
        title: "Platform Onboarding",
        description: "Add to Critter & schedule",
        icon: <Calendar className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "agent",
    title: "Resource #2: Customer Support Agent",
    description: "Deploy an AI agent that knows your business",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "#059669",
    details: [
      "Enroll in the agent service",
      "Add custom training data",
      "Automatic Critter platform integration",
      "Customize appearance and messaging",
      "Follow implementation instructions",
    ],
    subSteps: [
      {
        id: "agent-enroll",
        title: "Service Enrollment",
        description: "Sign up for custom agent",
        icon: <CheckCircle className="h-4 w-4" />,
      },
      {
        id: "agent-train",
        title: "Training & Data",
        description: "Add business-specific info",
        icon: <Database className="h-4 w-4" />,
      },
      {
        id: "agent-customize",
        title: "Customize Appearance",
        description: "Brand colors & messaging",
        icon: <Palette className="h-4 w-4" />,
      },
      {
        id: "agent-deploy",
        title: "Website Deployment",
        description: "Add code to your site",
        icon: <Globe className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "customer-resources",
    title: "Customer-Facing Resources",
    description: "Tools your customers can access without Critter accounts",
    icon: <Globe className="h-6 w-6" />,
    color: "#EA580C",
    details: [
      "Intake process for new customers",
      "Booking requests for existing customers",
      "Schedule and invoice access",
      "Cancellation/reschedule requests",
    ],
    subSteps: [
      {
        id: "customer-intake",
        title: "New Customer Intake",
        description: "Streamlined onboarding",
        icon: <UserPlus className="h-4 w-4" />,
      },
      {
        id: "customer-booking",
        title: "Booking Requests",
        description: "No account needed",
        icon: <Calendar className="h-4 w-4" />,
      },
      {
        id: "customer-info",
        title: "Schedule & Invoices",
        description: "Access existing information",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: "customer-changes",
        title: "Cancellation/Reschedule",
        description: "Request changes via email",
        icon: <Clock className="h-4 w-4" />,
      },
    ],
  },
]

export default function ProfessionalJourney() {
  const [activeStep, setActiveStep] = useState<string>("download")
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const stepElements = steps.map((step) => document.getElementById(`step-${step.id}`))
      const scrollPosition = window.scrollY + window.innerHeight / 2

      for (let i = stepElements.length - 1; i >= 0; i--) {
        const element = stepElements[i]
        if (element && element.offsetTop <= scrollPosition) {
          setActiveStep(steps[i].id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleExpanded = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId)
  }

  return (
    <div className="relative">
      {/* Progress Timeline */}
      <div className="fixed left-8 top-1/2 transform -translate-y-1/2 z-10 hidden lg:block">
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-bold text-sm mb-3 header-font">Professional Journey</h3>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center text-xs cursor-pointer transition-colors ${
                  activeStep === step.id ? "text-[#E75837] font-medium" : "text-gray-500"
                }`}
                onClick={() => {
                  document.getElementById(`step-${step.id}`)?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${activeStep === step.id ? "bg-[#E75837]" : "bg-gray-300"}`}
                />
                <span className="body-font">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-16">
        {steps.map((step, index) => (
          <div key={step.id} id={`step-${step.id}`} className="relative">
            {/* Connection Line */}
            {index < steps.length - 1 && <div className="absolute left-8 top-20 w-0.5 h-16 bg-gray-200 z-0" />}

            {/* Step Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden relative z-10">
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
                  <ArrowRight
                    className={`h-5 w-5 transition-transform ${expandedStep === step.id ? "rotate-90" : ""}`}
                  />
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
                    {/* Main Details */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 header-font">Key Activities</h4>
                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600 body-font">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Sub-steps if available */}
                    {step.subSteps && (
                      <div>
                        <h4 className="font-bold text-gray-800 mb-3 header-font">Process Breakdown</h4>
                        <div className="space-y-3">
                          {step.subSteps.map((subStep, idx) => (
                            <div key={subStep.id} className="flex items-start">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                                style={{ backgroundColor: `${step.color}20`, color: step.color }}
                              >
                                {subStep.icon}
                              </div>
                              <div>
                                <div className="font-medium text-sm text-gray-800 header-font">{subStep.title}</div>
                                <div className="text-xs text-gray-600 body-font">{subStep.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
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
                      {step.details.length} key activities
                      {step.subSteps && ` • ${step.subSteps.length} process steps`}
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
          </div>
        ))}

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-[#E75837] to-[#f07a5f] rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4 header-font">Ready to Get Started?</h3>
          <p className="mb-6 body-font">
            Join thousands of pet care professionals using Critter to streamline their business operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/pro/set-up"
              className="bg-white text-[#E75837] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors body-font"
            >
              Access Professional Hub
            </a>
            <a
              href="https://critter.pet"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-[#E75837] transition-colors body-font"
            >
              Download Critter App
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
