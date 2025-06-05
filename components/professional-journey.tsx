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
  ArrowDown,
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
  subtitle: string
  description: string
  icon: React.ReactNode
  color: string
  gradientFrom: string
  gradientTo: string
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
  gradientFrom: string
  gradientTo: string
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

const processSteps: ProcessStep[] = [
  {
    id: "step-1",
    stepNumber: 1,
    title: "Get Your Business Up and Running",
    subtitle: "Foundation",
    description: "Start with the core platform to manage your pet care business",
    icon: <Rocket className="h-8 w-8" />,
    color: "#E75837",
    gradientFrom: "#E75837",
    gradientTo: "#f07a5f",
    resources: [
      {
        id: "critter-platform",
        title: "Critter Platform",
        description: "Central hub for all business operations",
        useCase: "Complete business management",
        icon: <Database className="h-10 w-10" />,
        color: "#E75837",
        gradientFrom: "#E75837",
        gradientTo: "#f07a5f",
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
    title: "Run Faster",
    subtitle: "Optimization",
    description: "Configure additional tools to streamline operations",
    icon: <Zap className="h-8 w-8" />,
    color: "#7C3AED",
    gradientFrom: "#7C3AED",
    gradientTo: "#A855F7",
    resources: [
      {
        id: "pro-setup",
        title: "Professional Setup",
        description: "booking.critter.pet/pro/set-up",
        useCase: "Configure business tools",
        url: "/pro/set-up",
        icon: <Settings className="h-10 w-10" />,
        color: "#7C3AED",
        gradientFrom: "#7C3AED",
        gradientTo: "#A855F7",
        managedBy: "critter",
        capabilities: [
          "Generate custom intake links",
          "Configure AI support agent",
          "Create booking URLs",
          "Customize branding",
          "Deploy website widgets",
          "Manage integrations",
        ],
        useCaseDetails: {
          title: "Configure Business Tools",
          description: "Set up additional resources to enhance your customer experience",
          steps: [
            "Access professional setup portal",
            "Configure AI chatbot with your business data",
            "Generate custom intake links for new customers",
            "Create booking portal access for existing customers",
            "Customize branding and messaging",
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
    subtitle: "Expansion",
    description: "Deploy customer-facing tools to scale your business",
    icon: <TrendingUp className="h-8 w-8" />,
    color: "#059669",
    gradientFrom: "#059669",
    gradientTo: "#10B981",
    resources: [
      {
        id: "booking-portal",
        title: "Booking Portal",
        description: "booking.critter.pet",
        useCase: "Customer self-service booking",
        url: "https://booking.critter.pet",
        icon: <Calendar className="h-8 w-8" />,
        color: "#059669",
        gradientFrom: "#059669",
        gradientTo: "#10B981",
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
          description: "Let customers book, modify, and cancel appointments without calling you",
          steps: [
            "Customer visits booking.critter.pet",
            "Enters their name and email (no account needed)",
            "System verifies they're in your customer database",
            "Customer selects service and preferred time",
            "Booking request sent to your Critter Platform",
            "You approve and appointment is confirmed",
          ],
          connectsTo: {
            setup: "Configured through Professional Setup portal",
            critter: "All booking requests flow into your Critter Platform",
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
        color: "#2563EB",
        gradientFrom: "#2563EB",
        gradientTo: "#3B82F6",
        managedBy: "professional",
        capabilities: [
          "24/7 AI customer support",
          "Business-specific knowledge",
          "Service information",
          "Pricing details",
          "Availability checking",
          "Seamless handoff to you",
        ],
        useCaseDetails: {
          title: "AI Chatbot Support",
          description: "Provide instant customer support with an AI agent that knows your business",
          steps: [
            "Customer visits your website",
            "Clicks on chat widget in corner",
            "AI agent greets them with your custom message",
            "Agent answers questions about services, pricing, hours",
            "For complex issues, seamlessly hands off to you",
            "All conversations logged in your Critter Platform",
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
        color: "#EC4899",
        gradientFrom: "#EC4899",
        gradientTo: "#F472B6",
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
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 mb-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold header-font mb-4 bg-gradient-to-r from-[#E75837] to-[#7C3AED] bg-clip-text text-transparent">
            Your Business Growth Journey
          </h2>
          <p className="text-xl text-gray-600 body-font max-w-3xl mx-auto">
            Three steps to transform your pet care business with the Critter ecosystem
          </p>
        </div>

        {/* Process Steps */}
        <div className="space-y-12">
          {processSteps.map((step, stepIndex) => (
            <div key={step.id} className="relative">
              {/* Step Header */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-lg">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white mr-4"
                    style={{
                      background: `linear-gradient(135deg, ${step.gradientFrom}, ${step.gradientTo})`,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 body-font">Step {step.stepNumber}</div>
                    <div className="text-lg font-bold text-gray-800 header-font">{step.title}</div>
                    <div className="text-sm text-gray-600 body-font">{step.description}</div>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {step.resources.map((resource) => (
                  <div key={resource.id} className="relative">
                    <div
                      className="bg-white rounded-2xl p-6 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100"
                      onClick={() => setSelectedResource(selectedResource === resource.id ? null : resource.id)}
                    >
                      {/* Resource Header */}
                      <div className="flex items-center mb-4">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mr-4"
                          style={{
                            background: `linear-gradient(135deg, ${resource.gradientFrom}, ${resource.gradientTo})`,
                          }}
                        >
                          {resource.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 header-font">{resource.title}</h3>
                          <p className="text-sm text-gray-600 body-font">{resource.description}</p>
                          <div
                            className={`mt-2 inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${
                              resource.managedBy === "critter"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {resource.managedBy === "critter" ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" /> Critter Managed
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3 mr-1" /> You Manage
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Use Case */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center mb-2">
                          <Play className="h-4 w-4 text-gray-600 mr-2" />
                          <span className="text-sm font-medium text-gray-800 header-font">Primary Use Case</span>
                        </div>
                        <p className="text-sm text-gray-600 body-font">{resource.useCase}</p>
                      </div>

                      {/* Quick Capabilities */}
                      <div className="space-y-2">
                        {resource.capabilities.slice(0, 3).map((capability, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600 body-font">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {capability}
                          </div>
                        ))}
                        {resource.capabilities.length > 3 && (
                          <div className="text-xs text-gray-500 body-font">
                            +{resource.capabilities.length - 3} more capabilities
                          </div>
                        )}
                      </div>

                      {/* Connections Indicator */}
                      {resource.interactions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center text-xs text-gray-500 body-font">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Connects to {resource.interactions.length} other resource
                            {resource.interactions.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      )}

                      {/* Click to explore */}
                      <div className="mt-4 text-center">
                        <span className="text-xs text-blue-600 body-font">Click to explore use case →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Connection Arrow to Next Step */}
              {stepIndex < processSteps.length - 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-0.5 bg-gray-300"></div>
                    <ArrowDown className="h-6 w-6 text-gray-400" />
                    <div className="w-16 h-0.5 bg-gray-300"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
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
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${selectedResourceData.gradientFrom}, ${selectedResourceData.gradientTo})`,
                  }}
                >
                  {selectedResourceData.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold header-font">{selectedResourceData.title}</h3>
                  <p className="text-gray-600 body-font text-sm mb-2">{selectedResourceData.description}</p>
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
                      className="text-blue-600 hover:text-blue-800 text-sm body-font flex items-center mt-2"
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
              <h4 className="font-bold text-gray-800 mb-2 header-font flex items-center">
                <Play className="h-4 w-4 mr-2" />
                {selectedResourceData.useCaseDetails.title}
              </h4>
              <p className="text-sm text-gray-600 body-font mb-4">{selectedResourceData.useCaseDetails.description}</p>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 header-font">How it works:</div>
                {selectedResourceData.useCaseDetails.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start text-sm text-gray-600 body-font">
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
                <h4 className="font-bold text-gray-800 mb-3 header-font flex items-center">
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
                        <div className="text-sm font-medium text-gray-800 header-font">Professional Setup</div>
                        <div className="text-xs text-gray-600 body-font">
                          {selectedResourceData.useCaseDetails.connectsTo.setup}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedResourceData.useCaseDetails.connectsTo.critter && (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 flex-shrink-0">
                        <Database className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800 header-font">Critter Platform</div>
                        <div className="text-xs text-gray-600 body-font">
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
              <h4 className="font-bold text-gray-800 mb-3 header-font">All Capabilities</h4>
              <ul className="space-y-2">
                {selectedResourceData.capabilities.map((capability, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600 body-font">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {capability}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="pt-6 border-t border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3 header-font">Quick Actions</h4>
              <div className="space-y-3">
                {selectedResourceData.url && (
                  <a
                    href={selectedResourceData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium body-font flex items-center justify-center shadow-lg"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access {selectedResourceData.title}
                  </a>
                )}
                <button
                  onClick={() => setSelectedResource(null)}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium body-font"
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

      {/* Summary */}
      {!selectedResource && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 header-font text-center">Ready to Start Your Journey?</h3>
          <p className="text-gray-600 body-font text-center mb-6">
            Begin with Step 1 and progressively unlock more powerful tools as your business grows.
          </p>
          <div className="flex justify-center">
            <a
              href="https://critter.pet"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#E75837] to-[#7C3AED] text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all text-lg font-medium body-font flex items-center"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Start with Critter Platform
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
