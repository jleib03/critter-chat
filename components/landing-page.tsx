"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Mail, Globe, MapPin, Clock, Star, Award, Calendar, Users, ChevronDown, ChevronUp } from "lucide-react"
import { getServiceIcon } from "@/utils/service-icons"
import type { ProfessionalLandingData } from "@/types/professional-config"

interface LandingPageProps {
  professionalData: ProfessionalLandingData
  uniqueUrl: string
}

export function LandingPage({ professionalData, uniqueUrl }: LandingPageProps) {
  const [expandedService, setExpandedService] = useState<string | null>(null)

  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId)
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder-logo.png" alt={professionalData.name} />
                <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                  {getInitials(professionalData.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{professionalData.name}</h1>
                <p className="text-gray-600">{professionalData.tagline}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <a href={`/schedule/${uniqueUrl}`}>Schedule Now</a>
              </Button>
              <Button variant="outline" asChild>
                <a href={`/newcustomer/${uniqueUrl}`}>Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span>About {professionalData.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{professionalData.description}</p>
                <div className="flex flex-wrap gap-2">
                  {professionalData.specialties?.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Services Section */}
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>Professional pet care services tailored to your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {professionalData.service_groups?.map((group) => (
                    <div key={group.type}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        {getServiceIcon(group.type)}
                        <span>{group.type_display}</span>
                      </h3>
                      <div className="grid gap-3">
                        {group.services.map((service) => (
                          <div key={service.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-500">{service.duration}</span>
                                    <span className="font-semibold text-orange-600">{service.cost}</span>
                                  </div>
                                </div>
                                {service.description && (
                                  <div>
                                    <p
                                      className={`text-gray-600 text-sm ${
                                        expandedService === service.id ? "" : "line-clamp-2"
                                      }`}
                                    >
                                      {service.description}
                                    </p>
                                    {service.description.length > 100 && (
                                      <button
                                        onClick={() => toggleServiceExpansion(service.id)}
                                        className="text-orange-600 text-sm mt-1 flex items-center space-x-1 hover:text-orange-700"
                                      >
                                        <span>{expandedService === service.id ? "Show less" : "Show more"}</span>
                                        {expandedService === service.id ? (
                                          <ChevronUp className="h-3 w-3" />
                                        ) : (
                                          <ChevronDown className="h-3 w-3" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Customer Reviews</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(professionalData.rating || 0)
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{professionalData.rating}</span>
                  <span className="text-gray-600">({professionalData.total_reviews} reviews)</span>
                </div>
                <p className="text-gray-700">
                  Customers consistently praise our professional service, attention to detail, and genuine care for
                  their pets.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {professionalData.contact.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-orange-600" />
                    <a href={`tel:${professionalData.contact.phone}`} className="text-gray-700 hover:text-orange-600">
                      {formatPhoneNumber(professionalData.contact.phone)}
                    </a>
                  </div>
                )}
                {professionalData.contact.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-orange-600" />
                    <a
                      href={`mailto:${professionalData.contact.email}`}
                      className="text-gray-700 hover:text-orange-600"
                    >
                      {professionalData.contact.email}
                    </a>
                  </div>
                )}
                {professionalData.contact.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-orange-600" />
                    <a
                      href={`https://${professionalData.contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-orange-600"
                    >
                      {professionalData.contact.website}
                    </a>
                  </div>
                )}
                {professionalData.location.address && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">{professionalData.location.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Working Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(professionalData.working_hours || {}).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="capitalize font-medium text-gray-700">{day}</span>
                      <span className="text-gray-600">
                        {hours.isOpen ? `${hours.open} - ${hours.close}` : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Professional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  <span>Professional Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700">Experience:</span>
                  <span className="ml-2 text-gray-600">{professionalData.years_experience} years</span>
                </div>
                {professionalData.certifications && professionalData.certifications.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Certifications:</span>
                    <div className="space-y-1">
                      {professionalData.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="block w-fit">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                  <a href={`/schedule/${uniqueUrl}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </a>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <a href={`/newcustomer/${uniqueUrl}`}>
                    <Users className="h-4 w-4 mr-2" />
                    New Customer Intake
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
