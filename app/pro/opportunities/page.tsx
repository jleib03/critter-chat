"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, Star, Users, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"
import {
  DEMO_MATCHED_PROFESSIONALS,
  DEMO_MATCH_REASONING,
  DEMO_SERVICE_REQUEST,
  getTimeElapsed,
  getTimeRemaining,
} from "@/utils/demo-data"
import { DemoNavigation } from "@/components/demo-navigation"

export default function ProfessionalOpportunitiesPage() {
  const [claimedOpportunities, setClaimedOpportunities] = useState<string[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)

  // Simulate some claimed opportunities for demo
  useEffect(() => {
    // Simulate Dr. Rodriguez claiming the tier 1 opportunity after a delay
    const timer = setTimeout(() => {
      if (!claimedOpportunities.includes("prof_maria_rodriguez")) {
        setClaimedOpportunities((prev) => [...prev, "prof_maria_rodriguez"])
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [claimedOpportunities])

  const handleClaimOpportunity = (professionalId: string) => {
    setClaimedOpportunities((prev) => [...prev, professionalId])
    setShowSuccessMessage(professionalId)

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(null)
    }, 3000)
  }

  const tier1Opportunity = DEMO_MATCHED_PROFESSIONALS[0] // Dr. Maria Rodriguez
  const tier2Opportunity = {
    id: "req_20240110_002",
    customerName: "Michael K.",
    petName: "Buddy",
    petType: "Golden Retriever",
    services: ["Dog Walking", "Pet Sitting"],
    location: "River North",
    distance: 1.5,
    timing: "Tomorrow, 10:00 AM",
    estimatedEarnings: "$45-65",
    matchScore: 78,
    urgency: "medium",
    specialRequirements: ["Large dog experience", "Weekend availability"],
    customerNotes:
      "Buddy is very friendly and loves meeting new people. He needs a good walk in the morning and some playtime.",
    submittedAt: "2024-01-10T11:15:00Z",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoNavigation currentView="professional" />

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Opportunities</h1>
          <p className="text-gray-600">New service requests matched to your expertise and location</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">$1,240</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.9</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">
                Opportunity claimed successfully! The customer will be notified and you'll receive booking details
                shortly.
              </p>
            </div>
          </div>
        )}

        {/* Tier 1 Opportunity - Premium Match */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">
              Tier 1 - Premium Match
            </Badge>
            <Badge variant="outline" className="text-green-700 border-green-300">
              96% Match Score
            </Badge>
          </div>

          <Card className="border-2 border-purple-200 bg-purple-50/30">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-gray-900">Post-Surgical Care for Luna (German Shepherd)</CardTitle>
                  <p className="text-gray-600 mt-1">
                    Customer: {DEMO_SERVICE_REQUEST.contactInfo.firstName} {DEMO_SERVICE_REQUEST.contactInfo.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{tier1Opportunity.pricing.estimatedCost}</p>
                  <p className="text-sm text-gray-500">Estimated earnings</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Request Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Service Requirements</h4>
                    <div className="space-y-2">
                      {DEMO_SERVICE_REQUEST.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="mr-2">
                          {service.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {DEMO_SERVICE_REQUEST.location.address}, {tier1Opportunity.location.area}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {tier1Opportunity.location.distance} miles
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      Preferred: {DEMO_SERVICE_REQUEST.timing.preferredDate} at{" "}
                      {DEMO_SERVICE_REQUEST.timing.preferredTime}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Special Requirements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {DEMO_SERVICE_REQUEST.preferences.specialRequirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Why You're Matched */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Why You're a Perfect Match</h4>

                  <div>
                    <h5 className="font-medium text-green-700 mb-2">Primary Strengths</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {DEMO_MATCH_REASONING.prof_maria_rodriguez.primary.map((reason, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Additional Benefits</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {DEMO_MATCH_REASONING.prof_maria_rodriguez.secondary.map((reason, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500 rounded-full mt-0.5 flex-shrink-0"></div>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Customer Notes</h4>
                <p className="text-gray-700 text-sm leading-relaxed">"{DEMO_SERVICE_REQUEST.additionalNotes}"</p>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Submitted {getTimeElapsed(DEMO_SERVICE_REQUEST.createdAt)}</span>
                  <span>•</span>
                  <span>Response needed within {getTimeRemaining("2024-01-10T12:00:00Z")}</span>
                </div>

                {claimedOpportunities.includes(tier1Opportunity.id) ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Claimed
                  </Badge>
                ) : (
                  <Button
                    onClick={() => handleClaimOpportunity(tier1Opportunity.id)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Claim This Opportunity
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tier 2 Opportunity - Standard Match */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              Tier 2 - Good Match
            </Badge>
            <Badge variant="outline" className="text-orange-700 border-orange-300">
              78% Match Score
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    Daily Care for {tier2Opportunity.petName} ({tier2Opportunity.petType})
                  </CardTitle>
                  <p className="text-gray-600 mt-1">Customer: {tier2Opportunity.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{tier2Opportunity.estimatedEarnings}</p>
                  <p className="text-sm text-gray-500">Estimated earnings</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Services Needed</h4>
                    <div className="space-y-2">
                      {tier2Opportunity.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="mr-2">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{tier2Opportunity.location}</span>
                    <Badge variant="outline" className="ml-2">
                      {tier2Opportunity.distance} miles
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{tier2Opportunity.timing}</span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {tier2Opportunity.specialRequirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Notes</h4>
                    <p className="text-gray-700 text-sm">"{tier2Opportunity.customerNotes}"</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Submitted {getTimeElapsed(tier2Opportunity.submittedAt)}</span>
                  <span>•</span>
                  <span>Standard response time: 2 hours</span>
                </div>

                {claimedOpportunities.includes(tier2Opportunity.id) ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Claimed
                  </Badge>
                ) : (
                  <Button variant="outline" onClick={() => handleClaimOpportunity(tier2Opportunity.id)}>
                    Claim Opportunity
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* No More Opportunities */}
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">You're All Caught Up!</h3>
            <p className="text-gray-600 mb-4">
              No more opportunities available right now. New matches will appear here as they come in.
            </p>
            <p className="text-sm text-gray-500">
              Your profile is active and you'll be notified of new opportunities that match your expertise.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
