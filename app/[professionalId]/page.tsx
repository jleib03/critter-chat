"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  UserPlus,
  MessageCircle,
  ArrowRight,
  Scissors,
  Loader2,
} from "lucide-react"
import Header from "../../components/header"
import LiveChatWidget from "../../components/live-chat-widget"
import { loadChatConfig } from "../../utils/chat-config"
import { loadProfessionalLandingData, getDefaultProfessionalData } from "../../utils/professional-landing-config"
import { getServiceIcon, getServiceColor } from "../../utils/service-icons"
import type { ChatAgentConfig } from "../../types/chat-config"
import type { ProfessionalLandingData, ServiceGroup } from "../../utils/professional-landing-config"

export default function ProfessionalLandingPage() {
  const params = useParams()
  const professionalId = params.professionalId as string
  const [professionalData, setProfessionalData] = useState<ProfessionalLandingData | null>(null)
  const [chatConfig, setChatConfig] = useState<ChatAgentConfig | null>(null)
  const [isChatConfigLoading, setIsChatConfigLoading] = useState(true)
  const [isProfessionalDataLoading, setIsProfessionalDataLoading] = useState(true)
  const [isChatEnabled, setIsChatEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to load professional data
  const loadProfessionalData = async (forceRefresh = false) => {
    setIsProfessionalDataLoading(true)

    try {
      console.log("📊 Loading professional landing data...")
      const landingData = await loadProfessionalLandingData(professionalId, forceRefresh)

      if (landingData) {
        console.log("✅ Professional data loaded successfully")
        setProfessionalData(landingData)
        setError(null)
      } else {
        console.log("⚠️ Using default professional data")
        setProfessionalData(getDefaultProfessionalData(professionalId))
        setError("Could not load professional information")
      }
    } catch (error) {
      console.error("💥 Failed to load professional data:", error)
      setProfessionalData(getDefaultProfessionalData(professionalId))
      setError("Failed to load professional information")
    } finally {
      setIsProfessionalDataLoading(false)
    }
  }

  // Function to check if chat config is valid (not empty)
  const isValidChatConfig = (config: any): boolean => {
    if (!config) return false

    // Check if it's an empty object or has no meaningful properties
    const keys = Object.keys(config)
    if (keys.length === 0) return false

    // Check if all values are empty/null/undefined
    const hasValidValues = keys.some((key) => {
      const value = config[key]
      return value !== null && value !== undefined && value !== ""
    })

    return hasValidValues
  }

  // Load professional data and chat configuration
  useEffect(() => {
    const loadData = async () => {
      console.log("🔍 Loading data for professional ID:", professionalId)

      // Load professional landing data (with caching)
      await loadProfessionalData(false)

      // Load chat configuration
      setIsChatConfigLoading(true)
      try {
        console.log("💬 Loading chat configuration...")
        const config = await loadChatConfig(professionalId)

        if (config && isValidChatConfig(config)) {
          console.log("✅ Valid chat config loaded successfully")
          setChatConfig(config)
          setIsChatEnabled(true)
        } else {
          console.log("⚠️ No valid chat config found - disabling chat feature")
          setChatConfig(null)
          setIsChatEnabled(false)
        }
      } catch (error) {
        console.error("💥 Failed to load chat config:", error)
        console.log("❌ Chat feature disabled due to error")
        setChatConfig(null)
        setIsChatEnabled(false)
      } finally {
        setIsChatConfigLoading(false)
      }
    }

    loadData()
  }, [professionalId])

  const getCurrentDayHours = () => {
    if (!professionalData) return { open: "9:00 AM", close: "6:00 PM", isOpen: true }

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const today = days[new Date().getDay()]
    return professionalData.working_hours[today] || { open: "9:00 AM", close: "6:00 PM", isOpen: true }
  }

  // Show loading state while data is being fetched
  if (isProfessionalDataLoading) {
    return (
      <div className="min-h-screen bg-[#FBF8F3]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#E75837]" />
            <p className="text-gray-600 body-font">Loading professional information...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if data couldn't be loaded
  if (!professionalData) {
    return (
      <div className="min-h-screen bg-[#FBF8F3]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 body-font mb-4">Failed to load professional information</p>
            <button
              onClick={() => loadProfessionalData(true)}
              className="px-4 py-2 bg-[#E75837] text-white rounded-lg hover:bg-[#d04e30] transition-colors body-font"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const todayHours = getCurrentDayHours()

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Header />

      <main className="pt-8">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Professional Info */}
              <div className="lg:col-span-2">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-20 h-20 bg-[#E75837] rounded-full flex items-center justify-center">
                    <Scissors className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 title-font">{professionalData.name}</h1>
                    <p className="text-xl text-gray-600 mb-4 body-font">{professionalData.tagline}</p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6 body-font">{professionalData.description}</p>

                {/* Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-[#E75837]" />
                    <div>
                      <p className="font-medium body-font">
                        {professionalData.location.city}, {professionalData.location.state}
                      </p>
                      <p className="text-sm body-font">{professionalData.location.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-5 h-5 text-[#E75837]" />
                    <div>
                      <p className="font-medium body-font">
                        {todayHours.isOpen ? `Open today: ${todayHours.open} - ${todayHours.close}` : "Closed today"}
                      </p>
                      <p className="text-sm body-font">See all hours below</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <a
                    href={`tel:${professionalData.contact.phone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors body-font"
                  >
                    <Phone className="w-4 h-4" />
                    {professionalData.contact.phone}
                  </a>
                  <a
                    href={`mailto:${professionalData.contact.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors body-font"
                  >
                    <Mail className="w-4 h-4" />
                    {professionalData.contact.email}
                  </a>
                  {professionalData.contact.website && (
                    <a
                      href={`https://${professionalData.contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors body-font"
                    >
                      <span>🌐</span>
                      {professionalData.contact.website}
                    </a>
                  )}
                </div>

                {/* Specialties - Moved up from services section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 header-font">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {professionalData.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#E75837]/10 text-[#E75837] rounded-full text-sm font-medium body-font"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Cards */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#E75837] to-[#d04e30] rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 header-font">Book an Appointment</h3>
                  <p className="text-white/90 mb-4 body-font">Schedule your pet's service online</p>
                  <Link
                    href={`/schedule/${professionalId}`}
                    className="inline-flex items-center gap-2 bg-white text-[#E75837] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors body-font"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="bg-gradient-to-br from-[#745E25] to-[#5d4b1e] rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 header-font">New Customer?</h3>
                  <p className="text-white/90 mb-4 body-font">Complete our quick intake process</p>
                  <Link
                    href={`/newcustomer/${professionalId}`}
                    className="inline-flex items-center gap-2 bg-white text-[#745E25] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors body-font"
                  >
                    <UserPlus className="w-4 h-4" />
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Conditionally render chat card only if chat is enabled */}
                {isChatEnabled && (
                  <div className="bg-gradient-to-br from-[#94ABD6] to-[#7a90ba] rounded-xl p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 header-font">Have Questions?</h3>
                    <p className="text-white/90 mb-4 body-font">Chat with our booking assistant</p>
                    <div className="inline-flex items-center gap-2 bg-white text-[#94ABD6] px-4 py-2 rounded-lg font-medium body-font">
                      <MessageCircle className="w-4 h-4" />
                      {isChatConfigLoading ? "Loading chat..." : "Click the chat button below"}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Services & Details Section */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Services - Now grouped by type with smart icons */}
            <div className="w-full min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 header-font">Our Services</h2>
              <div className="space-y-4 w-full min-h-[200px]">
                {professionalData.service_groups.map((group: ServiceGroup) => {
                  const IconComponent = getServiceIcon(group.type)
                  const iconColor = getServiceColor(group.type)

                  return (
                    <div key={group.type} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {/* Group Header - No longer clickable */}
                      <div className="flex items-center gap-3 p-6 border-b border-gray-100">
                        <IconComponent className={`w-5 h-5 ${iconColor}`} />
                        <div>
                          <h3 className="font-semibold text-gray-900 header-font">{group.type_display}</h3>
                          <p className="text-sm text-gray-500 body-font">
                            {group.services.length} service{group.services.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {/* Group Services - Always visible */}
                      <div>
                        {group.services.map((service, index) => (
                          <div key={service.id} className="p-4 border-b border-gray-50 last:border-b-0">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 body-font">{service.name}</h4>
                              {service.cost && (
                                <span className="text-[#E75837] font-semibold body-font">{service.cost}</span>
                              )}
                            </div>
                            {service.description && (
                              <p className="text-sm text-gray-600 mb-2 body-font">{service.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {service.duration}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Hours & Certifications */}
            <div className="w-full min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 header-font">Hours & Information</h2>

              {/* Working Hours */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 header-font">Working Hours</h3>
                <div className="space-y-2">
                  {Object.entries(professionalData.working_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="capitalize font-medium body-font">{day}</span>
                      <span className="text-gray-600 body-font">
                        {hours.isOpen ? `${hours.open} - ${hours.close}` : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 title-font">
              Ready to Book with {professionalData.name}?
            </h2>
            <p className="text-xl text-gray-600 mb-8 body-font">
              Give your pet the care they deserve with our professional services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/schedule/${professionalId}`}
                className="inline-flex items-center gap-2 bg-[#E75837] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#d04e30] transition-colors text-lg header-font"
              >
                <Calendar className="w-5 h-5" />
                Schedule Appointment
              </Link>
              <Link
                href={`/newcustomer/${professionalId}`}
                className="inline-flex items-center gap-2 bg-white text-[#E75837] border-2 border-[#E75837] px-8 py-3 rounded-lg font-medium hover:bg-[#E75837] hover:text-white transition-colors text-lg header-font"
              >
                <UserPlus className="w-5 h-5" />
                New Customer Intake
              </Link>
            </div>
          </div>
        </div>

        {/* Live Chat Widget - Only render if chat is enabled */}
        {isChatEnabled && chatConfig && (
          <LiveChatWidget
            professionalId={professionalId}
            professionalName={professionalData.name}
            chatConfig={chatConfig}
            isConfigLoading={isChatConfigLoading}
          />
        )}
      </main>
    </div>
  )
}
