"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft, Heart, MapPin, Clock, DollarSign, Star } from "lucide-react"
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
  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-6 body-font">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Professional Selection
      </Button>

      <Card className="border-green-200 bg-green-50 mb-6">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2 header-font">Perfect Match Found!</h2>
          <p className="text-green-700 body-font">
            We've found an excellent professional match for {serviceRequest.pets.map((p) => p.name).join(" and ")}.
          </p>
        </CardContent>
      </Card>

      {/* Selected Professional Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 header-font">
            <Heart className="w-5 h-5 text-[#E75837]" />
            Your Selected Professional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold header-font">{selectedProfessional.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="body-font">
                    {selectedProfessional.rating} ({selectedProfessional.totalReviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="body-font">
                    {selectedProfessional.location.distance} mi - {selectedProfessional.location.area}
                  </span>
                </div>
                <Badge variant="outline" className="body-font">
                  {selectedProfessional.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#E75837] body-font">{selectedProfessional.matchScore}%</div>
              <div className="text-sm text-gray-500 body-font">Match Score</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2 header-font">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProfessional.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="body-font">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2 header-font">Team</h4>
              <div className="space-y-1">
                {selectedProfessional.team.map((member, index) => (
                  <div key={index} className="text-sm body-font">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-gray-500"> - {member.role}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2 header-font">Availability</h4>
              <p className="text-sm text-gray-600 body-font">{selectedProfessional.availability.nextAvailable}</p>
              <p className="text-xs text-gray-500 body-font">Response time: {selectedProfessional.responseTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="header-font">Service Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2 header-font">Pet(s)</h4>
              <div className="space-y-2">
                {serviceRequest.pets.map((pet) => (
                  <div key={pet.id} className="text-sm body-font">
                    <span className="font-medium">{pet.name}</span> - {pet.breed} {pet.type}
                    {pet.specialNeeds.length > 0 && (
                      <div className="text-orange-600 text-xs">Special needs: {pet.specialNeeds.join(", ")}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2 header-font">Services</h4>
              <div className="flex flex-wrap gap-2">
                {serviceRequest.services.map((service) => (
                  <Badge key={service} variant="outline" className="body-font">
                    {service.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2 header-font flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Timing
              </h4>
              <p className="text-sm text-gray-600 body-font">
                {serviceRequest.timing.urgency.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                {serviceRequest.timing.preferredDate && (
                  <span> - {new Date(serviceRequest.timing.preferredDate).toLocaleDateString()}</span>
                )}
                {serviceRequest.timing.preferredTime && <span> at {serviceRequest.timing.preferredTime}</span>}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2 header-font flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Estimated Cost
              </h4>
              <p className="text-sm text-gray-600 body-font">
                {selectedProfessional.pricing.estimatedCost}
                <span className="text-xs text-gray-500 ml-2">
                  ({selectedProfessional.pricing.structure.replace("_", " ")})
                </span>
              </p>
            </div>
          </div>

          {serviceRequest.additionalNotes && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-gray-700 mb-2 header-font">Special Instructions</h4>
              <p className="text-sm text-gray-600 body-font">{serviceRequest.additionalNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="header-font">What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#E75837] text-white text-sm flex items-center justify-center font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium header-font">Professional Notification</h4>
                <p className="text-sm text-gray-600 body-font">
                  {selectedProfessional.name} will be notified of your request and will respond within{" "}
                  {selectedProfessional.responseTime}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#E75837] text-white text-sm flex items-center justify-center font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium header-font">Service Confirmation</h4>
                <p className="text-sm text-gray-600 body-font">
                  They'll confirm availability and provide final service details and pricing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#E75837] text-white text-sm flex items-center justify-center font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium header-font">Service Delivery</h4>
                <p className="text-sm text-gray-600 body-font">
                  Your pet care service will be delivered as scheduled with regular updates.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Actions */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={onBack} className="body-font bg-transparent">
          Choose Different Professional
        </Button>
        <Button onClick={onConfirm} className="bg-[#E75837] hover:bg-[#d04e30] body-font">
          Confirm and Submit Request
        </Button>
      </div>
    </div>
  )
}
