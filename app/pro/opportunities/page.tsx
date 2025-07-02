"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Clock,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  Target,
  Timer,
  Award,
  Zap,
  Phone,
  MessageCircle,
} from "lucide-react"
import { DEMO_SERVICE_REQUEST, DEMO_MATCH_REASONING, getTimeElapsed, getTimeRemaining } from "../../../utils/demo-data"

interface ServiceOpportunity {
  id: string
  tier: 1 | 2 | 3
  customerName: string
  pets: Array<{
    name: string
    type: string
    breed: string
    age: number
    specialNeeds: string[]
    medications: string[]
    specialInstructions: string
  }>
  services: string[]
  location: {
    distance: number
    area: string
    fullAddress: string
  }
  timing: {
    urgency: string
    preferredDate?: string
    preferredTime?: string
  }
  budget: {
    min: number
    max: number
    flexible: boolean
  }
  whySelected: {
    primary: string[]
    secondary: string[]
    concerns: string[]
  }
  estimatedEarnings: string
  postedAt: string
  expiresAt: string
  claimsRemaining: number
  totalClaims: number
  status: "available" | "claimed" | "expired"
  matchScore: number
  customerNotes: string
}

export default function ProfessionalOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ServiceOpportunity[]>([])
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(1)
  const [claimingOpportunity, setClaimingOpportunity] = useState<string | null>(null)

  const [professionalProfile] = useState({
    name: "Dr. Maria Rodriguez",
    specialties: [
      "Post-Surgical Care",
      "German Shepherd Specialist",
      "Veterinary Physical Therapy",
      "Large Breed Expert",
    ],
    rating: 4.9,
    totalJobs: 156,
    responseRate: 98,
    tier1Opportunities: 12,
    tier2Opportunities: 8,
    totalEarnings: "$15,240",
  })

  useEffect(() => {
    // Convert demo data to opportunities format
    const demoOpportunity: ServiceOpportunity = {
      id: DEMO_SERVICE_REQUEST.id,
      tier: 1,
      customerName: `${DEMO_SERVICE_REQUEST.contactInfo.firstName} ${DEMO_SERVICE_REQUEST.contactInfo.lastName.charAt(0)}.`,
      pets: DEMO_SERVICE_REQUEST.pets.map((pet) => ({
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        specialNeeds: pet.specialNeeds,
        medications: pet.medications,
        specialInstructions: pet.preferences.specialInstructions,
      })),
      services: DEMO_SERVICE_REQUEST.services,
      location: {
        distance: 0.8,
        area: "Lincoln Park",
        fullAddress: `${DEMO_SERVICE_REQUEST.location.city}, ${DEMO_SERVICE_REQUEST.location.state}`,
      },
      timing: {
        urgency: DEMO_SERVICE_REQUEST.timing.urgency,
        preferredDate: DEMO_SERVICE_REQUEST.timing.preferredDate,
        preferredTime: DEMO_SERVICE_REQUEST.timing.preferredTime,
      },
      budget: DEMO_SERVICE_REQUEST.budget,
      whySelected: DEMO_MATCH_REASONING.prof_maria_rodriguez,
      estimatedEarnings: "$150-200",
      postedAt: DEMO_SERVICE_REQUEST.createdAt,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
      claimsRemaining: 2,
      totalClaims: 3,
      status: "available",
      matchScore: 96,
      customerNotes: DEMO_SERVICE_REQUEST.additionalNotes,
    }

    // Add a second tier 2 opportunity for demo
    const tier2Opportunity: ServiceOpportunity = {
      id: "req_20240110_002",
      tier: 2,
      customerName: "Michael T.",
      pets: [
        {
          name: "Buddy",
          type: "dog",
          breed: "Golden Retriever",
          age: 7,
          specialNeeds: ["Arthritis management"],
          medications: ["Glucosamine supplement"],
          specialInstructions: "Senior dog, needs gentle exercise and joint care",
        },
      ],
      services: ["dog_walking", "pet_sitting"],
      location: {
        distance: 2.1,
        area: "Old Town",
        fullAddress: "Chicago, IL",
      },
      timing: {
        urgency: "this_week",
        preferredDate: "2024-01-12",
        preferredTime: "10:00",
      },
      budget: {
        min: 80,
        max: 120,
        flexible: true,
      },
      whySelected: {
        primary: [
          "Experience with senior dogs and joint care",
          "Available within customer's preferred timeframe",
          "Good location match in Chicago area",
        ],
        secondary: ["Strong customer reviews for gentle care", "Flexible scheduling capabilities"],
        concerns: [
          "Lower budget range than typical premium services",
          "Customer prefers individual walker over team approach",
        ],
      },
      estimatedEarnings: "$80-120",
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
      claimsRemaining: 1,
      totalClaims: 2,
      status: "available",
      matchScore: 78,
      customerNotes:
        "Buddy is a sweet senior dog who loves gentle walks and needs someone patient with his slower pace.",
    }

    setOpportunities([demoOpportunity, tier2Opportunity])
  }, [])

  const claimOpportunity = async (opportunityId: string) => {
    setClaimingOpportunity(opportunityId)

    // Simulate claiming process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === opportunityId
          ? { ...opp, status: "claimed" as const, claimsRemaining: opp.claimsRemaining - 1 }
          : opp,
      ),
    )

    setClaimingOpportunity(null)

    // Show success message
    alert(
      "🎉 Opportunity claimed successfully!\n\nNext steps:\n• Customer will be notified\n• You'll receive contact details\n• Service coordination begins",
    )
  }

  const getOpportunitiesByTier = (tier: 1 | 2 | 3) => {
    return opportunities.filter((opp) => opp.tier === tier)
  }

  const getTierDescription = (tier: 1 | 2 | 3) => {
    switch (tier) {
      case 1:
        return "Perfect matches - highest compatibility with your expertise"
      case 2:
        return "Good opportunities - solid matches with minor considerations"
      case 3:
        return "Available options - may have some limitations or lower match scores"
    }
  }

  const getTierColor = (tier: 1 | 2 | 3) => {
    switch (tier) {
      case 1:
        return "bg-green-100 text-green-800"
      case 2:
        return "bg-blue-100 text-blue-800"
      case 3:
        return "bg-orange-100 text-orange-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold header-font">Professional Opportunities</h1>
            <p className="text-gray-600 body-font">Welcome back, {professionalProfile.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500 body-font">This Month</div>
              <div className="text-xl font-bold text-[#E75837] body-font">{professionalProfile.totalEarnings}</div>
            </div>
            <Badge className="bg-[#E75837] text-white body-font">
              <Star className="w-3 h-3 mr-1" />
              {professionalProfile.rating} Rating
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Professional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#E75837] body-font">
                {professionalProfile.tier1Opportunities}
              </div>
              <div className="text-sm text-gray-500 body-font">Tier 1 This Month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 body-font">{professionalProfile.tier2Opportunities}</div>
              <div className="text-sm text-gray-500 body-font">Tier 2 This Month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 body-font">{professionalProfile.responseRate}%</div>
              <div className="text-sm text-gray-500 body-font">Response Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 body-font">{professionalProfile.totalJobs}</div>
              <div className="text-sm text-gray-500 body-font">Total Jobs</div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 header-font">
              <Zap className="w-5 h-5 text-[#E75837]" />
              Available Opportunities
              <Badge variant="secondary" className="body-font">
                {opportunities.filter((opp) => opp.status === "available").length} Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={`tier${selectedTier}`}
              onValueChange={(value) => setSelectedTier(Number.parseInt(value.replace("tier", "")) as 1 | 2 | 3)}
            >
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                <TabsTrigger value="tier1" className="body-font">
                  Tier 1 ({getOpportunitiesByTier(1).length})
                </TabsTrigger>
                <TabsTrigger value="tier2" className="body-font">
                  Tier 2 ({getOpportunitiesByTier(2).length})
                </TabsTrigger>
                <TabsTrigger value="tier3" className="body-font">
                  Tier 3 ({getOpportunitiesByTier(3).length})
                </TabsTrigger>
              </TabsList>

              {[1, 2, 3].map((tier) => (
                <TabsContent key={tier} value={`tier${tier}`} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold header-font mb-1">Tier {tier} Opportunities</h3>
                    <p className="text-sm text-gray-600 body-font">{getTierDescription(tier as 1 | 2 | 3)}</p>
                  </div>

                  <div className="space-y-4">
                    {getOpportunitiesByTier(tier as 1 | 2 | 3).map((opportunity) => (
                      <Card
                        key={opportunity.id}
                        className="border-2 border-gray-200 hover:border-[#E75837] transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-lg header-font">
                                  {opportunity.pets.map((p) => p.name).join(", ")} - {opportunity.customerName}
                                </h4>
                                <Badge className={`${getTierColor(opportunity.tier)} body-font`}>
                                  Tier {opportunity.tier}
                                </Badge>
                                <Badge className="bg-green-100 text-green-800 body-font">
                                  {opportunity.matchScore}% Match
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="body-font">
                                    {opportunity.location.distance} mi - {opportunity.location.area}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span className="body-font">{opportunity.timing.urgency.replace("_", " ")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Timer className="w-4 h-4" />
                                  <span className="body-font">{getTimeRemaining(opportunity.expiresAt)}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <h5 className="font-medium text-gray-700 mb-2 header-font">Pet Details</h5>
                                  {opportunity.pets.map((pet, idx) => (
                                    <div key={idx} className="text-sm body-font">
                                      <p>
                                        <strong>{pet.name}</strong> - {pet.breed} {pet.type}, {pet.age} years
                                      </p>
                                      {pet.specialNeeds.length > 0 && (
                                        <div className="text-orange-600 mt-1">
                                          <p className="font-medium">Special needs:</p>
                                          <ul className="ml-2">
                                            {pet.specialNeeds.map((need, needIdx) => (
                                              <li key={needIdx}>• {need}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {pet.medications.length > 0 && (
                                        <div className="text-blue-600 mt-1">
                                          <p className="font-medium">Medications:</p>
                                          <ul className="ml-2">
                                            {pet.medications.map((med, medIdx) => (
                                              <li key={medIdx}>• {med}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                <div>
                                  <h5 className="font-medium text-gray-700 mb-2 header-font">Services & Budget</h5>
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {opportunity.services.map((service) => (
                                      <Badge key={service} variant="secondary" className="text-xs body-font">
                                        {service.replace("_", " ")}
                                      </Badge>
                                    ))}
                                  </div>
                                  <p className="text-sm body-font">
                                    <strong>Budget:</strong> ${opportunity.budget.min} - ${opportunity.budget.max}
                                    {opportunity.budget.flexible && <span className="text-green-600"> (Flexible)</span>}
                                  </p>
                                  {opportunity.timing.preferredDate && (
                                    <p className="text-sm body-font">
                                      <strong>Preferred:</strong>{" "}
                                      {new Date(opportunity.timing.preferredDate).toLocaleDateString()}
                                      {opportunity.timing.preferredTime && ` at ${opportunity.timing.preferredTime}`}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {opportunity.customerNotes && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                  <h5 className="font-medium text-yellow-800 mb-1 header-font">Customer Notes</h5>
                                  <p className="text-sm text-yellow-700 body-font">{opportunity.customerNotes}</p>
                                </div>
                              )}

                              {opportunity.pets.some((pet) => pet.specialInstructions) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                  <h5 className="font-medium text-blue-800 mb-1 header-font">Special Instructions</h5>
                                  {opportunity.pets.map(
                                    (pet, idx) =>
                                      pet.specialInstructions && (
                                        <p key={idx} className="text-sm text-blue-700 body-font">
                                          <strong>{pet.name}:</strong> {pet.specialInstructions}
                                        </p>
                                      ),
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="text-right ml-6">
                              <div className="text-2xl font-bold text-[#E75837] body-font mb-1">
                                {opportunity.estimatedEarnings}
                              </div>
                              <div className="text-sm text-gray-500 body-font mb-2">Estimated earnings</div>

                              <div className="text-xs text-gray-400 body-font mb-4">
                                {opportunity.claimsRemaining} of {opportunity.totalClaims} claims left
                              </div>

                              {opportunity.status === "available" ? (
                                <Button
                                  onClick={() => claimOpportunity(opportunity.id)}
                                  disabled={claimingOpportunity === opportunity.id}
                                  className="bg-[#E75837] hover:bg-[#d04e30] text-white body-font w-full mb-2"
                                >
                                  {claimingOpportunity === opportunity.id ? (
                                    <>
                                      <Timer className="w-4 h-4 mr-2 animate-spin" />
                                      Claiming...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Claim Opportunity
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 body-font w-full justify-center py-2">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Claimed
                                </Badge>
                              )}

                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="flex-1 body-font bg-transparent">
                                  <Phone className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 body-font bg-transparent">
                                  <MessageCircle className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Why You Were Selected */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="font-medium text-green-800 mb-2 header-font flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Why You Were Selected for This Opportunity
                            </h5>

                            <div className="space-y-3">
                              <div>
                                <h6 className="text-sm font-medium text-green-700 header-font">
                                  Perfect Match Factors:
                                </h6>
                                <ul className="text-sm text-green-600 body-font ml-4 space-y-1">
                                  {opportunity.whySelected.primary.map((reason, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <CheckCircle className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {opportunity.whySelected.secondary.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-green-700 header-font">
                                    Additional Benefits:
                                  </h6>
                                  <ul className="text-sm text-green-600 body-font ml-4 space-y-1">
                                    {opportunity.whySelected.secondary.map((reason, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                                        {reason}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {opportunity.whySelected.concerns.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-orange-700 header-font">Considerations:</h6>
                                  <ul className="text-sm text-orange-600 body-font ml-4 space-y-1">
                                    {opportunity.whySelected.concerns.map((concern, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <AlertCircle className="w-3 h-3 mt-0.5 text-orange-500 flex-shrink-0" />
                                        {concern}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Opportunity Metadata */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t">
                            <div className="flex items-center gap-4">
                              <span className="body-font">Posted: {getTimeElapsed(opportunity.postedAt)}</span>
                              <span className="body-font">Expires: {getTimeRemaining(opportunity.expiresAt)}</span>
                            </div>
                            <Badge variant="outline" className="body-font">
                              ID: {opportunity.id}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {getOpportunitiesByTier(tier as 1 | 2 | 3).length === 0 && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <div className="text-gray-400 mb-4">
                            <Award className="w-12 h-12 mx-auto" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-500 mb-2 header-font">
                            No Tier {tier} opportunities available
                          </h3>
                          <p className="text-gray-400 body-font">
                            Check back soon for new opportunities that match your expertise.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
