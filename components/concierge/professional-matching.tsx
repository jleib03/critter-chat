"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, DollarSign, Users, ArrowLeft, MessageCircle, Award, Zap, Shield } from "lucide-react"
import type { ServiceRequest, MatchedProfessional } from "../../types/concierge"

interface ProfessionalMatchingProps {
  serviceRequest: ServiceRequest
  matchedProfessionals: MatchedProfessional[]
  onProfessionalSelect: (professional: MatchedProfessional) => void
  onBack: () => void
}

export function ProfessionalMatching({
  serviceRequest,
  matchedProfessionals,
  onProfessionalSelect,
  onBack,
}: ProfessionalMatchingProps) {
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null)

  const getProfessionalTypeIcon = (type: string) => {
    switch (type) {
      case "individual_specialist":
        return Users
      case "multi_service_team":
        return Users
      case "premium_concierge":
        return Award
      default:
        return Users
    }
  }

  const getProfessionalTypeLabel = (type: string) => {
    switch (type) {
      case "individual_specialist":
        return "Individual Specialist"
      case "multi_service_team":
        return "Multi-Service Team"
      case "premium_concierge":
        return "Premium Concierge"
      default:
        return "Professional"
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50"
    if (score >= 80) return "text-blue-600 bg-blue-50"
    return "text-orange-600 bg-orange-50"
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4 body-font">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Request Details
        </Button>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-2xl font-bold mb-4 header-font">Perfect Matches Found!</h2>
          <p className="text-gray-600 body-font mb-4">
            We found {matchedProfessionals.length} professionals who can handle your request for{" "}
            <span className="font-medium">{serviceRequest.pets.map((p) => p.name).join(", ")}</span> in{" "}
            <span className="font-medium">{serviceRequest.location.city}</span>.
          </p>

          {/* Request Summary */}
          <div className="flex flex-wrap gap-2">
            {serviceRequest.services.map((service) => (
              <Badge key={service} variant="secondary" className="body-font">
                {service.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Professional Cards */}
      <div className="space-y-6">
        {matchedProfessionals.map((professional) => {
          const TypeIcon = getProfessionalTypeIcon(professional.type)
          const isSelected = selectedProfessional === professional.id

          return (
            <Card
              key={professional.id}
              className={`transition-all cursor-pointer ${
                isSelected ? "ring-2 ring-[#E75837] shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedProfessional(professional.id)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Column - Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold header-font">{professional.name}</h3>
                          <Badge
                            variant="outline"
                            className={`${getMatchScoreColor(professional.matchScore)} border-0 font-medium`}
                          >
                            {professional.matchScore}% Match
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <TypeIcon className="w-4 h-4" />
                            <span className="body-font">{getProfessionalTypeLabel(professional.type)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium body-font">{professional.rating}</span>
                            <span className="body-font">({professional.totalReviews} reviews)</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="body-font">
                              {professional.location.distance} mi • {professional.location.area}
                            </span>
                          </div>
                        </div>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {professional.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs body-font">
                              {specialty}
                            </Badge>
                          ))}
                          {professional.specialties.length > 3 && (
                            <Badge variant="secondary" className="text-xs body-font">
                              +{professional.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Team Members */}
                        <div className="mb-4">
                          <h4 className="font-medium text-sm text-gray-700 mb-2 header-font">Team:</h4>
                          <div className="space-y-1">
                            {professional.team.slice(0, 2).map((member) => (
                              <div key={member.name} className="text-sm text-gray-600 body-font">
                                <span className="font-medium">{member.name}</span> - {member.role}
                              </div>
                            ))}
                            {professional.team.length > 2 && (
                              <div className="text-sm text-gray-500 body-font">
                                +{professional.team.length - 2} more team members
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Availability & Pricing */}
                  <div className="lg:w-80 space-y-4">
                    {/* Availability */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm header-font">Availability</span>
                      </div>
                      <p className="text-sm text-gray-700 body-font mb-1">
                        Next available: <span className="font-medium">{professional.availability.nextAvailable}</span>
                      </p>
                      <p className="text-xs text-gray-500 body-font">
                        Flexibility: {professional.availability.flexibility}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-[#E75837]" />
                        <span className="font-medium text-sm header-font">Estimated Cost</span>
                      </div>
                      <p className="text-lg font-bold text-[#E75837] body-font">{professional.pricing.estimatedCost}</p>
                      <p className="text-xs text-gray-500 body-font capitalize">
                        {professional.pricing.structure.replace("_", " ")}
                      </p>
                    </div>

                    {/* Response Time */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-sm header-font">Response Time</span>
                      </div>
                      <p className="text-sm font-medium text-blue-600 body-font">{professional.responseTime}</p>
                    </div>

                    {/* Premium Features */}
                    {professional.type === "premium_concierge" && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-sm text-purple-800 header-font">Premium Concierge</span>
                        </div>
                        <ul className="text-xs text-purple-700 space-y-1 body-font">
                          <li>• 24/7 emergency support</li>
                          <li>• Dedicated account manager</li>
                          <li>• Premium service guarantee</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t mt-6">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" className="body-font bg-transparent">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <span className="text-sm text-gray-500 body-font">
                      Status: <span className="font-medium text-green-600">Available to claim</span>
                    </span>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onProfessionalSelect(professional)
                    }}
                    className="bg-[#E75837] hover:bg-[#d04e30] body-font"
                  >
                    Select This Professional
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Bottom Action */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 body-font mb-4">
          Don't see the perfect match? We can expand our search or help you refine your requirements.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" className="body-font bg-transparent">
            Expand Search Area
          </Button>
          <Button variant="outline" className="body-font bg-transparent">
            Modify Requirements
          </Button>
        </div>
      </div>
    </div>
  )
}
