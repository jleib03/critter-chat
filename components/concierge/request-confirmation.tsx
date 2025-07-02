"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, ArrowLeft, MapPin, DollarSign, Clock, Heart, User, MessageCircle, Star, Send } from "lucide-react"
import type { ServiceRequest, MatchedProfessional } from "../../types/concierge"

interface RequestConfirmationProps {
  serviceRequest: ServiceRequest
  selectedProfessional: MatchedProfessional
  onBack: () => void
  onConfirm: () => void
}

export function RequestConfirmation({
  serviceRequest,
  selectedProfessional,
  onBack,
  onConfirm,
}: RequestConfirmationProps) {
  const [additionalMessage, setAdditionalMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    onConfirm()
  }

  const formatServiceName = (service: string) => {
    return service.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4 body-font">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Matches
        </Button>

        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2 header-font">Perfect Match Selected!</h2>
          <p className="text-gray-600 body-font">
            Review your request details and send it to <span className="font-medium">{selectedProfessional.name}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Request Details */}
        <div className="space-y-6">
          {/* Pet Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 header-font">
                <Heart className="w-5 h-5 text-[#E75837]" />
                Pet Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceRequest.pets.map((pet) => (
                <div key={pet.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium header-font">{pet.name}</h4>
                    <Badge variant="secondary" className="body-font">
                      {pet.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 body-font">
                    <p>
                      <span className="font-medium">Breed:</span> {pet.breed}
                    </p>
                    <p>
                      <span className="font-medium">Age:</span> {pet.age} years
                    </p>
                    <p>
                      <span className="font-medium">Size:</span> {pet.size} ({pet.weight} lbs)
                    </p>
                    {pet.preferences.specialInstructions && (
                      <p>
                        <span className="font-medium">Special Notes:</span> {pet.preferences.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Services Requested */}
          <Card>
            <CardHeader>
              <CardTitle className="header-font">Services Requested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {serviceRequest.services.map((service) => (
                  <Badge key={service} className="bg-[#E75837] text-white body-font">
                    {formatServiceName(service)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location & Timing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 header-font">
                <MapPin className="w-5 h-5 text-[#E75837]" />
                Location & Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm body-font">
                  <p className="font-medium">{serviceRequest.location.address}</p>
                  <p className="text-gray-600">
                    {serviceRequest.location.city}, {serviceRequest.location.state} {serviceRequest.location.zipCode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm body-font">
                  <p className="font-medium">Urgency: {serviceRequest.timing.urgency.replace("_", " ")}</p>
                  {serviceRequest.timing.preferredDate && (
                    <p className="text-gray-600">
                      Preferred: {new Date(serviceRequest.timing.preferredDate).toLocaleDateString()}
                      {serviceRequest.timing.preferredTime && ` at ${serviceRequest.timing.preferredTime}`}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm body-font">
                  <p className="font-medium">
                    Budget: ${serviceRequest.budget.min} - ${serviceRequest.budget.max}
                  </p>
                  {serviceRequest.budget.flexible && (
                    <p className="text-gray-600">Flexible for the right professional</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Professional Details */}
        <div className="space-y-6">
          {/* Selected Professional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 header-font">
                <User className="w-5 h-5 text-[#E75837]" />
                Selected Professional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E75837] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg header-font">{selectedProfessional.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium body-font">{selectedProfessional.rating}</span>
                        <span className="body-font">({selectedProfessional.totalReviews} reviews)</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 body-font">
                        {selectedProfessional.matchScore}% Match
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 body-font">Distance</p>
                    <p className="text-gray-600 body-font">{selectedProfessional.location.distance} miles away</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 body-font">Response Time</p>
                    <p className="text-gray-600 body-font">{selectedProfessional.responseTime}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 body-font">Availability</p>
                    <p className="text-gray-600 body-font">{selectedProfessional.availability.nextAvailable}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 body-font">Estimated Cost</p>
                    <p className="text-[#E75837] font-medium body-font">{selectedProfessional.pricing.estimatedCost}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-700 mb-2 body-font">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfessional.specialties.slice(0, 4).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs body-font">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-700 mb-2 body-font">Team Members</p>
                  <div className="space-y-1">
                    {selectedProfessional.team.map((member) => (
                      <div key={member.name} className="text-sm text-gray-600 body-font">
                        <span className="font-medium">{member.name}</span> - {member.role}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 header-font">
                <MessageCircle className="w-5 h-5 text-[#E75837]" />
                Message to Professional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={additionalMessage}
                onChange={(e) => setAdditionalMessage(e.target.value)}
                placeholder="Add any additional details or special requests for your professional..."
                rows={4}
                className="body-font"
              />
              <p className="text-xs text-gray-500 mt-2 body-font">
                This message will be sent along with your service request details.
              </p>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 header-font">What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700 space-y-2 body-font">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </div>
                <p>Your request is sent to {selectedProfessional.name}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <p>They'll review and respond within {selectedProfessional.responseTime}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <p>You'll receive their proposal with final pricing and schedule</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  4
                </div>
                <p>Once approved, your service is confirmed and scheduled</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-600 body-font">
          <p>By submitting this request, you agree to Critter's terms of service.</p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="body-font bg-transparent">
            Back to Matches
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-[#E75837] hover:bg-[#d04e30] body-font min-w-[140px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Request
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
