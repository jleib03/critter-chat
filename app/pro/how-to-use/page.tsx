"use client"

import { useState } from "react"
import PasswordProtection from "../../../components/password-protection"
import Header from "../../../components/header"
import {
  Database,
  Settings,
  Calendar,
  MessageSquare,
  Globe,
  UserPlus,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Play,
  Clock,
  Mail,
} from "lucide-react"

export default function HowToUsePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [expandedStep, setExpandedStep] = useState<number | null>(1)

  // If not authenticated, show password protection
  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onAuthenticated={() => setIsAuthenticated(true)}
        title="Professional Help Hub Access"
        description="Access professional resources and documentation."
      />
    )
  }

  const steps = [
    {
      id: 1,
      title: "Start with Your Critter Platform",
      subtitle: "Foundation Setup",
      icon: <Database className="h-6 w-6" />,
      color: "#E75837",
      description: "Your Critter platform is the central hub for all business operations. Set this up first.",
      tasks: [
        "Add your customers and their pet profiles",
        "Create your service catalog with pricing",
        "Set up your basic business information",
        "Configure payment processing",
        "Add team members if applicable",
      ],
      actionButton: {
        text: "Access Critter Platform",
        url: "https://app.critter.pet",
        external: true,
      },
      tips: [
        "Make sure all your existing customers are in the system before setting up online booking",
        "Your service catalog here will be used for all online booking tools",
        "Customer email addresses must match exactly for online booking to work",
      ],
    },
    {
      id: 2,
      title: "Set Up Your Professional Tools",
      subtitle: "Online Presence Setup",
      icon: <Settings className="h-6 w-6" />,
      color: "#7C3AED",
      description: "Configure your online tools to extend your Critter platform capabilities.",
      tasks: [
        "Generate your professional landing page link",
        "Create custom URLs for easy sharing",
        "Set up AI chatbot for your website",
        "Get implementation codes for your site",
      ],
      actionButton: {
        text: "Professional Setup",
        url: "/pro/set-up",
        external: false,
      },
      tips: [
        "Your business name must match exactly what's in your Critter account",
        "Custom URLs make it easier for customers to remember your booking link",
        "The AI chatbot is trained on your Critter business data automatically",
      ],
    },
    {
      id: 3,
      title: "Configure Your Schedule",
      subtitle: "Booking Management",
      icon: <Calendar className="h-6 w-6" />,
      color: "#10B981",
      description: "Set up your team, working hours, and booking capacity rules.",
      tasks: [
        "Define your working hours and availability",
        "Set up team members and their schedules",
        "Configure booking capacity and rules",
        "Block out unavailable times",
        "Set up recurring schedule patterns",
      ],
      actionButton: {
        text: "Schedule Setup",
        url: "/pro/set-up",
        external: false,
      },
      tips: [
        "You'll need your Professional ID from step 2",
        "Set realistic capacity limits to avoid overbooking",
        "Block out time for travel between appointments if needed",
      ],
    },
    {
      id: 4,
      title: "Launch Customer-Facing Tools",
      subtitle: "Go Live",
      icon: <Globe className="h-6 w-6" />,
      color: "#3B82F6",
      description: "Your customers can now book appointments and get support online.",
      tasks: [
        "Share your booking link with existing customers",
        "Add your AI chatbot to your website",
        "Create intake links for social media",
        "Test the booking process yourself",
        "Train your team on the new workflow",
      ],
      actionButton: {
        text: "Preview Your Landing Page",
        url: "/pro/set-up",
        external: false,
      },
      tips: [
        "Test bookings with a friend or family member first",
        "Customers must use the same name/email as in your Critter account",
        "All booking requests come to your Critter platform for approval",
      ],
    },
  ]

  const features = [
    {
      title: "Customer Self-Service Booking",
      icon: <Calendar className="h-5 w-5" />,
      description: "Customers book at booking.critter.pet/your-url without creating accounts",
      benefits: ["24/7 booking availability", "Reduces phone calls", "Automatic confirmation emails"],
    },
    {
      title: "AI Customer Support",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Chatbot on your website answers questions about services and pricing",
      benefits: ["Instant customer support", "Trained on your business data", "Reduces repetitive questions"],
    },
    {
      title: "New Customer Intake",
      icon: <UserPlus className="h-5 w-5" />,
      description: "Custom links for social media to onboard new customers",
      benefits: ["Streamlined lead capture", "Automatic data collection", "Social media integration"],
    },
    {
      title: "Automated Confirmations",
      icon: <Mail className="h-5 w-5" />,
      description: "Automatic confirmation emails sent to customers after booking",
      benefits: ["Professional communication", "Reduces no-shows", "Includes all booking details"],
    },
  ]

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl title-font mb-4 font-sangbleu">Professional Setup Guide</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto body-font">
              Step-by-step guide to setting up your online capabilities and integrating them with your Critter platform
            </p>
          </div>

          {/* Step-by-Step Guide */}
          <div className="space-y-6 mb-16">
            {steps.map((step, index) => (
              <div key={step.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Step Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md"
                        style={{ backgroundColor: step.color }}
                      >
                        {step.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold header-font">
                            Step {step.id}: {step.title}
                          </h3>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full body-font">
                            {step.subtitle}
                          </span>
                        </div>
                        <p className="text-gray-600 body-font mt-1">{step.description}</p>
                      </div>
                    </div>
                    <ArrowRight
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        expandedStep === step.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedStep === step.id && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                      {/* Tasks */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4 header-font flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Tasks to Complete
                        </h4>
                        <ul className="space-y-3">
                          {step.tasks.map((task, idx) => (
                            <li key={idx} className="flex items-start space-x-3">
                              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                              </div>
                              <span className="text-gray-700 body-font">{task}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Action Button */}
                        <div className="mt-6">
                          <a
                            href={step.actionButton.url}
                            target={step.actionButton.external ? "_blank" : "_self"}
                            rel={step.actionButton.external ? "noopener noreferrer" : ""}
                            className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium body-font transition-all hover:shadow-lg"
                            style={{ backgroundColor: step.color }}
                          >
                            {step.actionButton.external ? (
                              <ExternalLink className="h-4 w-4 mr-2" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            {step.actionButton.text}
                          </a>
                          {step.actionButton.note && (
                            <p className="text-xs text-gray-500 mt-2 body-font">{step.actionButton.note}</p>
                          )}
                        </div>
                      </div>

                      {/* Tips */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4 header-font flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          Pro Tips
                        </h4>
                        <div className="space-y-3">
                          {step.tips.map((tip, idx) => (
                            <div key={idx} className="bg-blue-50 rounded-lg p-3">
                              <p className="text-sm text-blue-800 body-font">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Features Overview */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold header-font mb-4">What You'll Get</h2>
              <p className="text-gray-600 body-font">
                These tools work together with your Critter platform to create a seamless customer experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 header-font">{feature.title}</h3>
                      <p className="text-gray-600 body-font mb-3">{feature.description}</p>
                      <ul className="space-y-1">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center text-sm text-green-700 body-font">
                            <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
