"use client"
import { useState } from "react"
import type React from "react"

import {
  Smartphone,
  Users,
  Database,
  Settings,
  UserPlus,
  Globe,
  MessageSquare,
  Calendar,
  ArrowRight,
  CheckCircle,
  ArrowUpRight,
  Zap,
  Share2,
} from "lucide-react"

type ConnectionType = "to-critter" | "from-critter" | "bidirectional"

type Connection = {
  id: string
  from: string
  to: string
  type: ConnectionType
  label: string
  description: string
  dataFlow: string[]
}

const connections: Connection[] = [
  {
    id: "intake-to-critter",
    from: "intake-process",
    to: "critter-hub",
    type: "to-critter",
    label: "New Customer Data",
    description: "Customer intake flows into Critter",
    dataFlow: ["Customer details", "Pet information", "Service preferences", "Contact info"],
  },
  {
    id: "booking-to-critter",
    from: "booking-site",
    to: "critter-hub",
    type: "to-critter",
    label: "Booking Requests",
    description: "Booking requests flow to professional's Critter account",
    dataFlow: ["Service requests", "Preferred times", "Special instructions", "Customer verification"],
  },
  {
    id: "critter-to-agent",
    from: "critter-hub",
    to: "support-agent",
    type: "from-critter",
    label: "Business Data",
    description: "Critter data trains the support agent",
    dataFlow: ["Service catalog", "Pricing info", "Policies", "Availability", "Customer history"],
  },
  {
    id: "pro-setup-to-website",
    from: "pro-setup",
    to: "website",
    type: "from-critter",
    label: "Generated Resources",
    description: "Pro setup generates links and code for website",
    dataFlow: ["Intake links", "Chat widget code", "Booking URLs", "Branding assets"],
  },
  {
    id: "website-to-customers",
    from: "website",
    to: "customers",
    type: "bidirectional",
    label: "Customer Interaction",
    description: "Customers interact through professional's website",
    dataFlow: ["Service discovery", "Booking requests", "Support queries", "Information access"],
  },
]

type EcosystemNode = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  position: { x: number; y: number }
  size: "small" | "medium" | "large"
  type: "hub" | "resource" | "external" | "customer"
  details: string[]
}

const ecosystemNodes: EcosystemNode[] = [
  {
    id: "critter-hub",
    title: "Critter Platform",
    description: "Central hub for all professional activities",
    icon: <Database className="h-8 w-8" />,
    color: "#E75837",
    position: { x: 50, y: 50 },
    size: "large",
    type: "hub",
    details: [
      "Customer & pet management",
      "Schedule & appointments",
      "Invoicing & payments",
      "Communication center",
      "Service catalog",
      "Business analytics",
    ],
  },
  {
    id: "pro-setup",
    title: "Professional Setup",
    description: "booking.critter.pet/pro/set-up",
    icon: <Settings className="h-6 w-6" />,
    color: "#7C3AED",
    position: { x: 20, y: 20 },
    size: "medium",
    type: "resource",
    details: ["Generate intake links", "Configure support agent", "Customize branding", "Deploy resources"],
  },
  {
    id: "booking-site",
    title: "Booking Portal",
    description: "booking.critter.pet",
    icon: <Calendar className="h-6 w-6" />,
    color: "#059669",
    position: { x: 80, y: 20 },
    size: "medium",
    type: "resource",
    details: ["Customer booking requests", "Service selection", "Time preferences", "Account verification"],
  },
  {
    id: "intake-process",
    title: "Custom Intake",
    description: "Tailored onboarding experience",
    icon: <UserPlus className="h-6 w-6" />,
    color: "#DC2626",
    position: { x: 20, y: 80 },
    size: "medium",
    type: "resource",
    details: ["New customer onboarding", "Pet information collection", "Service preferences", "Emergency contacts"],
  },
  {
    id: "support-agent",
    title: "AI Support Agent",
    description: "Intelligent customer support",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "#EA580C",
    position: { x: 80, y: 80 },
    size: "medium",
    type: "resource",
    details: ["24/7 customer support", "Business-specific knowledge", "Instant responses", "Seamless handoff"],
  },
  {
    id: "website",
    title: "Professional Website",
    description: "Your business website",
    icon: <Globe className="h-6 w-6" />,
    color: "#2563EB",
    position: { x: 50, y: 15 },
    size: "medium",
    type: "external",
    details: ["Intake button integration", "Chat widget", "Booking links", "Social media sharing"],
  },
  {
    id: "customers",
    title: "Your Customers",
    description: "Pet owners seeking services",
    icon: <Users className="h-6 w-6" />,
    color: "#16A34A",
    position: { x: 50, y: 85 },
    size: "medium",
    type: "customer",
    details: ["Service discovery", "Easy booking", "Account-free access", "Instant support"],
  },
]

export default function ProfessionalJourney() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null)
  const [showDataFlow, setShowDataFlow] = useState(false)

  const getConnectionPath = (from: EcosystemNode, to: EcosystemNode) => {
    const startX = from.position.x
    const startY = from.position.y
    const endX = to.position.x
    const endY = to.position.y

    // Create a curved path
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2
    const offset = 15 // Curve offset

    return `M ${startX} ${startY} Q ${midX + offset} ${midY - offset} ${endX} ${endY}`
  }

  const getNodeByPosition = (nodeId: string) => {
    return ecosystemNodes.find((node) => node.id === nodeId)
  }

  const getConnectionColor = (type: ConnectionType) => {
    switch (type) {
      case "to-critter":
        return "#059669"
      case "from-critter":
        return "#7C3AED"
      case "bidirectional":
        return "#EA580C"
      default:
        return "#6B7280"
    }
  }

  const getArrowMarker = (type: ConnectionType) => {
    switch (type) {
      case "to-critter":
        return "url(#arrow-to-critter)"
      case "from-critter":
        return "url(#arrow-from-critter)"
      case "bidirectional":
        return "url(#arrow-bidirectional)"
      default:
        return "url(#arrow-default)"
    }
  }

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold header-font">Critter Ecosystem Overview</h3>
          <button
            onClick={() => setShowDataFlow(!showDataFlow)}
            className={`px-4 py-2 rounded-lg transition-colors body-font ${
              showDataFlow ? "bg-[#E75837] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {showDataFlow ? "Hide" : "Show"} Data Flow
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-1 bg-[#059669] mr-2"></div>
            <span className="body-font">Data to Critter</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-[#7C3AED] mr-2"></div>
            <span className="body-font">Data from Critter</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-[#EA580C] mr-2"></div>
            <span className="body-font">Bidirectional</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#E75837] rounded-full mr-2"></div>
            <span className="body-font">Central Hub</span>
          </div>
        </div>
      </div>

      {/* Main Ecosystem Diagram */}
      <div className="bg-white rounded-xl shadow-lg p-8 overflow-hidden">
        <div className="relative w-full h-[600px]">
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              {/* Arrow markers */}
              <marker
                id="arrow-to-critter"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#059669" />
              </marker>
              <marker
                id="arrow-from-critter"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#7C3AED" />
              </marker>
              <marker
                id="arrow-bidirectional"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#EA580C" />
              </marker>
            </defs>

            {/* Connection lines */}
            {connections.map((connection) => {
              const fromNode = getNodeByPosition(connection.from)
              const toNode = getNodeByPosition(connection.to)
              if (!fromNode || !toNode) return null

              const isHovered = hoveredConnection === connection.id
              const opacity = showDataFlow ? (isHovered ? 1 : 0.7) : 0.3

              return (
                <g key={connection.id}>
                  <path
                    d={getConnectionPath(fromNode, toNode)}
                    stroke={getConnectionColor(connection.type)}
                    strokeWidth={isHovered ? "3" : "2"}
                    fill="none"
                    opacity={opacity}
                    markerEnd={getArrowMarker(connection.type)}
                    className="transition-all duration-300"
                  />
                  {isHovered && showDataFlow && (
                    <text
                      x={(fromNode.position.x + toNode.position.x) / 2}
                      y={(fromNode.position.y + toNode.position.y) / 2 - 10}
                      textAnchor="middle"
                      className="fill-gray-700 text-xs font-medium"
                    >
                      {connection.label}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Ecosystem nodes */}
          {ecosystemNodes.map((node) => {
            const isSelected = selectedNode === node.id
            const isHub = node.type === "hub"
            const sizeClasses = {
              small: "w-16 h-16",
              medium: "w-20 h-20",
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
                onMouseEnter={() => {
                  if (showDataFlow) {
                    const relatedConnections = connections.filter(
                      (conn) => conn.from === node.id || conn.to === node.id,
                    )
                    if (relatedConnections.length > 0) {
                      setHoveredConnection(relatedConnections[0].id)
                    }
                  }
                }}
                onMouseLeave={() => setHoveredConnection(null)}
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
                </div>

                {/* Node label */}
                <div className="mt-2 text-center">
                  <div className="text-sm font-bold text-gray-800 header-font">{node.title}</div>
                  <div className="text-xs text-gray-600 body-font max-w-24">{node.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          {(() => {
            const node = ecosystemNodes.find((n) => n.id === selectedNode)
            if (!node) return null

            const relatedConnections = connections.filter((conn) => conn.from === node.id || conn.to === node.id)

            return (
              <div>
                <div className="flex items-center mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white mr-4"
                    style={{ backgroundColor: node.color }}
                  >
                    {node.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold header-font">{node.title}</h3>
                    <p className="text-gray-600 body-font">{node.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Node capabilities */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 header-font">Key Capabilities</h4>
                    <ul className="space-y-2">
                      {node.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600 body-font">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Data connections */}
                  {relatedConnections.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 header-font">Data Connections</h4>
                      <div className="space-y-3">
                        {relatedConnections.map((connection) => (
                          <div key={connection.id} className="border rounded-lg p-3">
                            <div className="flex items-center mb-2">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: getConnectionColor(connection.type) }}
                              />
                              <span className="text-sm font-medium header-font">{connection.label}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 body-font">{connection.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {connection.dataFlow.slice(0, 3).map((data, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded body-font"
                                >
                                  {data}
                                </span>
                              ))}
                              {connection.dataFlow.length > 3 && (
                                <span className="text-xs text-gray-500 body-font">
                                  +{connection.dataFlow.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Data Flow Legend */}
      {showDataFlow && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 header-font">Understanding the Data Flow</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ArrowRight className="h-5 w-5 text-[#059669] mr-2" />
                <span className="font-medium header-font">To Critter Hub</span>
              </div>
              <p className="text-sm text-gray-600 body-font">
                Customer data, booking requests, and interactions flow into the central Critter platform for
                professional management.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ArrowUpRight className="h-5 w-5 text-[#7C3AED] mr-2" />
                <span className="font-medium header-font">From Critter Hub</span>
              </div>
              <p className="text-sm text-gray-600 body-font">
                Business information, generated resources, and configuration data flow out to power external tools and
                websites.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Share2 className="h-5 w-5 text-[#EA580C] mr-2" />
                <span className="font-medium header-font">Bidirectional</span>
              </div>
              <p className="text-sm text-gray-600 body-font">
                Continuous two-way communication ensures real-time updates and seamless customer experiences.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Start Guide */}
      <div className="bg-gradient-to-r from-[#E75837] to-[#f07a5f] rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4 header-font">Ready to Build Your Ecosystem?</h3>
        <p className="mb-6 body-font">
          Start with the Critter platform, then expand with additional resources to create a seamless customer
          experience.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="https://critter.pet"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-colors"
          >
            <div className="flex items-center mb-2">
              <Smartphone className="h-5 w-5 mr-2" />
              <span className="font-medium body-font">1. Get Critter</span>
            </div>
            <p className="text-sm opacity-90 body-font">Download the app or join via webapp</p>
          </a>

          <a href="/pro/set-up" className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-colors">
            <div className="flex items-center mb-2">
              <Settings className="h-5 w-5 mr-2" />
              <span className="font-medium body-font">2. Configure Resources</span>
            </div>
            <p className="text-sm opacity-90 body-font">Set up intake, booking, and support tools</p>
          </a>

          <a
            href="/findprofessional"
            className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-colors"
          >
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 mr-2" />
              <span className="font-medium body-font">3. Serve Customers</span>
            </div>
            <p className="text-sm opacity-90 body-font">Provide seamless booking and support</p>
          </a>
        </div>
      </div>
    </div>
  )
}
