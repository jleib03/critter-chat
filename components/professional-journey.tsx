"use client"
import { useState } from "react"
import type React from "react"

import {
  Database,
  Settings,
  Globe,
  Calendar,
  Share2,
  X,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Code,
  Shield,
  User,
  Zap,
  ArrowDown,
} from "lucide-react"

type EcosystemNode = {
  id: string
  title: string
  description: string
  url?: string
  icon: React.ReactNode
  color: string
  gradientFrom: string
  gradientTo: string
  size: "medium" | "large"
  type: "hub" | "resource"
  managedBy: "critter" | "professional"
  capabilities: string[]
  interactions: {
    title: string
    description: string
    connectedTo: string
    icon: React.ReactNode
  }[]
}

const ecosystemNodes: EcosystemNode[] = [
  {
    id: "critter-platform",
    title: "Critter Platform",
    description: "Central hub orchestrating your entire ecosystem",
    icon: <Database className="h-12 w-12" />,
    color: "#E75837",
    gradientFrom: "#E75837",
    gradientTo: "#f07a5f",
    size: "large",
    type: "hub",
    managedBy: "critter",
    capabilities: [
      "Customer & pet management",
      "Schedule & appointments",
      "Invoicing & payments",
      "Communication center",
      "Service catalog",
      "Business analytics",
      "Mobile & web access",
      "Data synchronization",
    ],
    interactions: [
      {
        title: "Sync Customer Data",
        description: "All customer interactions flow back to central profiles",
        connectedTo: "booking-portal",
        icon: <Database className="h-4 w-4" />,
      },
      {
        title: "Generate Resources",
        description: "Creates intake links and chat widgets via pro setup",
        connectedTo: "pro-setup",
        icon: <Settings className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "pro-setup",
    title: "Professional Setup",
    description: "booking.critter.pet/pro/set-up",
    url: "/pro/set-up",
    icon: <Settings className="h-8 w-8" />,
    color: "#7C3AED",
    gradientFrom: "#7C3AED",
    gradientTo: "#A855F7",
    size: "medium",
    type: "resource",
    managedBy: "critter",
    capabilities: [
      "Generate custom intake links",
      "Configure AI support agent",
      "Create booking URLs",
      "Customize branding",
      "Deploy website widgets",
      "Manage integrations",
    ],
    interactions: [
      {
        title: "Generate Chat Widget",
        description: "Creates embeddable chat code for your website",
        connectedTo: "professional-website",
        icon: <Code className="h-4 w-4" />,
      },
      {
        title: "Create Intake Links",
        description: "Generates shareable links for social media",
        connectedTo: "social-media",
        icon: <Share2 className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "booking-portal",
    title: "Booking Portal",
    description: "booking.critter.pet",
    url: "https://booking.critter.pet",
    icon: <Calendar className="h-8 w-8" />,
    color: "#059669",
    gradientFrom: "#059669",
    gradientTo: "#10B981",
    size: "medium",
    type: "resource",
    managedBy: "critter",
    capabilities: [
      "Customer booking requests",
      "Service selection",
      "Time preferences",
      "Account verification",
      "No-app-required access",
      "Professional validation",
    ],
    interactions: [
      {
        title: "Verify Customer Identity",
        description: "Checks against your Critter customer database",
        connectedTo: "critter-platform",
        icon: <CheckCircle className="h-4 w-4" />,
      },
      {
        title: "Embed Booking Links",
        description: "Add direct booking links to your website",
        connectedTo: "professional-website",
        icon: <ExternalLink className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "professional-website",
    title: "Professional Website",
    description: "Your business website",
    icon: <Globe className="h-8 w-8" />,
    color: "#2563EB",
    gradientFrom: "#2563EB",
    gradientTo: "#3B82F6",
    size: "medium",
    type: "resource",
    managedBy: "professional",
    capabilities: [
      "Embed chat widget",
      "Add intake buttons",
      "Include booking links",
      "Display service info",
      "Customer testimonials",
      "Contact information",
    ],
    interactions: [
      {
        title: "Embed Chat Widget",
        description: "Add AI support chat generated from pro setup",
        connectedTo: "pro-setup",
        icon: <Code className="h-4 w-4" />,
      },
      {
        title: "Direct Booking Access",
        description: "Link to booking portal for existing customers",
        connectedTo: "booking-portal",
        icon: <Calendar className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "social-media",
    title: "Social Media",
    description: "Your social media profiles",
    icon: <Share2 className="h-8 w-8" />,
    color: "#EC4899",
    gradientFrom: "#EC4899",
    gradientTo: "#F472B6",
    size: "medium",
    type: "resource",
    managedBy: "professional",
    capabilities: [
      "Share intake links",
      "Post booking URLs",
      "Customer testimonials",
      "Service showcases",
      "Direct messaging",
      "Community building",
    ],
    interactions: [
      {
        title: "Share Intake Links",
        description: "Post custom intake URLs generated from pro setup",
        connectedTo: "pro-setup",
        icon: <Share2 className="h-4 w-4" />,
      },
      {
        title: "Booking Link Posts",
        description: "Share direct booking portal access",
        connectedTo: "booking-portal",
        icon: <Calendar className="h-4 w-4" />,
      },
    ],
  },
]

export default function ProfessionalJourney() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredInteraction, setHoveredInteraction] = useState<string | null>(null)

  const selectedNodeData = ecosystemNodes.find((node) => node.id === selectedNode)
  const hubNode = ecosystemNodes.find((node) => node.type === "hub")
  const resourceNodes = ecosystemNodes.filter((node) => node.type === "resource")
  const critterManagedNodes = resourceNodes.filter((node) => node.managedBy === "critter")
  const professionalManagedNodes = resourceNodes.filter((node) => node.managedBy === "professional")

  const getConnectedNodeTitle = (nodeId: string) => {
    const node = ecosystemNodes.find((n) => n.id === nodeId)
    return node?.title || nodeId
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 mb-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold header-font mb-4 bg-gradient-to-r from-[#E75837] to-[#7C3AED] bg-clip-text text-transparent">
            Critter Ecosystem
          </h2>
          <p className="text-xl text-gray-600 body-font max-w-3xl mx-auto">
            One platform that powers your entire pet care business ecosystem
          </p>
        </div>

        {/* Top Resource Row */}
        <div className="flex justify-center items-center gap-8 mb-12">
          {critterManagedNodes.map((node, index) => (
            <div key={node.id} className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${node.gradientFrom}, ${node.gradientTo})`,
                }}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              >
                {node.icon}
              </div>
              <div className="mt-3 text-center">
                <div className="text-sm font-bold text-gray-800 header-font">{node.title}</div>
                <div className="text-xs text-gray-600 body-font max-w-32">{node.description}</div>
                <div className="mt-1 inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                  <Shield className="h-3 w-3 mr-1" />
                  Critter Managed
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connection Lines */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <ArrowDown className="h-6 w-6 text-gray-400" />
            <div className="w-16 h-0.5 bg-gray-300"></div>
          </div>
        </div>

        {/* Central Hub */}
        {hubNode && (
          <div className="flex justify-center mb-8">
            <div className="flex flex-col items-center">
              <div
                className="w-32 h-32 rounded-3xl flex items-center justify-center text-white shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 relative"
                style={{
                  background: `linear-gradient(135deg, ${hubNode.gradientFrom}, ${hubNode.gradientTo})`,
                }}
                onClick={() => setSelectedNode(selectedNode === hubNode.id ? null : hubNode.id)}
              >
                {/* Central hub glow effect */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-30 blur-xl"
                  style={{
                    background: `linear-gradient(135deg, ${hubNode.gradientFrom}, ${hubNode.gradientTo})`,
                  }}
                ></div>
                <div className="relative z-10">{hubNode.icon}</div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-yellow-800" />
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-bold text-gray-800 header-font">{hubNode.title}</div>
                <div className="text-sm text-gray-600 body-font max-w-48">{hubNode.description}</div>
                <div className="mt-2 inline-flex items-center text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                  <Shield className="h-4 w-4 mr-1" />
                  Critter Managed
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connection Lines */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <ArrowDown className="h-6 w-6 text-gray-400" />
            <div className="w-16 h-0.5 bg-gray-300"></div>
          </div>
        </div>

        {/* Bottom Resource Row */}
        <div className="flex justify-center items-center gap-8">
          {professionalManagedNodes.map((node, index) => (
            <div key={node.id} className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${node.gradientFrom}, ${node.gradientTo})`,
                }}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              >
                {node.icon}
              </div>
              <div className="mt-3 text-center">
                <div className="text-sm font-bold text-gray-800 header-font">{node.title}</div>
                <div className="text-xs text-gray-600 body-font max-w-32">{node.description}</div>
                <div className="mt-1 inline-flex items-center text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                  <User className="h-3 w-3 mr-1" />
                  You Manage
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Management Legend */}
        <div className="flex justify-center space-x-8 mt-12">
          <div className="flex items-center bg-white bg-opacity-80 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
            <Shield className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <div className="text-sm font-bold text-gray-800 header-font">Critter Managed</div>
              <div className="text-xs text-gray-600 body-font">We host and maintain these for you</div>
            </div>
          </div>
          <div className="flex items-center bg-white bg-opacity-80 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
            <User className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <div className="text-sm font-bold text-gray-800 header-font">You Manage</div>
              <div className="text-xs text-gray-600 body-font">Your resources enhanced by Critter</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Dynamic Side Panel */}
      {selectedNodeData && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto border-l border-gray-200">
          <div className="p-6">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${selectedNodeData.gradientFrom}, ${selectedNodeData.gradientTo})`,
                  }}
                >
                  {selectedNodeData.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold header-font">{selectedNodeData.title}</h3>
                  <p className="text-gray-600 body-font text-sm mb-2">{selectedNodeData.description}</p>
                  <div
                    className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium ${
                      selectedNodeData.managedBy === "critter"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {selectedNodeData.managedBy === "critter" ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" /> Critter Managed
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 mr-1" /> You Manage
                      </>
                    )}
                  </div>
                  {selectedNodeData.url && (
                    <a
                      href={selectedNodeData.url}
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
                onClick={() => setSelectedNode(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Management Context */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-2 header-font">Management Context</h4>
              <p className="text-sm text-gray-600 body-font">
                {selectedNodeData.managedBy === "critter"
                  ? "This resource is hosted and maintained by Critter. You configure it once, and we handle the rest."
                  : "This is your own resource that you control. Critter provides tools and integrations to enhance it."}
              </p>
            </div>

            {/* Capabilities */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-3 header-font">Key Capabilities</h4>
              <ul className="space-y-2">
                {selectedNodeData.capabilities.map((capability, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600 body-font">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {capability}
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactions */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3 header-font">Resource Interactions</h4>
              <div className="space-y-3">
                {selectedNodeData.interactions.map((interaction, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-xl p-4 transition-all cursor-pointer ${
                      hoveredInteraction === `${selectedNodeData.id}-${idx}`
                        ? "border-blue-300 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onMouseEnter={() => setHoveredInteraction(`${selectedNodeData.id}-${idx}`)}
                    onMouseLeave={() => setHoveredInteraction(null)}
                  >
                    <div className="flex items-start">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 flex-shrink-0"
                        style={{
                          backgroundColor: `${selectedNodeData.color}20`,
                          color: selectedNodeData.color,
                        }}
                      >
                        {interaction.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm header-font">{interaction.title}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 body-font mb-2">{interaction.description}</p>
                        <div className="flex items-center text-xs">
                          <span className="text-gray-500 body-font">Connects to:</span>
                          <span className="ml-1 font-medium text-blue-600 body-font">
                            {getConnectedNodeTitle(interaction.connectedTo)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3 header-font">Quick Actions</h4>
              <div className="space-y-3">
                {selectedNodeData.url && (
                  <a
                    href={selectedNodeData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium body-font flex items-center justify-center shadow-lg"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access {selectedNodeData.title}
                  </a>
                )}
                <button
                  onClick={() => setSelectedNode(null)}
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
      {selectedNodeData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
          onClick={() => setSelectedNode(null)}
        />
      )}

      {/* Instructions */}
      {!selectedNode && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 header-font text-center">How It All Works Together</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2 header-font">Critter Managed</h4>
              <p className="text-sm text-gray-600 body-font">
                We host and maintain the core platform, booking portal, and professional setup tools.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2 header-font">Central Hub</h4>
              <p className="text-sm text-gray-600 body-font">
                Critter Platform orchestrates data flow and functionality across your entire ecosystem.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2 header-font">Your Resources</h4>
              <p className="text-sm text-gray-600 body-font">
                Enhance your existing website and social media with Critter-powered tools and integrations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
