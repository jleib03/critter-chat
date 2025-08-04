"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Star, Users, ArrowLeft, Construction } from "lucide-react"

export default function FindProfessionalPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // For now, show coming soon message
    alert(
      "Professional search feature coming soon! We're working hard to bring you the best pet care professionals in your area.",
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#f5f8fd] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-[#94ABD6]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 header-font mb-4">Find a Professional</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto body-font">
            Discover trusted pet care professionals in your area. Browse profiles, read reviews, and book services with
            confidence.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 body-font mb-2">
                  What service do you need?
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="service"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
                    placeholder="Dog walking, grooming, boarding..."
                  />
                </div>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 body-font mb-2">
                  Where are you located?
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
                    placeholder="City, state, or zip code"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#94ABD6] text-white py-3 px-6 rounded-lg hover:bg-[#7a90ba] transition-colors body-font font-medium"
            >
              Search Professionals
            </button>
          </form>
        </div>

        {/* Coming Soon Section */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
            <div className="w-16 h-16 bg-[#f5f8fd] rounded-full flex items-center justify-center mx-auto mb-6">
              <Construction className="h-8 w-8 text-[#94ABD6]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 header-font mb-4">Coming Soon!</h2>
            <p className="text-gray-600 body-font mb-6">
              We're working hard to bring you a comprehensive directory of pet care professionals. Soon you'll be able
              to browse profiles, read reviews, and book services directly.
            </p>
            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center text-gray-600 body-font">
                <Star className="w-4 h-4 mr-3 text-[#94ABD6]" />
                <span>Browse verified professional profiles</span>
              </div>
              <div className="flex items-center text-gray-600 body-font">
                <Users className="w-4 h-4 mr-3 text-[#94ABD6]" />
                <span>Read reviews from other pet owners</span>
              </div>
              <div className="flex items-center text-gray-600 body-font">
                <MapPin className="w-4 h-4 mr-3 text-[#94ABD6]" />
                <span>Find professionals near you</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 body-font">
              In the meantime, if you know your Critter professional, you can book directly through their unique link.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-500 hover:text-gray-700 body-font transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back to home
          </button>
        </div>
      </div>
    </div>
  )
}
