"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, Heart, DollarSign, Star, AlertCircle, CheckCircle, Target, Timer, Award } from "lucide-react"

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
  }>
  services: string[]
  location: {
    distance: number
    area: string
  }
  timing: {
    urgency: string
    preferredDate?: string
    preferredTime?: string
  }
  budget: {
    min: number
    max: number
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
}

export default function ProfessionalOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ServiceOpportunity[]>([])
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(1)
  const [professionalProfile] = useState({
    name: "Dr. Maria Rodriguez",
    specialties: ["Post-Surgical Care", "Large Breed Specialists", "Physical Therapy"],
    rating: 4.9,
    totalJobs: 156,
    responseRate: 98,
  })

  useEffect(() => {
    // Mock opportunities data
    const mockOpportunities: ServiceOpportunity[] = [
      {
        id: "opp_001",
        tier: 1,
        customerName: "Sarah J.",
        pets: [
          {
            name: "Luna",
            type: "dog",
            breed: "German Shepherd",
            age: 3,
            specialNeeds: ["Hip dysplasia monitoring", "Post-surgical care"],
          },
        ],
        services: ["dog_walking", "pet_sitting"],
        location: {
          distance: 0.8,
          area: "Lincoln Park",
        },
        timing: {
          urgency: "this_week",
          preferredDate: "2024-01-15",
          preferredTime: "14:00",
        },
        budget: {
          min: 75,
          max: 150,
        },
        whySelected: {
          primary: [
            "You have veterinary background with post-surgical experience",
            "You're a German Shepherd breed specialist (noted you own 2 GSDs)",
            "You've successfully handled a similar hip dysplasia case for the Johnson family",
            "You're located in the same neighborhood as the customer",
          ],
          secondary: [
            "Your premium service tier matches their budget flexibility",
            "You're available within their requested timeframe",
            "You have excellent customer reviews for medical cases (4.9/5 stars)",
          ],
          concerns: [],
        },
        estimatedEarnings: "$120-150",
        postedAt: "2024-01-10T14:30:00Z",
        expiresAt: "2024-01-10T18:30:00Z",
        claimsRemaining: 2,
        totalClaims: 3,
        status: "available",
      },
      {
        id: "opp_002",
        tier: 2,
        customerName: "Michael K.",
        pets: [
          {
            name: "Buddy",
            type: "dog",
            breed: "Golden Retriever",
            age: 7,
            specialNeeds: ["Senior care", "Arthritis management"],
          },
        ],
        services: ["pet_sitting", "medication_admin"],
        location: {
          distance: 2.1,
          area: "Old Town",
        },
        timing: {
          urgency: "flexible",
          preferredDate: "2024-01-18",
        },
        budget: {
          min: 60,
          max: 100,
        },
        whySelected: {
          primary: ["Your experience with senior pet care", "You're comfortable with medication administration"],
          secondary: ["Good availability match", "Within reasonable distance"],
          concerns: ["Budget is below your typical premium rate", "Distance is further than your usual service area"],
        },
        estimatedEarnings: "$80-100",
        postedAt: "2024-01-10T12:15:00Z",
        expiresAt: "2024-01-11T12:15:00Z",
        claimsRemaining: 1,
        totalClaims: 2,
        status: "available",
      },
    ]

    setOpportunities(mockOpportunities)
  }, [])

  const getOpportunitiesByTier = (tier: number) => {
    return opportunities.filter((opp) => opp.tier === tier)
  }

  const getTierDescription = (tier: number) => {
    switch (tier) {
      case 1:
        return "Perfect matches based on your expertise and specialties"
      case 2:
        return "Good opportunities that align with your capabilities"
      case 3:
        return "Additional opportunities in your service area"
      default:
        return ""
    }
  }

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return "text-green-600 bg-green-50 border-green-200"
      case 2:
        return "text-blue-600 bg-blue-50 border-blue-200"
      case 3:
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const claimOpportunity = async (opportunityId: string) => {
    // In real implementation, this would:
    // 1. Send claim request to concierge team
    // 2. Update opportunity status
    // 3. Notify customer of professional interest
    console.log(`Claiming opportunity ${opportunityId}`)

    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === opportunityId
          ? { ...opp, status: "claimed" as const, claimsRemaining: opp.claimsRemaining - 1 }
          : opp,
      ),
    )
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (diff <= 0) return "Expired"
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold header-font">Service Opportunities</h1>
            <p className="text-gray-600 body-font">Welcome back, {professionalProfile.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500 body-font">Your Stats</div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 body-font">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  {professionalProfile.rating}
                </span>
                <span className="body-font">{professionalProfile.totalJobs} jobs</span>
                <span className="body-font">{professionalProfile.responseRate}% response rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((tier) => {
            const tierOpps = getOpportunitiesByTier(tier)
            const availableOpps = tierOpps.filter((opp) => opp.status === "available")

            return (
              <Card key={tier} className={`border-2 ${getTierColor(tier)}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold header-font">Tier {tier}</h3>
                    <Badge variant="secondary" className="body-font">
                      {availableOpps.length} available
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 body-font mb-4">{getTierDescription(tier)}</p>
                  <div className="text-2xl font-bold">{availableOpps.length}</div>
                  <div className="text-sm text-gray-500 body-font">new opportunities</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Opportunities Tabs */}
        <Tabs defaultValue="tier1" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tier1" className="body-font">
              Tier 1 - Perfect Matches ({getOpportunitiesByTier(1).filter((o) => o.status === "available").length})
            </TabsTrigger>
            <TabsTrigger value="tier2" className="body-font">
              Tier 2 - Good Fits ({getOpportunitiesByTier(2).filter((o) => o.status === "available").length})
            </TabsTrigger>
            <TabsTrigger value="tier3" className="body-font">
              Tier 3 - Additional ({getOpportunitiesByTier(3).filter((o) => o.status === "available").length})
            </TabsTrigger>
          </TabsList>

          {[1, 2, 3].map((tier) => (
            <TabsContent key={tier} value={`tier${tier}`} className="space-y-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2 header-font">Tier {tier} Opportunities</h2>
                <p className="text-gray-600 body-font">{getTierDescription(tier)}</p>
              </div>

              <div className="space-y-6">
                {getOpportunitiesByTier(tier).map((opportunity) => (
                  <Card key={opportunity.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 header-font">
                            <Heart className="w-5 h-5 text-[#E75837]" />
                            {opportunity.pets.map((p) => p.name).join(", ")} - {opportunity.customerName}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
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
                              <DollarSign className="w-4 h-4" />
                              <span className="body-font">
                                ${opportunity.budget.min}-${opportunity.budget.max}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#E75837] body-font">
                            {opportunity.estimatedEarnings}
                          </div>
                          <div className="text-sm text-gray-500 body-font">Estimated earnings</div>
                          {opportunity.status === "available" && (
                            <div className="text-xs text-orange-600 mt-1 body-font">
                              <Timer className="w-3 h-3 inline mr-1" />
                              {getTimeRemaining(opportunity.expiresAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Pet Details */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2 header-font">Pet Details</h4>
                        {opportunity.pets.map((pet, index) => (
                          <div key={index} className="text-sm body-font">
                            <p>
                              <strong>{pet.name}</strong> - {pet.breed} {pet.type}, {pet.age} years old
                            </p>
                            {pet.specialNeeds.length > 0 && (
                              <p className="text-orange-600">Special needs: {pet.specialNeeds.join(", ")}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Services */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2 header-font">Services Requested</h4>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.services.map((service) => (
                            <Badge key={service} variant="secondary" className="body-font">
                              {service.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Why You Were Selected */}
                      <div className={`border-2 rounded-lg p-4 ${getTierColor(tier)}`}>
                        <h4 className="font-medium mb-3 header-font flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Why You Were Selected for Tier {tier}
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-green-700 header-font">Perfect Match Reasons:</h5>
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
                              <h5 className="text-sm font-medium text-blue-700 header-font">Additional Benefits:</h5>
                              <ul className="text-sm text-blue-600 body-font ml-4 space-y-1">
                                {opportunity.whySelected.secondary.map((reason, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {opportunity.whySelected.concerns.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-orange-700 header-font">Considerations:</h5>
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

                      {/* Timing Details */}
                      {opportunity.timing.preferredDate && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 header-font">Preferred Schedule</h4>
                          <p className="text-sm text-gray-600 body-font">
                            {new Date(opportunity.timing.preferredDate).toLocaleDateString()}
                            {opportunity.timing.preferredTime && ` at ${opportunity.timing.preferredTime}`}
                          </p>
                        </div>
                      )}

                      {/* Action Area */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="body-font">
                            {opportunity.claimsRemaining} of {opportunity.totalClaims} claims remaining
                          </span>
                          <span className="body-font">
                            Posted {new Date(opportunity.postedAt).toLocaleTimeString()}
                          </span>
                        </div>

                        {opportunity.status === "available" ? (
                          <Button
                            onClick={() => claimOpportunity(opportunity.id)}
                            className="bg-[#E75837] hover:bg-[#d04e30] body-font"
                          >
                            Claim This Opportunity
                          </Button>
                        ) : opportunity.status === "claimed" ? (
                          <Badge variant="secondary" className="body-font">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Claimed
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="body-font">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {getOpportunitiesByTier(tier).length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-500 mb-2 header-font">
                        No Tier {tier} opportunities right now
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
      </div>
    </div>
  )
}
