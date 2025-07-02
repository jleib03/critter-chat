"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, Users, Shield, Clock, Sparkles, ArrowRight, Search, Calendar } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/findprofessional?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-60"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 title-font font-sangbleu">
              Pet Care,{" "}
              <span className="text-[#E75837] relative">
                Perfected
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-[#E75837] opacity-20 rounded-full"></div>
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto body-font">
              Your personal pet concierge service. Tell us what your pet needs, and we'll connect you with the perfect
              professional or team of professionals.
            </p>

            {/* Primary CTA - Concierge Service */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                onClick={() => router.push("/concierge")}
                size="lg"
                className="bg-[#E75837] hover:bg-[#d04e30] text-white px-8 py-4 text-lg font-medium body-font shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try Critter Concierge
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="text-sm text-gray-500 body-font">or</div>

              <Button
                onClick={() => router.push("/findprofessional")}
                variant="outline"
                size="lg"
                className="border-2 border-[#E75837] text-[#E75837] hover:bg-[#E75837] hover:text-white px-8 py-4 text-lg font-medium body-font transition-all duration-200"
              >
                <Search className="w-5 h-5 mr-2" />
                Browse Professionals
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 body-font">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Fully Insured & Bonded</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.9/5 Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>500+ Trusted Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concierge Service Highlight */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-[#E75837] text-white mb-4 body-font">New</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4 title-font font-sangbleu">
              Introducing Critter Concierge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto body-font">
              The future of pet care. One request, perfect matches, personalized service.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E75837] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 header-font">Tell Us Your Pet's Needs</h3>
                  <p className="text-gray-600 body-font">
                    Complete our comprehensive intake form. We learn about your pet's personality, medical needs,
                    preferences, and your specific requirements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E75837] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 header-font">AI-Powered Professional Matching</h3>
                  <p className="text-gray-600 body-font">
                    Our concierge team uses advanced AI to analyze your needs and match you with the perfect
                    professionals in your area, ranked by compatibility.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E75837] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 header-font">Personal Introduction & Service</h3>
                  <p className="text-gray-600 body-font">
                    We personally introduce you to your matched professional and coordinate all the details. Ongoing
                    support throughout your service.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => router.push("/concierge")}
                size="lg"
                className="bg-[#E75837] hover:bg-[#d04e30] text-white body-font"
              >
                Start Your Concierge Request
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <Card className="border-2 border-[#E75837] shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <Heart className="w-12 h-12 text-[#E75837] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold header-font">Concierge vs. Traditional</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600 body-font">Service Matching</span>
                      <div className="flex gap-4">
                        <span className="text-red-500 body-font">Manual</span>
                        <span className="text-green-600 font-semibold body-font">AI-Powered</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600 body-font">Professional Vetting</span>
                      <div className="flex gap-4">
                        <span className="text-red-500 body-font">Basic</span>
                        <span className="text-green-600 font-semibold body-font">Comprehensive</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600 body-font">Ongoing Support</span>
                      <div className="flex gap-4">
                        <span className="text-red-500 body-font">Limited</span>
                        <span className="text-green-600 font-semibold body-font">24/7 Concierge</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 body-font">Service Coordination</span>
                      <div className="flex gap-4">
                        <span className="text-red-500 body-font">DIY</span>
                        <span className="text-green-600 font-semibold body-font">Fully Managed</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 title-font font-sangbleu">
              Complete Pet Care Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto body-font">
              From routine care to specialized services, our network of professionals covers all your pet's needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🐕",
                title: "Dog Walking & Exercise",
                description: "Daily walks, runs, and exercise programs tailored to your dog's needs and energy level.",
              },
              {
                icon: "🏠",
                title: "Pet Sitting & Overnight Care",
                description: "In-home pet care while you're away, including overnight stays and extended care.",
              },
              {
                icon: "✂️",
                title: "Grooming & Spa Services",
                description:
                  "Full grooming services including baths, cuts, nail trims, and specialized spa treatments.",
              },
              {
                icon: "🚗",
                title: "Pet Transportation",
                description: "Safe and comfortable transportation for vet visits, grooming, or any other needs.",
              },
              {
                icon: "🏥",
                title: "Medical Care Support",
                description: "Medication administration, post-surgery care, and support for pets with special needs.",
              },
              {
                icon: "🎓",
                title: "Training & Behavior",
                description:
                  "Professional training services for obedience, behavior modification, and specialized skills.",
              },
            ].map((service, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 header-font">{service.title}</h3>
                  <p className="text-gray-600 body-font">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Network */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 title-font font-sangbleu">
              Trusted Professional Network
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto body-font">
              Every professional in our network is thoroughly vetted, insured, and committed to providing exceptional
              pet care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E75837] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                500+
              </div>
              <h3 className="text-xl font-semibold mb-2 header-font">Verified Professionals</h3>
              <p className="text-gray-600 body-font">
                Background checked, insured, and continuously monitored for quality.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E75837] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                4.9
              </div>
              <h3 className="text-xl font-semibold mb-2 header-font">Average Rating</h3>
              <p className="text-gray-600 body-font">
                Consistently high ratings from thousands of satisfied pet parents.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E75837] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                24/7
              </div>
              <h3 className="text-xl font-semibold mb-2 header-font">Support Available</h3>
              <p className="text-gray-600 body-font">
                Round-the-clock support for you and your pets when you need it most.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => router.push("/pro/how-to-use")}
              variant="outline"
              size="lg"
              className="border-2 border-[#E75837] text-[#E75837] hover:bg-[#E75837] hover:text-white body-font"
            >
              Join Our Professional Network
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#E75837]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4 title-font font-sangbleu">
            Ready to Experience the Future of Pet Care?
          </h2>
          <p className="text-xl text-orange-100 mb-8 body-font">
            Join thousands of pet parents who trust Critter for all their pet care needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => router.push("/concierge")}
              size="lg"
              className="bg-white text-[#E75837] hover:bg-gray-100 px-8 py-4 text-lg font-medium body-font shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Your Concierge Request
            </Button>

            <Button
              onClick={() => router.push("/newcustomer")}
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-[#E75837] px-8 py-4 text-lg font-medium body-font transition-all duration-200"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Direct with a Professional
            </Button>
          </div>

          <p className="text-orange-200 mt-6 body-font">
            Questions? <button className="underline hover:text-white transition-colors">Chat with our team</button> or
            call (555) 123-PETS
          </p>
        </div>
      </section>
    </div>
  )
}
