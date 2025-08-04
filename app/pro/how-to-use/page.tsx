"use client"

import { useState } from "react"
import Header from "../../../components/header"
import {
  BookOpen,
  Calendar,
  MessageSquare,
  Settings,
  Users,
  ChevronRight,
  Play,
  CheckCircle,
  ArrowRight,
  Clock,
  Smartphone,
  Globe,
} from "lucide-react"

export default function HowToUsePage() {
  const [activeSection, setActiveSection] = useState("getting-started")

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Play,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 header-font">Getting Started with Critter Pro</h2>
          <p className="text-gray-600 body-font">
            Welcome to Critter's professional booking system! This guide will help you set up and manage your online
            booking presence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#E75837] to-[#f07a5f] rounded-xl p-6 text-white">
              <Globe className="w-8 h-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2 header-font">Online Booking Page</h3>
              <p className="text-sm opacity-90 body-font">
                Your customers can book services 24/7 through your personalized booking page.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#94ABD6] to-[#b0c1e3] rounded-xl p-6 text-white">
              <MessageSquare className="w-8 h-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2 header-font">AI Support Agent</h3>
              <p className="text-sm opacity-90 body-font">
                Automated customer support trained on your business policies and FAQs.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 header-font">Quick Setup Steps</h3>
            <div className="space-y-3">
              {[
                "Configure your booking preferences",
                "Set up your team and schedules",
                "Customize your booking page",
                "Test your setup",
                "Share your booking link",
              ].map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-6 h-6 bg-[#E75837] text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </div>
                  <span className="body-font">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "booking-setup",
      title: "Booking Setup",
      icon: Calendar,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 header-font">Booking Configuration</h2>
          <p className="text-gray-600 body-font">
            Configure how customers book appointments with you. Choose from three booking modes based on your business
            needs.
          </p>

          <div className="space-y-4">
            <div className="border border-green-200 bg-green-50 rounded-xl p-6">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2 header-font">Direct Booking</h3>
                  <p className="text-green-800 body-font mb-3">
                    Customers can book appointments instantly without waiting for approval. Perfect for established
                    client relationships.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm body-font">
                      Instant confirmation
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm body-font">
                      Streamlined experience
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm body-font">
                      Reduce admin work
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-amber-200 bg-amber-50 rounded-xl p-6">
              <div className="flex items-start">
                <Clock className="w-6 h-6 text-amber-600 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-2 header-font">Request to Book</h3>
                  <p className="text-amber-800 body-font mb-3">
                    Customers submit booking requests that you review and approve. Gives you full control over your
                    schedule.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm body-font">
                      Manual approval
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm body-font">
                      Full control
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm body-font">
                      Screen new clients
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-blue-200 bg-blue-50 rounded-xl p-6">
              <div className="flex items-start">
                <Smartphone className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2 header-font">No Online Booking</h3>
                  <p className="text-blue-800 body-font mb-3">
                    Customers must use the Critter app to request appointments. No public booking page available.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm body-font">
                      App-only booking
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm body-font">
                      Simple process
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm body-font">
                      No availability constraints
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "team-management",
      title: "Team Management",
      icon: Users,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 header-font">Managing Your Team</h2>
          <p className="text-gray-600 body-font">
            Set up your team members and manage their schedules, availability, and service assignments.
          </p>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 header-font">Team Member Setup</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-[#E75837] text-white rounded-full flex items-center justify-center text-sm font-medium mr-4 mt-1 flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 header-font">Add Team Members</h4>
                  <p className="text-gray-600 body-font">
                    Add your employees through the Critter app first, then they'll appear in your booking setup.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-[#E75837] text-white rounded-full flex items-center justify-center text-sm font-medium mr-4 mt-1 flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 header-font">Set Working Hours</h4>
                  <p className="text-gray-600 body-font">
                    Configure individual schedules for each team member, including days off and working hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-[#E75837] text-white rounded-full flex items-center justify-center text-sm font-medium mr-4 mt-1 flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 header-font">Assign Services</h4>
                  <p className="text-gray-600 body-font">
                    Specify which services each team member can provide to ensure proper booking assignments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 header-font">Working Hours</h3>
              <p className="text-gray-600 body-font mb-4">
                Set different schedules for each day of the week. Team members can have individual schedules.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="body-font">Monday - Friday</span>
                  <span className="text-gray-500 body-font">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-font">Saturday</span>
                  <span className="text-gray-500 body-font">9:00 AM - 3:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-font">Sunday</span>
                  <span className="text-gray-500 body-font">Closed</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 header-font">Blocked Time</h3>
              <p className="text-gray-600 body-font mb-4">
                Block specific dates and times when team members are unavailable.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="body-font">Vacation days</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="body-font">Meetings & appointments</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="body-font">Personal time off</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "ai-agent",
      title: "AI Support Agent",
      icon: MessageSquare,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 header-font">AI Support Agent</h2>
          <p className="text-gray-600 body-font">
            Set up an intelligent support agent that can answer customer questions about your services, policies, and
            availability.
          </p>

          <div className="bg-gradient-to-r from-[#94ABD6] to-[#b0c1e3] rounded-xl p-6 text-white">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-8 h-8 mr-3" />
              <h3 className="text-xl font-semibold header-font">24/7 Customer Support</h3>
            </div>
            <p className="opacity-90 body-font">
              Your AI agent works around the clock to answer customer questions, provide service information, and help
              with booking inquiries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 header-font">Setup Process</h3>
              <div className="space-y-3">
                {[
                  { step: "Enrollment", desc: "Enter your professional ID to get started" },
                  { step: "Training", desc: "Add your business policies and service details" },
                  { step: "Customization", desc: "Personalize the chat appearance and messages" },
                  { step: "Testing", desc: "Test your agent before going live" },
                  { step: "Deployment", desc: "Activate your agent on your booking page" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-[#94ABD6] text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-1 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 header-font">{item.step}</h4>
                      <p className="text-sm text-gray-600 body-font">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 header-font">What Your Agent Can Do</h3>
              <div className="space-y-3">
                {[
                  "Answer questions about your services",
                  "Explain your cancellation policies",
                  "Provide pricing information",
                  "Help with booking inquiries",
                  "Share your contact information",
                  "Explain your new customer process",
                ].map((capability, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 body-font">{capability}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-amber-900 header-font">Training Your Agent</h4>
                <p className="text-amber-800 body-font mt-1">
                  The more detailed information you provide about your services, policies, and processes, the better
                  your AI agent will be at helping customers. Take time to fill out all the training sections
                  thoroughly.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "best-practices",
      title: "Best Practices",
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 header-font">Best Practices</h2>
          <p className="text-gray-600 body-font">
            Follow these recommendations to get the most out of your Critter booking system and provide the best
            experience for your customers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 header-font flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Do's
              </h3>
              <div className="space-y-3">
                {[
                  "Keep your availability calendar up to date",
                  "Respond to booking requests promptly",
                  "Provide detailed service descriptions",
                  "Set clear cancellation policies",
                  "Test your booking flow regularly",
                  "Train your AI agent with comprehensive information",
                  "Use professional photos and descriptions",
                  "Set realistic buffer times between appointments",
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 body-font">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 header-font flex items-center">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">×</span>
                </div>
                Don'ts
              </h3>
              <div className="space-y-3">
                {[
                  "Don't forget to block time for personal appointments",
                  "Don't set unrealistic service durations",
                  "Don't ignore customer booking requests",
                  "Don't forget to update your team schedules",
                  "Don't leave service descriptions empty",
                  "Don't set booking windows too far in advance",
                  "Don't forget to test changes before going live",
                  "Don't overwhelm customers with too many options",
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="text-white text-xs font-bold">×</span>
                    </div>
                    <span className="text-gray-700 body-font">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 header-font">Pro Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1 flex-shrink-0">
                  💡
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 header-font">Use Buffer Times</h4>
                  <p className="text-blue-800 body-font">
                    Set buffer times between appointments to account for travel, cleanup, or unexpected delays.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1 flex-shrink-0">
                  📱
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 header-font">Mobile-First Thinking</h4>
                  <p className="text-blue-800 body-font">
                    Most customers will book on mobile devices. Keep your service names and descriptions concise and
                    clear.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1 flex-shrink-0">
                  🔄
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 header-font">Regular Updates</h4>
                  <p className="text-blue-800 body-font">
                    Review and update your booking settings monthly to ensure they reflect your current business needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1">
        <div className="max-w-7xl mx-auto px-4 page-content">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#f5f8fd] rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-[#94ABD6]" />
            </div>
            <h1 className="text-4xl title-font mb-4 font-sangbleu">How to Use Critter Pro</h1>
            <p className="text-gray-700 max-w-3xl mx-auto body-font">
              Complete guide to setting up and managing your professional booking system
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 header-font">Guide Sections</h2>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                          activeSection === section.id ? "bg-[#E75837] text-white" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-3" />
                          <span className="body-font">{section.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-white rounded-xl shadow-md p-8">
                {sections.find((section) => section.id === activeSection)?.content}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 header-font">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a
                href="/pro/set-up"
                className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center">
                  <Settings className="w-8 h-8 text-[#E75837] mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900 header-font">Professional Setup</h3>
                    <p className="text-sm text-gray-600 body-font">Configure your booking system</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#E75837] transition-colors" />
              </a>

              <a
                href="/pro/custom-agent"
                className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center">
                  <MessageSquare className="w-8 h-8 text-[#94ABD6] mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900 header-font">AI Agent Setup</h3>
                    <p className="text-sm text-gray-600 body-font">Create your support agent</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#94ABD6] transition-colors" />
              </a>

              <a
                href="https://critter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center">
                  <Smartphone className="w-8 h-8 text-[#745E25] mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900 header-font">Critter App</h3>
                    <p className="text-sm text-gray-600 body-font">Manage your business</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#745E25] transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
