"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, MapPin, Heart, Phone, Mail, MessageCircle, ArrowRight, Users, Zap } from "lucide-react"
import type { ServiceRequest } from "../../types/concierge"

interface RequestSubmittedProps {
  serviceRequest: ServiceRequest
}

export function RequestSubmitted({ serviceRequest }: RequestSubmittedProps) {
  const estimatedResponseTime = "within 2 hours"
  const conciergeTeam = "Chicago Metro Team"

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2 header-font">Request Submitted Successfully!</h2>
          <p className="text-green-700 body-font mb-6">
            Your pet care request has been received and is being reviewed by our {conciergeTeam}.
          </p>

          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Clock className="w-5 h-5 text-[#E75837]" />
              <span className="font-medium header-font">Expected Response Time: {estimatedResponseTime}</span>
            </div>
            <p className="text-gray-600 body-font text-sm">
              Our concierge team is analyzing your request and matching you with the best professionals in your area.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What Happens Next - Updated Flow */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 header-font">What Happens Next?</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#E75837] text-white text-sm flex items-center justify-center font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium header-font flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#E75837]" />
                  AI Analysis & Concierge Review
                </h4>
                <p className="text-sm text-gray-600 body-font">
                  Our AI system analyzes your request and our {conciergeTeam} identifies the best professionals for your
                  pet's specific needs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#E75837] text-white text-sm flex items-center justify-center font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium header-font flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#E75837]" />
                  Professional Matching & Outreach
                </h4>
                <p className="text-sm text-gray-600 body-font">
                  We reach out to our top-tier professionals who specialize in your pet's needs. They review your
                  request and claim the opportunity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#E75837] text-white text-sm flex items-center justify-center font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium header-font flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-[#E75837]" />
                  Professional Confirmation & Introduction
                </h4>
                <p className="text-sm text-gray-600 body-font">
                  Once a professional accepts your request, we'll personally introduce you and coordinate all the
                  service details.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 header-font">You'll be notified when:</h4>
            <ul className="text-sm text-blue-700 body-font space-y-1">
              <li>• A professional has been matched and confirmed</li>
              <li>• Service details and scheduling are finalized</li>
              <li>• Your professional is ready to begin care</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Request Summary */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 header-font flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#E75837]" />
            Your Request Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pet Information */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2 header-font">Pet(s)</h4>
              <div className="space-y-2">
                {serviceRequest.pets.map((pet) => (
                  <div key={pet.id} className="text-sm body-font">
                    <span className="font-medium">{pet.name}</span> - {pet.breed} {pet.type}
                    {pet.age && <span className="text-gray-500"> ({pet.age} years old)</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2 header-font">Services Requested</h4>
              <div className="flex flex-wrap gap-2">
                {serviceRequest.services.map((service) => (
                  <Badge key={service} variant="secondary" className="body-font">
                    {service.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2 header-font flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Location
              </h4>
              <p className="text-sm text-gray-600 body-font">
                {serviceRequest.location.city}, {serviceRequest.location.state} {serviceRequest.location.zipCode}
              </p>
            </div>

            {/* Timing */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2 header-font flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Timing
              </h4>
              <p className="text-sm text-gray-600 body-font capitalize">
                {serviceRequest.timing.urgency.replace("_", " ")}
                {serviceRequest.timing.preferredDate && (
                  <span> - {new Date(serviceRequest.timing.preferredDate).toLocaleDateString()}</span>
                )}
              </p>
            </div>
          </div>

          {/* Budget */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-gray-700 mb-2 header-font">Budget Range</h4>
            <p className="text-sm text-gray-600 body-font">
              ${serviceRequest.budget.min} - ${serviceRequest.budget.max}
              {serviceRequest.budget.flexible && <span className="text-green-600"> (Flexible)</span>}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 header-font">Need to Make Changes or Have Questions?</h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex items-center gap-2 body-font bg-transparent">
              <Phone className="w-4 h-4" />
              Call Concierge Team
            </Button>

            <Button variant="outline" className="flex items-center gap-2 body-font bg-transparent">
              <Mail className="w-4 h-4" />
              Email Support
            </Button>

            <Button variant="outline" className="flex items-center gap-2 body-font bg-transparent">
              <MessageCircle className="w-4 h-4" />
              Live Chat
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-4 body-font">
            Reference ID: <span className="font-mono font-medium">{serviceRequest.id}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
