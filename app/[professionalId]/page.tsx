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
  Star,
  UserPlus,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Heart,
  Scissors,
} from "lucide-react"
import Header from "../../components/header"
import LiveChatWidget from "../../components/live-chat-widget"

// Sample data for Sally Grooming - will be replaced with webhook data later
const SAMPLE_PROFESSIONAL_DATA = {
  professional_id: "151",
  name: "Sally Grooming",
  tagline: "Premium pet grooming services with love and care",
  description:
    "With over 10 years of experience in professional pet grooming, Sally provides top-quality grooming services for dogs and cats of all sizes. We specialize in breed-specific cuts, nail trimming, teeth cleaning, and spa treatments that will leave your pet looking and feeling their best.",
  location: {
    address: "123 Pet Care Lane, Chicago, IL 60601",
    city: "Chicago",
    state: "IL",
    zip: "60601",
  },
  contact: {
    phone: "(555) 123-4567",
    email: "hello@sallygrooming.com",
  },
  working_hours: {
    monday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
    tuesday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
    wednesday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
    thursday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
    friday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
    saturday: { open: "9:00 AM", close: "4:00 PM", isOpen: true },
    sunday: { open: "Closed", close: "Closed", isOpen: false },
  },
  services: [
    "Full Service Grooming",
    "Bath & Brush",
    "Nail Trimming",
    "Teeth Cleaning",
    "Flea & Tick Treatment",
    "De-shedding Treatment",
  ],
  specialties: ["Large Dog Grooming", "Senior Pet Care", "Anxious Pet Handling", "Breed-Specific Cuts"],
  rating: 4.9,
  total_reviews: 127,
  years_experience: 10,
  certifications: ["Certified Professional Groomer", "Pet First Aid Certified", "Canine Behavior Specialist"],
}

export default function ProfessionalLandingPage() {
  const params = useParams()
  const professionalId = params.professionalId as string
  const [professionalData, setProfessionalData] = useState(SAMPLE_PROFESSIONAL_DATA)
  const [loading, setLoading] = useState(false)

  // TODO: Replace with actual webhook call
  useEffect(() => {
    // For now, just use sample data
    // Later: fetch professional data via webhook using professionalId
    console.log("Loading professional data for ID:", professionalId)
  }, [professionalId])

  const getCurrentDayHours = () => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const today = days[new Date().getDay()]
    return professionalData.working_hours[today as keyof typeof professionalData.working_hours]
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
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium body-font">{professionalData.rating}</span>
                        <span className="text-gray-500 body-font">({professionalData.total_reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="body-font">{professionalData.years_experience} years experience</span>
                      </div>
                    </div>
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
                <div className="flex flex-wrap gap-4">
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
                </div>
              </div>

              {/* Action Cards */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#E75837] to-[#d04e30] rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 header-font">Book an Appointment</h3>
                  <p className="text-white/90 mb-4 body-font">Schedule your pet's grooming session online</p>
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

                <div className="bg-gradient-to-br from-[#94ABD6] to-[#7a90ba] rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 header-font">Have Questions?</h3>
                  <p className="text-white/90 mb-4 body-font">Chat with our booking assistant</p>
                  <div className="inline-flex items-center gap-2 bg-white text-[#94ABD6] px-4 py-2 rounded-lg font-medium body-font">
                    <MessageCircle className="w-4 h-4" />
                    Click the chat button below
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services & Details Section */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Services */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 header-font">Our Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {professionalData.services.map((service, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <Heart className="w-5 h-5 text-[#E75837]" />
                    <span className="body-font">{service}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4 header-font">Specialties</h3>
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

            {/* Hours & Certifications */}
            <div>
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

              {/* Certifications */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 header-font">Certifications</h3>
                <div className="space-y-2">
                  {professionalData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="body-font">{cert}</span>
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
              Give your pet the care they deserve with our professional grooming services
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

        {/* Live Chat Widget */}
        <LiveChatWidget
          professionalId={professionalId}
          agentConfig={{
            chatName: `${professionalData.name} Support`,
            chatWelcomeMessage: `Hi! I'm here to help you with ${professionalData.name}. I can assist with booking appointments, answering questions about our services, and helping with any other inquiries. How can I help you today?`,
            widgetConfig: {
              primaryColor: "#E75837",
              position: "bottom-right",
              size: "medium",
            },
          }}
        />
      </main>
    </div>
  )
}
