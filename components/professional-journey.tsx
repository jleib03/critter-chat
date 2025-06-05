"use client"
import { useState } from "react"
import type React from "react"

import {
  Database,
  Settings,
  Globe,
  Calendar,
  MessageSquare,
  Users,
  UserPlus,
  Share2,
  X,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Code,
  Zap,
} from "lucide-react"

type EcosystemNode = {
  id: string
  title: string
  description: string
  url?: string
  icon: React.ReactNode
  color: string
  position: { x: number; y: number }
  size: "medium" | "large"
  type: "hub" | "resource"
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
    description: "Central hub for all professional activities",
    icon: <Database className="h-8 w-8" />,
    color: "#E75837",
    position: { x: 50, y: 50 },
    size: "large",
    type: "hub",
    capabilities: [
      "Customer & pet management",
      "Schedule & appointments",
      "Invoicing & payments",
      "Communication center",
      "Service catalog",
      "Business analytics",
      "Mobile & web access",
    ],
    interactions: [
      {
        title: "Sync Customer Data",
        description: "All customer interactions flow back to central profiles",
        connectedTo: "booking-portal",
        icon: <Users className="h-4 w-4" />,
      },
      {
        title: "Business Data Export",
        description: "Powers AI agent with your business information",
        connectedTo: "ai-support",
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
    icon: <Settings className="h-6 w-6" />,
    color: "#7C3AED",
    position: { x: 20, y: 20 },
    size: "medium",
    type: "resource",
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
      {
        title: "Configure AI Agent",
        description: "Sets up intelligent support using your business data",
        connectedTo: "ai-support",
        icon: <MessageSquare className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "booking-portal",
    title: "Booking Portal",
    description: "booking.critter.pet",
    url: "https://booking.critter.pet",
    icon: <Calendar className="h-6 w-6" />,
    color: "#059669",
    position: { x: 80, y: 20 },
    size: "medium",
    type: "resource",
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
      {
        title: "Share on Social",
        description: "Post booking links directly to social media",
        connectedTo: "social-media",
        icon: <Share2 className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "professional-website",
    title: "Professional Website",
    description: "Your business website",
    icon: <Globe className="h-6 w-6" />,
    color: "#2563EB",
    position: { x: 80, y: 80 },
    size: "medium",
    type: "resource",
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
        title: "Intake Button Integration",
        description: "Add custom intake process as website button",
        connectedTo: "custom-intake",
        icon: <UserPlus className="h-4 w-4" />,
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
    icon: <Share2 className="h-6 w-6" />,
    color: "#EC4899",
    position: { x: 20, y: 80 },
    size: "medium",
    type: "resource",
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
        icon: <UserPlus className="h-4 w-4" />,
      },
      {
        title: "Booking Link Posts",
        description: "Share direct booking portal access",
        connectedTo: "booking-portal",
        icon: <Calendar className="h-4 w-4" />,
      },
      {
        title: "Customer Stories",
        description: "Showcase success stories from your Critter platform",
        connectedTo: "critter-platform",
        icon: <Users className="h-4 w-4" />,
      },
    ],
  },
]

// Additional nodes that can be referenced in interactions
const additionalNodes = [
  {
    id: "custom-intake",
    title: "Custom Intake",
    description: "Tailored onboarding experience",
  },
  {
    id: "ai-support",
    title: "AI Support Agent",
    description: "Intelligent customer support",
  },
]

export default function ProfessionalJourney() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredInteraction, setHoveredInteraction] = useState<string | null>(null)

  const selectedNodeData = ecosystemNodes.find((node) => node.id === selectedNode)

  const getConnectedNodeTitle = (nodeId: string) => {
    const node = ecosystemNodes.find((n) => n.id === nodeId) || additionalNodes.find((n) => n.id === nodeId)
    return node?.title || nodeId
  }

  return (
    <div className="relative">
      {/* Main Ecosystem Diagram */}
      <div className="bg-white rounded-xl shadow-lg p-8 overflow-hidden">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold header-font mb-2">Critter Ecosystem Overview</h2>
          <p className="text-gray-600 body-font">Click any resource to explore capabilities and interactions</p>
        </div>

        <div className="relative w-full h-[500px]">
          {/* Ecosystem nodes */}
          {ecosystemNodes.map((node) => {
            const isSelected = selectedNode === node.id
            const isHub = node.type === "hub"
            const sizeClasses = {
              medium: "w-24 h-24",
              large: "w-32 h-32",
            }

            return (
              <div
                key={node.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                  isSelected ? "scale-110 z-20" : "z-10 hover:scale-105"
                }`}
                style={{
                  left: `${node.position.x}%`,
                  top: `${node.position.y}%`,
                }}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              >
                {/* Node circle */}
                <div
                  className={`${sizeClasses[node.size]} rounded-full flex items-center justify-center text-white shadow-lg relative overflow-hidden`}
                  style={{ backgroundColor: node.color }}
                >
                  {/* Pulse animation for hub */}
                  {isHub && (
                    <div
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{ backgroundColor: node.color, opacity: 0.3 }}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative z-10">{node.icon}</div>

                  {/* Hub indicator */}
                  {isHub && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-yellow-800" />
                    </div>
                  )}

                  {/* Selection ring */}
                  {isSelected && (
                    <div className="absolute -inset-2 rounded-full border-3 border-white opacity-80 animate-pulse" />
                  )}
                </div>

                {/* Node label */}
                <div className="mt-3 text-center max-w-32">
                  <div className="text-sm font-bold text-gray-800 header-font">{node.title}</div>
                  <div className="text-xs text-gray-600 body-font">{node.description}</div>
                </div>

                {/* Interaction indicators */}
                {selectedNode && selectedNode !== node.id && (
                  <div className="absolute inset-0 pointer-events-none">
                    {selectedNodeData?.interactions
                      .filter((interaction) => interaction.connectedTo === node.id)
                      .map((interaction, idx) => (
                        <div
                          key={idx}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-bounce"
                          style={{ animationDelay: `${idx * 0.2}s` }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Connection lines for selected node */}
          {selectedNodeData && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
              {selectedNodeData.interactions.map((interaction, idx) => {
                const targetNode = ecosystemNodes.find((n) => n.id === interaction.connectedTo)
                if (!targetNode) return null

                const startX = selectedNodeData.position.x
                const startY = selectedNodeData.position.y
                const endX = targetNode.position.x
                const endY = targetNode.position.y

                return (
                  <line
                    key={idx}
                    x1={`${startX}%`}
                    y1={`${startY}%`}
                    x2={`${endX}%`}
                    y2={`${endY}%`}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.6"
                    className="animate-pulse"
                  />
                )
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Dynamic Side Panel */}
      {selectedNodeData && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white mr-4"
                  style={{ backgroundColor: selectedNodeData.color }}
                >
                  {selectedNodeData.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold header-font">{selectedNodeData.title}</h3>
                  <p className="text-gray-600 body-font text-sm">{selectedNodeData.description}</p>
                  {selectedNodeData.url && (
                    <a
                      href={selectedNodeData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm body-font flex items-center mt-1"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Visit Resource
                    </a>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
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
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
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

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3 header-font">Quick Actions</h4>
              <div className="space-y-2">
                {selectedNodeData.url && (
                  <a
                    href={selectedNodeData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium body-font flex items-center justify-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access {selectedNodeData.title}
                  </a>
                )}
                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium body-font"
                >
                  Explore Other Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay when panel is open */}
      {selectedNodeData && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setSelectedNode(null)} />
      )}

      {/* Instructions */}
      {!selectedNode && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-2 header-font">How to Use This Ecosystem</h3>
          <p className="text-gray-600 body-font mb-4">
            Click on any resource to see its capabilities and how it connects with other parts of the Critter ecosystem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#E75837] rounded-full mr-2"></div>
              <span className="body-font">Central Hub - Your command center</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="body-font">Connected Resources - Powered by Critter</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
