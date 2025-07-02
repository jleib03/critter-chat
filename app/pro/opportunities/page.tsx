"use client"

import { useState, useEffect } from "react"
import { Clock, MapPin, Star, CheckCircle, Target, Timer, Award, Zap, Phone, MessageCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DEMO_SERVICE_REQUEST, DEMO_MATCH_REASONING, getTimeElapsed, getTimeRemaining } from "../../../utils/demo-data"

/* -------------------------------------------------------------------------- */
/*                                Type helpers                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                             Component definition                           */
/* -------------------------------------------------------------------------- */

export default function ProfessionalOpportunitiesPage() {
  /* ------------------------------- state ---------------------------------- */
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

  /* --------------------------- initialise mock ---------------------------- */
  useEffect(() => {
    const tier1Opportunity: ServiceOpportunity = {
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
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // +4 h
      claimsRemaining: 2,
      totalClaims: 3,
      status: "available",
      matchScore: 96,
      customerNotes: DEMO_SERVICE_REQUEST.additionalNotes,
    }

    const tier2Opportunity: ServiceOpportunity = {
      id: "req_20240110_002",
      tier: 2,
      customerName: "Michael K.",
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
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 h ago
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // +6 h
      claimsRemaining: 1,
      totalClaims: 2,
      status: "available",
      matchScore: 78,
      customerNotes:
        "Buddy is a sweet senior dog who loves gentle walks and needs someone patient with his slower pace.",
    }

    setOpportunities([tier1Opportunity, tier2Opportunity])
  }, [])

  /* ------------------------------ helpers --------------------------------- */
  const claimOpportunity = async (id: string) => {
    setClaimingOpportunity(id)
    await new Promise((r) => setTimeout(r, 1500))

    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === id ? { ...opp, status: "claimed" as const, claimsRemaining: opp.claimsRemaining - 1 } : opp,
      ),
    )
    setClaimingOpportunity(null)
    alert("🎉 Opportunity claimed! Customer will be notified shortly.")
  }

  const getOpportunitiesByTier = (tier: 1 | 2 | 3) => opportunities.filter((o) => o.tier === tier)

  const tierMeta = {
    1: {
      label: "Perfect matches",
      color: "bg-green-100 text-green-800",
    },
    2: {
      label: "Good fits",
      color: "bg-blue-100 text-blue-800",
    },
    3: {
      label: "Additional",
      color: "bg-orange-100 text-orange-800",
    },
  } as const

  /* ------------------------------ render ---------------------------------- */
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
              <div className="text-sm text-gray-500 body-font">This month</div>
              <div className="text-xl font-bold text-[#E75837] body-font">{professionalProfile.totalEarnings}</div>
            </div>
            <Badge className="bg-[#E75837] text-white body-font">
              <Star className="w-3 h-3 mr-1" />
              {professionalProfile.rating}
            </Badge>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#E75837] body-font">
                {professionalProfile.tier1Opportunities}
              </div>
              <div className="text-sm text-gray-500 body-font">Tier 1 this month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 body-font">{professionalProfile.tier2Opportunities}</div>
              <div className="text-sm text-gray-500 body-font">Tier 2 this month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 body-font">{professionalProfile.responseRate}%</div>
              <div className="text-sm text-gray-500 body-font">Response rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 body-font">{professionalProfile.totalJobs}</div>
              <div className="text-sm text-gray-500 body-font">Total jobs</div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunities wrapper */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 header-font">
              <Zap className="w-5 h-5 text-[#E75837]" />
              Available Opportunities
              <Badge variant="secondary" className="body-font">
                {opportunities.filter((o) => o.status === "available").length} active
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs
              value={`tier${selectedTier}`}
              onValueChange={(v) => setSelectedTier(Number(v.replace("tier", "")) as 1 | 2 | 3)}
            >
              {/* Tabs list */}
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                {[1, 2, 3].map((tier) => (
                  <TabsTrigger key={tier} value={`tier${tier}`} className="body-font">
                    Tier {tier} ({getOpportunitiesByTier(tier as 1 | 2 | 3).length})
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tabs content */}
              {[1, 2, 3].map((tier) => (
                <TabsContent key={tier} value={`tier${tier}`} className="space-y-4">
                  <h3 className="text-lg font-semibold header-font mb-1">Tier {tier}</h3>
                  <p className="text-sm text-gray-600 body-font mb-4">{tierMeta[tier as 1 | 2 | 3].label}</p>

                  {getOpportunitiesByTier(tier as 1 | 2 | 3).map((opp) => (
                    <Card key={opp.id} className="border-2 border-gray-200 hover:border-[#E75837] transition-colors">
                      <CardContent className="p-6">
                        {/* Top row */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg header-font">
                                {opp.pets.map((p) => p.name).join(", ")} – {opp.customerName}
                              </h4>
                              <Badge className={`${tierMeta[opp.tier].color} body-font`}>Tier {opp.tier}</Badge>
                              <Badge className="bg-green-100 text-green-800 body-font">{opp.matchScore}% Match</Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1 body-font">
                                <MapPin className="w-4 h-4" />
                                {opp.location.distance} mi – {opp.location.area}
                              </span>
                              <span className="flex items-center gap-1 body-font">
                                <Clock className="w-4 h-4" />
                                {opp.timing.urgency.replace("_", " ")}
                              </span>
                              <span className="flex items-center gap-1 body-font">
                                <Timer className="w-4 h-4" />
                                {getTimeRemaining(opp.expiresAt)}
                              </span>
                            </div>
                          </div>

                          {/* Earnings & claim */}
                          <div className="text-right ml-6">
                            <div className="text-2xl font-bold text-[#E75837] body-font mb-1">
                              {opp.estimatedEarnings}
                            </div>
                            <div className="text-sm text-gray-500 body-font mb-2">Estimated earnings</div>
                            <div className="text-xs text-gray-400 body-font mb-4">
                              {opp.claimsRemaining} of {opp.totalClaims} claims left
                            </div>

                            {opp.status === "available" ? (
                              <Button
                                disabled={claimingOpportunity === opp.id}
                                onClick={() => claimOpportunity(opp.id)}
                                className="bg-[#E75837] hover:bg-[#d04e30] w-full body-font mb-2"
                              >
                                {claimingOpportunity === opp.id ? (
                                  <>
                                    <Timer className="w-4 h-4 mr-1 animate-spin" />
                                    Claiming…
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
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

                        {/* Why selected */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <h5 className="font-medium text-green-800 header-font mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Why You Were Selected
                          </h5>

                          <div className="space-y-3">
                            {/* Primary */}
                            <div>
                              <h6 className="text-sm font-medium text-green-700 header-font">Perfect Match Factors</h6>
                              <ul className="ml-4 text-sm text-green-600 body-font list-disc">
                                {opp.whySelected.primary.map((reason, i) => (
                                  <li key={i}>{reason}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Secondary */}
                            {opp.whySelected.secondary.length > 0 && (
                              <div>
                                <h6 className="text-sm font-medium text-green-700 header-font">Additional Benefits</h6>
                                <ul className="ml-4 text-sm text-green-600 body-font list-disc">
                                  {opp.whySelected.secondary.map((reason, i) => (
                                    <li key={i}>{reason}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Concerns */}
                            {opp.whySelected.concerns.length > 0 && (
                              <div>
                                <h6 className="text-sm font-medium text-orange-700 header-font">Considerations</h6>
                                <ul className="ml-4 text-sm text-orange-600 body-font list-disc">
                                  {opp.whySelected.concerns.map((c, i) => (
                                    <li key={i}>{c}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                          <span className="body-font">Posted {getTimeElapsed(opp.postedAt)}</span>
                          <Badge variant="outline" className="body-font">
                            ID: {opp.id}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {getOpportunitiesByTier(tier as 1 | 2 | 3).length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-500 mb-2 header-font">
                          No Tier {tier} opportunities
                        </h4>
                        <p className="text-gray-400 body-font">Check back soon for new matches.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
