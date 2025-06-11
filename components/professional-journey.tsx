"use client"
import { useState } from "react"
import type React from "react"

import {
  Database,
  Settings,
  Calendar,
  Share2,
  X,
  CheckCircle,
  ExternalLink,
  Code,
  Shield,
  User,
  Zap,
  MessageSquare,
  UserPlus,
  TrendingUp,
  Rocket,
  Play,
  RotateCcw,
} from "lucide-react"

type ProcessStep = {
  id: string
  stepNumber: number
  title: string
  description: string
  icon: React.ReactNode
  color: string
  resources: ProcessResource[]
}

type ProcessResource = {
  id: string
  title: string
  description: string
  useCase: string
  url?: string
  icon: React.ReactNode
  color: string
  managedBy: "critter" | "professional"
  capabilities: string[]
  useCaseDetails: {
    title: string
    description: string
    steps: string[]
    connectsTo: {
      setup?: string
      critter?: string
    }
  }
  interactions: {
    title: string
    description: string
    connectedTo: string
    icon: React.ReactNode
  }[]
}

// Critter brand colors
const critterColors = {
  orange: "#E75837", // Primary Critter orange
  purple: "#7C3AED",
  green: "#10B981",
  blue: "#3B82F6",
  pink: "#EC4899",
  background: "#F8FAFC",
  text: "#1E293B",
  lightText: "#64748B",
}

const processSteps: ProcessStep[] = [
  {
    id: "step-1",
    stepNumber: 1,
    title: "Start",
    description: "Build your foundation with the core platform",
    icon: <Rocket className="h-6 w-6" />,
    color: critterColors.orange,
    resources: [
      {
        id: "critter-platform",
        title: "Critter Platform",
        description: "Central hub for all operations",
        useCase: "Complete business management",
        icon: <Database className="h-8 w-8" />,
        color: critterColors.orange,
        managedBy: "critter",
        capabilities: [
          "Customer & pet profiles",
          "Schedule & appointments",
          "Invoicing & payments",
          "Communication center",
          "Service catalog",
          "Business analytics",
          "Mobile & web access",
        ],
        useCaseDetails: {
          title: "Complete Business Management",
          description: "Everything you need to run your pet care business in one place",
          steps: [
            "Add customers and their pets",
            "Create service offerings and pricing",
            "Schedule appointments and manage calendar",
            "Send invoices and process payments",
            "Communicate with customers",
            "Track business performance",
          ],
          connectsTo: {},
        },
        interactions: [],
      },
    ],
  },
  {
    id: "step-2",
    stepNumber: 2,
    title: "Scale",
    description: "Optimize operations with additional tools",
    icon: <Zap className="h-6 w-6" />,
    color: critterColors.purple,
    resources: [
      {
        id: "pro-setup",
        title: "Professional Setup",
        description: "booking.critter.pet/pro/set-up",
        useCase: "Configure business tools",
        url: "/pro/set-up",
        icon: <Settings className="h-8 w-8" />,
        color: critterColors.purple,
        managedBy: "critter",
        capabilities: ["Generate custom intake links", "Configure and deploy AI support agent"],
        useCaseDetails: {
          title: "Configure Business Tools",
          description: "Set up additional resources to enhance your customer experience",
          steps: [
            "Access professional setup portal",
            "Configure AI chatbot with your business data",
            "Generate custom intake links for new customers",
            "Create booking portal access for existing customers",
            "Get implementation code for your website",
          ],
          connectsTo: {
            critter: "Pulls business data from Critter Platform to configure tools",
          },
        },
        interactions: [
          {
            title: "Business Data Sync",
            description: "Pulls your business information from Critter Platform",
            connectedTo: "critter-platform",
            icon: <Database className="h-4 w-4" />,
          },
        ],
      },
    ],
  },
  {
    id: "step-3",
    stepNumber: 3,
    title: "Grow",
    description: "Scale your business with customer-facing tools",
    icon: <TrendingUp className="h-6 w-6" />,
    color: critterColors.green,
    resources: [
      {
        id: "booking-portal",
        title: "Customer Experience",
        description: "booking.critter.pet",
        useCase: "Customer self-service booking",
        url: "https://booking.critter.pet",
        icon: <Calendar className="h-8 w-8" />,
        color: critterColors.green,
        managedBy: "critter",
        capabilities: [
          "Customer booking requests",
          "Service selection",
          "Time preferences",
          "Account verification",
          "Booking modifications",
          "Cancellation requests",
        ],
        useCaseDetails: {
          title: "Customer Self-Service Booking",
          description: "Enable customers to book, modify, and cancel appointments without creating a Critter account",
          steps: [
            "Customer visits booking.critter.pet",
            "Enters their name and email (no account needed)",
            "System verifies they're in your customer database",
            "Customer selects service and preferred time",
            "Booking request sent to your Critter Account",
            "You approve and appointment is confirmed",
          ],
          connectsTo: {
            setup: "Configured through Professional Setup portal",
            critter:
              "All booking requests flow into your Critter Platform. Note: Customers must use the same name and email address that exists in your customer database to access this self-service capability.",
          },
        },
        interactions: [
          {
            title: "Customer Verification",
            description: "Checks customer against your Critter database",
            connectedTo: "critter-platform",
            icon: <CheckCircle className="h-4 w-4" />,
          },
          {
            title: "Portal Configuration",
            description: "Set up through Professional Setup",
            connectedTo: "pro-setup",
            icon: <Settings className="h-4 w-4" />,
          },
        ],
      },
      {
        id: "professional-website",
        title: "Professional Website",
        description: "Your business website",
        useCase: "AI chatbot support",
        icon: <MessageSquare className="h-8 w-8" />,
        color: critterColors.blue,
        managedBy: "professional",
        capabilities: [
          "24/7 AI customer support",
          "Business-specific knowledge",
          "Service information",
          "Pricing details",
          "Availability checking",
          "Custom Training",
        ],
        useCaseDetails: {
          title: "AI Chatbot Support",
          description: "Provide instant customer support with an AI agent that knows your business",
          steps: [
            "Customer visits your website",
            "Clicks on chat widget in corner",
            "AI agent greets them with your custom message",
            "Agent answers questions about services, pricing, hours",
          ],
          connectsTo: {
            setup: "Chatbot configured and code generated in Professional Setup",
            critter: "Trained on your business data from Critter Platform",
          },
        },
        interactions: [
          {
            title: "AI Training Data",
            description: "Chatbot trained on your Critter business data",
            connectedTo: "critter-platform",
            icon: <Database className="h-4 w-4" />,
          },
          {
            title: "Widget Generation",
            description: "Chat widget code generated in Professional Setup",
            connectedTo: "pro-setup",
            icon: <Code className="h-4 w-4" />,
          },
        ],
      },
      {
        id: "social-media",
        title: "Social Media",
        description: "Your social media profiles",
        useCase: "Custom intake links",
        icon: <UserPlus className="h-8 w-8" />,
        color: critterColors.pink,
        managedBy: "professional",
        capabilities: [
          "Custom intake links",
          "New customer onboarding",
          "Service discovery",
          "Lead generation",
          "Social proof",
          "Community building",
        ],
        useCaseDetails: {
          title: "Custom Intake Links",
          description: "Convert social media followers into customers with tailored intake processes",
          steps: [
            "Share your custom intake link on social media",
            "Potential customer clicks link from your post",
            "They complete your custom intake form",
            "System collects customer and pet information",
            "New lead appears in your Critter Platform",
            "You follow up to schedule first appointment",
          ],
          connectsTo: {
            setup: "Custom intake links generated in Professional Setup",
            critter: "All new customer data flows into Critter Platform",
          },
        },
        interactions: [
          {
            title: "Lead Data Flow",
            description: "New customer information flows to Critter Platform",
            connectedTo: "critter-platform",
            icon: <UserPlus className="h-4 w-4" />,
          },
          {
            title: "Link Generation",
            description: "Custom intake links created in Professional Setup",
            connectedTo: "pro-setup",
            icon: <Share2 className="h-4 w-4" />,
          },
        ],
      },
    ],
  },
]

export default function ProfessionalJourney() {
  const [selectedResource, setSelectedResource] = useState<string | null>(null)
  const [hoveredInteraction, setHoveredInteraction] = useState<string | null>(null)

  const selectedResourceData = processSteps
    .flatMap((step) => step.resources)
    .find((resource) => resource.id === selectedResource)

  const getConnectedResourceTitle = (resourceId: string) => {
    const resource = processSteps.flatMap((step) => step.resources).find((r) => r.id === resourceId)
    return resource?.title || resourceId
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold header-font mb-3 text-[#1E293B]">Your Business Growth Journey</h2>
          <p className="text-lg text-[#64748B] body-font max-w-2xl mx-auto">
            Three steps to transform your pet care business with the Critter ecosystem
          </p>
        </div>

        {/* Process Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Start Step */}
          <div className="bg-[#F8FAFC] rounded-2xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 shadow-md"
                style={{ backgroundColor: processSteps[0].color }}
              >
                {processSteps[0].icon}
              </div>
              <div>
                <div className="text-xs font-medium text-[#64748B] body-font">Step {processSteps[0].stepNumber}</div>
                <div className="text-xl font-bold text-[#1E293B] header-font">{processSteps[0].title}</div>
              </div>
            </div>

            <div className="space-y-4">
              {processSteps[0].resources.map((resource) => (
                <div key={resource.id} className="relative">
                  <div
                    className="bg-white rounded-xl p-5 shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-100 h-full min-h-[280px] flex flex-col"
                    onClick={() => setSelectedResource(selectedResource === resource.id ? null : resource.id)}
                  >
                    {/* Resource Header */}
                    <div className="flex items-center mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white mr-3 shadow-sm"
                        style={{ backgroundColor: resource.color }}
                      >
                        {resource.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-[#1E293B] header-font">{resource.title}</h3>
                        <p className="text-xs text-[#64748B] body-font">{resource.description}</p>
                        <div
                          className={`mt-1 inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                            resource.managedBy === "critter"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {resource.managedBy === "critter" ? (
                            <>
                              <Shield className="h-2 w-2 mr-1" /> Critter Managed
                            </>
                          ) : (
                            <>
                              <User className="h-2 w-2 mr-1" /> You Manage
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Use Case */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-[#64748B] body-font">{resource.useCase}</p>
                    </div>

                    {/* Quick Capabilities - flex-grow to fill remaining space */}
                    <div className="space-y-1 flex-grow">
                      {resource.capabilities.slice(0, 2).map((capability, idx) => (
                        <div key={idx} className="flex items-center text-xs text-[#64748B] body-font">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                          {capability}
                        </div>
                      ))}
                      {resource.capabilities.length > 2 && (
                        <div className="text-xs text-[#64748B] body-font">
                          +{resource.capabilities.length - 2} more capabilities
                        </div>
                      )}
                    </div>

                    {/* Click to explore - always at bottom */}
                    <div className="mt-3 text-center">
                      <span className="text-xs text-[#3B82F6] body-font">Click to explore →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scale Step */}
          <div className="bg-[#F8FAFC] rounded-2xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 shadow-md"
                style={{ backgroundColor: processSteps[1].color }}
              >
                {processSteps[1].icon}
              </div>
              <div>
                <div className="text-xs font-medium text-[#64748B] body-font">Step {processSteps[1].stepNumber}</div>
                <div className="text-xl font-bold text-[#1E293B] header-font">{processSteps[1].title}</div>
              </div>
            </div>

            <div className="space-y-4">
              {processSteps[1].resources.map((resource) => (
                <div key={resource.id} className="relative">
                  <div
                    className="bg-white rounded-xl p-5 shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-100 h-full min-h-[280px] flex flex-col"
                    onClick={() => setSelectedResource(selectedResource === resource.id ? null : resource.id)}
                  >
                    {/* Resource Header */}
                    <div className="flex items-center mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white mr-3 shadow-sm"
                        style={{ backgroundColor: resource.color }}
                      >
                        {resource.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-[#1E293B] header-font">{resource.title}</h3>
                        <p className="text-xs text-[#64748B] body-font">{resource.description}</p>
                        <div
                          className={`mt-1 inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                            resource.managedBy === "critter"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {resource.managedBy === "critter" ? (
                            <>
                              <Shield className="h-2 w-2 mr-1" /> Critter Managed
                            </>
                          ) : (
                            <>
                              <User className="h-2 w-2 mr-1" /> You Manage
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Use Case */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-[#64748B] body-font">{resource.useCase}</p>
                    </div>

                    {/* Quick Capabilities - flex-grow to fill remaining space */}
                    <div className="space-y-1 flex-grow">
                      {resource.capabilities.slice(0, 2).map((capability, idx) => (
                        <div key={idx} className="flex items-center text-xs text-[#64748B] body-font">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                          {capability}
                        </div>
                      ))}
                      {resource.capabilities.length > 2 && (
                        <div className="text-xs text-[#64748B] body-font">
                          +{resource.capabilities.length - 2} more capabilities
                        </div>
                      )}
                    </div>

                    {/* Click to explore - always at bottom */}
                    <div className="mt-3 text-center">
                      <span className="text-xs text-[#3B82F6] body-font">Click to explore →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grow Step - Full Width */}
          <div className="lg:col-span-2 bg-[#F8FAFC] rounded-2xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 shadow-md"
                style={{ backgroundColor: processSteps[2].color }}
              >
                {processSteps[2].icon}
              </div>
              <div>
                <div className="text-xs font-medium text-[#64748B] body-font">Step {processSteps[2].stepNumber}</div>
                <div className="text-xl font-bold text-[#1E293B] header-font">{processSteps[2].title}</div>
              </div>
            </div>

            {/* Horizontal layout for all 3 Grow resources */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {processSteps[2].resources.map((resource) => (
                <div key={resource.id} className="relative">
                  <div
                    className="bg-white rounded-xl p-5 shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-100 h-full min-h-[280px] flex flex-col"
                    onClick={() => setSelectedResource(selectedResource === resource.id ? null : resource.id)}
                  >
                    {/* Resource Header */}
                    <div className="flex items-center mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white mr-3 shadow-sm"
                        style={{ backgroundColor: resource.color }}
                      >
                        {resource.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-[#1E293B] header-font">{resource.title}</h3>
                        <p className="text-xs text-[#64748B] body-font">{resource.description}</p>
                        <div
                          className={`mt-1 inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                            resource.managedBy === "critter"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {resource.managedBy === "critter" ? (
                            <>
                              <Shield className="h-2 w-2 mr-1" /> Critter Managed
                            </>
                          ) : (
                            <>
                              <User className="h-2 w-2 mr-1" /> You Manage
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Use Case */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-[#64748B] body-font">{resource.useCase}</p>
                    </div>

                    {/* Quick Capabilities */}
                    <div className="space-y-1 flex-grow">
                      {resource.capabilities.slice(0, 2).map((capability, idx) => (
                        <div key={idx} className="flex items-center text-xs text-[#64748B] body-font">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                          {capability}
                        </div>
                      ))}
                      {resource.capabilities.length > 2 && (
                        <div className="text-xs text-[#64748B] body-font">
                          +{resource.capabilities.length - 2} more capabilities
                        </div>
                      )}
                    </div>

                    {/* Click to explore */}
                    <div className="mt-3 text-center">
                      <span className="text-xs text-[#3B82F6] body-font">Click to explore →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Dynamic Side Panel */}
      {selectedResourceData && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto border-l border-gray-200">
          <div className="p-6">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white mr-4 shadow-md"
                  style={{ backgroundColor: selectedResourceData.color }}
                >
                  {selectedResourceData.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold header-font text-[#1E293B]">{selectedResourceData.title}</h3>
                  <p className="text-[#64748B] body-font text-sm mb-2">{selectedResourceData.description}</p>
                  <div
                    className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium ${
                      selectedResourceData.managedBy === "critter"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {selectedResourceData.managedBy === "critter" ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" /> Critter Managed
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 mr-1" /> You Manage
                      </>
                    )}
                  </div>
                  {selectedResourceData.url && (
                    <a
                      href={selectedResourceData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3B82F6] hover:text-blue-700 text-sm body-font flex items-center mt-2"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Visit Resource
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Use Case Details */}
            <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <h4 className="font-bold text-[#1E293B] mb-2 header-font flex items-center">
                <Play className="h-4 w-4 mr-2" />
                {selectedResourceData.useCaseDetails.title}
              </h4>
              <p className="text-sm text-[#64748B] body-font mb-4">{selectedResourceData.useCaseDetails.description}</p>

              <div className="space-y-2">
                <div className="text-sm font-medium text-[#1E293B] header-font">How it works:</div>
                {selectedResourceData.useCaseDetails.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start text-sm text-[#64748B] body-font">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                      {idx + 1}
                    </div>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Ecosystem Connections */}
            {(selectedResourceData.useCaseDetails.connectsTo.setup ||
              selectedResourceData.useCaseDetails.connectsTo.critter) && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-xl">
                <h4 className="font-bold text-[#1E293B] mb-3 header-font flex items-center">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Ecosystem Connections
                </h4>
                <div className="space-y-3">
                  {selectedResourceData.useCaseDetails.connectsTo.setup && (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3 flex-shrink-0">
                        <Settings className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#1E293B] header-font">Professional Setup</div>
                        <div className="text-xs text-[#64748B] body-font">
                          {selectedResourceData.useCaseDetails.connectsTo.setup}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedResourceData.useCaseDetails.connectsTo.critter && (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-[#E75837] flex items-center justify-center mr-3 flex-shrink-0">
                        <Database className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#1E293B] header-font">Critter Platform</div>
                        <div className="text-xs text-[#64748B] body-font">
                          {selectedResourceData.useCaseDetails.connectsTo.critter}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* All Capabilities */}
            <div className="mb-6">
              <h4 className="font-bold text-[#1E293B] mb-3 header-font">All Capabilities</h4>
              <ul className="space-y-2">
                {selectedResourceData.capabilities.map((capability, idx) => (
                  <li key={idx} className="flex items-start text-sm text-[#64748B] body-font">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {capability}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="pt-6 border-t border-gray-200">
              <h4 className="font-bold text-[#1E293B] mb-3 header-font">Quick Actions</h4>
              <div className="space-y-3">
                {selectedResourceData.id === "critter-platform" && (
                  <a
                    href="https://app.critter.pet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#E75837] text-white px-4 py-3 rounded-xl hover:bg-[#d14e30] transition-all text-sm font-medium body-font flex items-center justify-center shadow-md"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Go to Critter Platform
                  </a>
                )}
                {selectedResourceData.url &&
                  selectedResourceData.id !== "critter-platform" &&
                  (selectedResourceData.id === "professional-website" ? (
                    <a
                      href="/pro/set-up#chatbot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#E75837] text-white px-4 py-3 rounded-xl hover:bg-[#d14e30] transition-all text-sm font-medium body-font flex items-center justify-center shadow-md"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Chatbot Set-up
                    </a>
                  ) : (
                    <a
                      href={selectedResourceData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#E75837] text-white px-4 py-3 rounded-xl hover:bg-[#d14e30] transition-all text-sm font-medium body-font flex items-center justify-center shadow-md"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Access {selectedResourceData.title}
                    </a>
                  ))}
                <button
                  onClick={() => setSelectedResource(null)}
                  className="w-full bg-gray-100 text-[#1E293B] px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium body-font"
                >
                  Explore Other Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Overlay */}
      {selectedResourceData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
          onClick={() => setSelectedResource(null)}
        />
      )}
    </div>
  )
}
