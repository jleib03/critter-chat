"use client"
import { useState, useEffect } from "react"
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
  Zap,
  Shield,
  User,
} from "lucide-react"

type EcosystemNode = {
  id: string
  title: string
  description: string
  url?: string
  icon: React.ReactNode
  color: string
  position: { angle: number; radius: number }
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
    icon: <Database className="h-10 w-10" />,
    color: "#E75837",
    position: { angle: 0, radius: 0 },
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
    icon: <Settings className="h-7 w-7" />,
    color: "#7C3AED",
    position: { angle: 45, radius: 180 },
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
    icon: <Calendar className="h-7 w-7" />,
    color: "#059669",
    position: { angle: 135, radius: 180 },
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
    icon: <Globe className="h-7 w-7" />,
    color: "#2563EB",
    position: { angle: 225, radius: 180 },
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
    icon: <Share2 className="h-7 w-7" />,
    color: "#EC4899",
    position: { angle: 315, radius: 180 },
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
  const [orbitRotation, setOrbitRotation] = useState(0)

  const selectedNodeData = ecosystemNodes.find((node) => node.id === selectedNode)

  // Continuous orbit rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setOrbitRotation((prev) => (prev + 0.5) % 360)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const getConnectedNodeTitle = (nodeId: string) => {
    const node = ecosystemNodes.find((n) => n.id === nodeId)
    return node?.title || nodeId
  }

  const getNodePosition = (node: EcosystemNode) => {
    if (node.type === "hub") {
      return { x: 50, y: 50 }
    }

    const adjustedAngle = (node.position.angle + orbitRotation) * (Math.PI / 180)
    const x = 50 + (node.position.radius / 4) * Math.cos(adjustedAngle)
    const y = 50 + (node.position.radius / 4) * Math.sin(adjustedAngle)

    return { x, y }
  }

  return (
    <div className="relative">
      {/* Main Ecosystem Diagram */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-2xl shadow-2xl p-8 overflow-hidden relative">
        {/* Background orbital rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 border border-gray-200 rounded-full opacity-30" />
          <div className="absolute w-80 h-80 border border-gray-300 rounded-full opacity-20" />
          <div className="absolute w-64 h-64 border border-gray-400 rounded-full opacity-10" />
        </div>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold header-font mb-2 bg-gradient-to-r from-[#E75837] to-[#7C3AED] bg-clip-text text-transparent">
            Critter Ecosystem
          </h2>
          <p className="text-gray-600 body-font">Click any resource to explore capabilities and interactions</p>
        </div>

        <div className="relative w-full h-[600px]">
          {/* Central hub energy rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 bg-gradient-to-r from-[#E75837] to-[#f07a5f] rounded-full opacity-10 animate-pulse" />
            <div
              className="absolute w-32 h-32 bg-gradient-to-r from-[#E75837] to-[#f07a5f] rounded-full opacity-20 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="absolute w-24 h-24 bg-gradient-to-r from-[#E75837] to-[#f07a5f] rounded-full opacity-30 animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>

          {/* Ecosystem nodes */}
          {ecosystemNodes.map((node) => {
            const isSelected = selectedNode === node.id
            const isHub = node.type === "hub"
            const position = getNodePosition(node)

            const sizeClasses = {
              medium: "w-20 h-20",
              large: "w-28 h-28",
            }

            return (
              <div
                key={node.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 ${
                  isSelected ? "scale-110 z-30" : "z-20 hover:scale-105"
                }`}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              >
                {/* Node circle with gradient and glow */}
                <div
                  className={`${sizeClasses[node.size]} rounded-full flex items-center justify-center text-white shadow-2xl relative overflow-hidden backdrop-blur-sm`}
                  style={{
                    background: isHub
                      ? `linear-gradient(135deg, ${node.color}, #f07a5f)`
                      : `linear-gradient(135deg, ${node.color}, ${node.color}dd)`,
                    boxShadow: isSelected
                      ? `0 0 30px ${node.color}66, 0 10px 25px rgba(0,0,0,0.2)`
                      : `0 0 15px ${node.color}33, 0 5px 15px rgba(0,0,0,0.1)`,
                  }}
                >
                  {/* Conductor animation for hub */}
                  {isHub && (
                    <>
                      <div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-spin"
                        style={{ animationDuration: "3s" }}
                      />
                      <div className="absolute inset-2 rounded-full border-2 border-white border-opacity-30 animate-pulse" />
                    </>
                  )}

                  {/* Icon */}
                  <div className="relative z-10">{node.icon}</div>

                  {/* Management badge */}
                  <div
                    className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      node.managedBy === "critter" ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                    }`}
                  >
                    {node.managedBy === "critter" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  </div>

                  {/* Selection ring */}
                  {isSelected && (
                    <div className="absolute -inset-3 rounded-full border-3 border-white opacity-80 animate-pulse" />
                  )}
                </div>

                {/* Node label with enhanced styling */}
                <div className="mt-4 text-center max-w-32">
                  <div className="text-sm font-bold text-gray-800 header-font">{node.title}</div>
                  <div className="text-xs text-gray-600 body-font mb-1">{node.description}</div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      node.managedBy === "critter" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {node.managedBy === "critter" ? "Critter Managed" : "You Manage"}
                  </div>
                </div>

                {/* Connection indicators */}
                {selectedNode && selectedNode !== node.id && (
                  <div className="absolute inset-0 pointer-events-none">
                    {selectedNodeData?.interactions
                      .filter((interaction) => interaction.connectedTo === node.id)
                      .map((interaction, idx) => (
                        <div
                          key={idx}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-bounce shadow-lg"
                          style={{ animationDelay: `${idx * 0.2}s` }}
                        >
                          <Zap className="h-3 w-3 text-white" />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Enhanced connection lines */}
          {selectedNodeData && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 15 }}>
              <defs>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {selectedNodeData.interactions.map((interaction, idx) => {
                const targetNode = ecosystemNodes.find((n) => n.id === interaction.connectedTo)
                if (!targetNode) return null

                const startPos = getNodePosition(selectedNodeData)
                const endPos = getNodePosition(targetNode)

                return (
                  <line
                    key={idx}
                    x1={`${startPos.x}%`}
                    y1={`${startPos.y}%`}
                    x2={`${endPos.x}%`}
                    y2={`${endPos.y}%`}
                    stroke="url(#connectionGradient)"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    className="animate-pulse"
                    style={{ filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))" }}
                  />
                )
              })}
            </svg>
          )}
        </div>

        {/* Management legend */}
        <div className="flex justify-center space-x-6 mt-6 relative z-10">
          <div className="flex items-center bg-white bg-opacity-70 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <Shield className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700 body-font">Critter Managed</span>
          </div>
          <div className="flex items-center bg-white bg-opacity-70 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <User className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700 body-font">You Manage</span>
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
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white mr-4 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${selectedNodeData.color}, ${selectedNodeData.color}dd)`,
                    boxShadow: `0 0 20px ${selectedNodeData.color}33`,
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
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      hoveredInteraction === `${selectedNodeData.id}-${idx}`
                        ? "border-blue-300 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onMouseEnter={() => setHoveredInteraction(`${selectedNodeData.id}-${idx}`)}
                    onMouseLeave={() => setHoveredInteraction(null)}
                  >
                    <div className="flex items-start">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                        style={{ backgroundColor: `${selectedNodeData.color}20`, color: selectedNodeData.color }}
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
              <div className="space-y-2">
                {selectedNodeData.url && (
                  <a
                    href={selectedNodeData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium body-font flex items-center justify-center shadow-lg"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access {selectedNodeData.title}
                  </a>
                )}
                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium body-font"
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

      {/* Enhanced Instructions */}
      {!selectedNode && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-2 header-font">How Critter Orchestrates Your Ecosystem</h3>
          <p className="text-gray-600 body-font mb-4">
            Critter acts as the central conductor, coordinating data and functionality across all your business
            touchpoints. Click any resource to see how it connects to the ecosystem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center bg-white bg-opacity-70 rounded-lg p-3">
              <div className="w-3 h-3 bg-[#E75837] rounded-full mr-3"></div>
              <span className="body-font">Central Hub - Orchestrates everything</span>
            </div>
            <div className="flex items-center bg-white bg-opacity-70 rounded-lg p-3">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
              <span className="body-font">Connected Resources - Powered by Critter</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
