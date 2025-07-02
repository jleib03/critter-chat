"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, Heart, Brain, Target, AlertCircle, CheckCircle, Star, Search, Zap, Award } from "lucide-react"
import {
  DEMO_SERVICE_REQUEST,
  DEMO_MATCHED_PROFESSIONALS,
  DEMO_MATCH_REASONING,
  getTimeElapsed,
} from "../../../utils/demo-data"
import type { ServiceRequest } from "../../../types/concierge"

interface ProfessionalMatch {
  professionalId: string
  name: string
  type: string
  rating: number
  totalReviews: number
  specialties: string[]
  location: {
    distance: number
    area: string
  }
  availability: {
    nextAvailable: string
    flexibility: string
  }
  tier: number
  matchScore: number
  reasoning: {
    primary: string[]
    secondary: string[]
    concerns: string[]
  }
  estimatedCost: string
  responseRate: number
  lastActive: string
}

export default function ConciergeAdminPage() {
  const [activeRequests, setActiveRequests] = useState<ServiceRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [professionalMatches, setProfessionalMatches] = useState<ProfessionalMatch[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  useEffect(() => {
    // Load demo data
    setActiveRequests([DEMO_SERVICE_REQUEST])
    setSelectedRequest(DEMO_SERVICE_REQUEST)

    // Auto-start analysis for demo
    setTimeout(() => {
      analyzeRequest(DEMO_SERVICE_REQUEST)
    }, 1000)
  }, [])

  const analyzeRequest = async (request: ServiceRequest) => {
    setSelectedRequest(request)
    setIsAnalyzing(true)
    setAnalysisComplete(false)

    // Simulate AI analysis with realistic timing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Convert demo data to match interface
    const mockMatches: ProfessionalMatch[] = DEMO_MATCHED_PROFESSIONALS.map((prof) => ({
      professionalId: prof.id,
      name: prof.name,
      type: prof.type,
      rating: prof.rating,
      totalReviews: prof.totalReviews,
      specialties: prof.specialties,
      location: prof.location,
      availability: {
        nextAvailable: prof.availability.nextAvailable,
        flexibility: prof.availability.flexibility,
      },
      tier: prof.id === "prof_maria_rodriguez" ? 1 : prof.id === "prof_chicago_k9_team" ? 1 : 2,
      matchScore: prof.matchScore,
      reasoning: DEMO_MATCH_REASONING[prof.id as keyof typeof DEMO_MATCH_REASONING],
      estimatedCost: prof.pricing.estimatedCost,
      responseRate: prof.id === "prof_maria_rodriguez" ? 98 : prof.id === "prof_chicago_k9_team" ? 92 : 85,
      lastActive:
        prof.id === "prof_maria_rodriguez"
          ? "5 minutes ago"
          : prof.id === "prof_chicago_k9_team"
            ? "12 minutes ago"
            : "28 minutes ago",
    }))

    setProfessionalMatches(mockMatches)
    setIsAnalyzing(false)
    setAnalysisComplete(true)
  }

  const routeToTier = (matches: ProfessionalMatch[], tier: number) => {
    return matches.filter((match) => match.tier === tier)
  }

  const sendToTier = async (tier: number) => {
    console.log(`Routing request ${selectedRequest?.id} to Tier ${tier} professionals`)

    // Simulate sending notifications
    const tierProfessionals = routeToTier(professionalMatches, tier)

    // Show success feedback
    alert(
      `✅ Successfully routed to ${tierProfessionals.length} Tier ${tier} professionals!\n\nNotifications sent to:\n${tierProfessionals.map((p) => `• ${p.name}`).join("\n")}`,
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold header-font">Concierge Admin Dashboard</h1>
            <p className="text-gray-600 body-font">Chicago Metro Team • Live Demo Environment</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="body-font">
              {activeRequests.length} Active Request{activeRequests.length !== 1 ? "s" : ""}
            </Badge>
            <Badge className="bg-[#E75837] text-white body-font">
              <Zap className="w-3 h-3 mr-1" />
              AI Analysis Ready
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Requests */}
        <div className="w-1/3 border-r bg-white overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold header-font mb-3">Pending Requests</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg body-font"
              />
            </div>
          </div>

          <div className="space-y-2 p-4">
            {activeRequests.map((request) => (
              <Card
                key={request.id}
                className={`cursor-pointer transition-all ${
                  selectedRequest?.id === request.id ? "ring-2 ring-[#E75837] bg-orange-50" : "hover:shadow-md"
                }`}
                onClick={() => analyzeRequest(request)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium header-font">{request.pets.map((p) => p.name).join(", ")}</h3>
                      <p className="text-sm text-gray-600 body-font">
                        {request.contactInfo.firstName} {request.contactInfo.lastName}
                      </p>
                    </div>
                    <Badge
                      variant={request.timing.urgency === "asap" ? "destructive" : "secondary"}
                      className="body-font"
                    >
                      {request.timing.urgency.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="body-font">{request.location.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="body-font">{getTimeElapsed(request.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {request.services.slice(0, 2).map((service) => (
                      <Badge key={service} variant="outline" className="text-xs body-font">
                        {service.replace("_", " ")}
                      </Badge>
                    ))}
                    {request.services.length > 2 && (
                      <Badge variant="outline" className="text-xs body-font">
                        +{request.services.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Special needs highlight */}
                  {request.pets.some((pet) => pet.specialNeeds.length > 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                      <p className="text-xs text-yellow-700 body-font">
                        ⚠️ Special needs:{" "}
                        {request.pets
                          .flatMap((p) => p.specialNeeds)
                          .slice(0, 2)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Panel - Analysis */}
        <div className="flex-1 overflow-y-auto">
          {!selectedRequest ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="body-font">Select a request to begin AI analysis</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Request Details */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 header-font">
                    <Heart className="w-5 h-5 text-[#E75837]" />
                    Request Details - {selectedRequest.pets.map((p) => p.name).join(", ")}
                    <Badge className="ml-2 bg-blue-100 text-blue-800 body-font">ID: {selectedRequest.id}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1 header-font">Pet Information</h4>
                      {selectedRequest.pets.map((pet) => (
                        <div key={pet.id} className="text-sm body-font">
                          <p>
                            <strong>{pet.name}</strong> - {pet.breed} {pet.type}
                          </p>
                          <p className="text-gray-600">
                            {pet.age} years, {pet.weight} lbs ({pet.size})
                          </p>
                          {pet.specialNeeds.length > 0 && (
                            <div className="mt-1">
                              <p className="text-orange-600 font-medium">Special needs:</p>
                              <ul className="text-orange-600 ml-2">
                                {pet.specialNeeds.map((need, idx) => (
                                  <li key={idx}>• {need}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {pet.medications.length > 0 && (
                            <div className="mt-1">
                              <p className="text-blue-600 font-medium">Medications:</p>
                              <ul className="text-blue-600 ml-2">
                                {pet.medications.map((med, idx) => (
                                  <li key={idx}>• {med}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-1 header-font">Services & Timing</h4>
                      <div className="text-sm body-font">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {selectedRequest.services.map((service) => (
                            <Badge key={service} variant="secondary" className="text-xs">
                              {service.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-gray-600">
                          <strong>Urgency:</strong> {selectedRequest.timing.urgency.replace("_", " ")}
                        </p>
                        {selectedRequest.timing.preferredDate && (
                          <p className="text-gray-600">
                            <strong>Preferred:</strong>{" "}
                            {new Date(selectedRequest.timing.preferredDate).toLocaleDateString()}
                            {selectedRequest.timing.preferredTime && ` at ${selectedRequest.timing.preferredTime}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-1 header-font">Budget & Location</h4>
                      <div className="text-sm body-font">
                        <p>
                          <strong>Budget:</strong> ${selectedRequest.budget.min} - ${selectedRequest.budget.max}
                          {selectedRequest.budget.flexible && <span className="text-green-600"> (Flexible)</span>}
                        </p>
                        <p className="text-gray-600">
                          <strong>Location:</strong> {selectedRequest.location.city}, {selectedRequest.location.state}{" "}
                          {selectedRequest.location.zipCode}
                        </p>
                        <p className="text-gray-600">
                          <strong>Experience:</strong> {selectedRequest.preferences.experienceLevel}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedRequest.additionalNotes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h4 className="font-medium text-yellow-800 mb-1 header-font">Special Notes</h4>
                      <p className="text-sm text-yellow-700 body-font">{selectedRequest.additionalNotes}</p>
                    </div>
                  )}

                  {selectedRequest.preferences.specialRequirements.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <h4 className="font-medium text-blue-800 mb-1 header-font">Special Requirements</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedRequest.preferences.specialRequirements.map((req, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs text-blue-700 border-blue-300">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Analysis Results */}
              {isAnalyzing ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Brain className="w-12 h-12 text-[#E75837] mx-auto mb-4 animate-pulse" />
                    <h3 className="text-lg font-semibold mb-2 header-font">AI Analysis in Progress</h3>
                    <p className="text-gray-600 body-font mb-4">
                      Analyzing pet needs, professional capabilities, and optimal matches...
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 body-font">
                      <p>✓ Processing pet medical requirements</p>
                      <p>✓ Evaluating professional specialties</p>
                      <p>✓ Calculating geographic proximity</p>
                      <p className="animate-pulse">⏳ Generating match scores and reasoning...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : analysisComplete && professionalMatches.length > 0 ? (
                <Tabs defaultValue="tier1" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                      <TabsTrigger value="tier1" className="body-font">
                        Tier 1 ({routeToTier(professionalMatches, 1).length})
                      </TabsTrigger>
                      <TabsTrigger value="tier2" className="body-font">
                        Tier 2 ({routeToTier(professionalMatches, 2).length})
                      </TabsTrigger>
                      <TabsTrigger value="tier3" className="body-font">
                        Tier 3 ({routeToTier(professionalMatches, 3).length})
                      </TabsTrigger>
                    </TabsList>

                    <Badge className="bg-green-100 text-green-800 body-font">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Analysis Complete
                    </Badge>
                  </div>

                  {[1, 2, 3].map((tier) => (
                    <TabsContent key={tier} value={`tier${tier}`} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold header-font">
                            Tier {tier} Professionals
                            {tier === 1 && " - Perfect Matches"}
                            {tier === 2 && " - Good Alternatives"}
                            {tier === 3 && " - Backup Options"}
                          </h3>
                          <p className="text-sm text-gray-600 body-font">
                            {tier === 1 && "Highest compatibility with pet needs and customer requirements"}
                            {tier === 2 && "Solid matches with minor considerations"}
                            {tier === 3 && "Available options with some limitations"}
                          </p>
                        </div>
                        <Button
                          onClick={() => sendToTier(tier)}
                          className="bg-[#E75837] hover:bg-[#d04e30] body-font"
                          disabled={routeToTier(professionalMatches, tier).length === 0}
                        >
                          Route to Tier {tier} ({routeToTier(professionalMatches, tier).length})
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {routeToTier(professionalMatches, tier).map((match) => (
                          <Card
                            key={match.professionalId}
                            className="border-2 border-gray-200 hover:border-[#E75837] transition-colors"
                          >
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-lg header-font">{match.name}</h4>
                                    <Badge
                                      className={`${
                                        match.matchScore >= 95
                                          ? "bg-green-100 text-green-800"
                                          : match.matchScore >= 85
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-orange-100 text-orange-800"
                                      } body-font`}
                                    >
                                      {match.matchScore}% Match
                                    </Badge>
                                    <Badge variant="outline" className="body-font capitalize">
                                      {match.type.replace("_", " ")}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                      <span className="body-font">
                                        {match.rating} ({match.totalReviews} reviews)
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      <span className="body-font">
                                        {match.location.distance} mi - {match.location.area}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span className="body-font">{match.availability.nextAvailable}</span>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-1 mb-4">
                                    {match.specialties.slice(0, 4).map((specialty) => (
                                      <Badge key={specialty} variant="secondary" className="text-xs body-font">
                                        {specialty}
                                      </Badge>
                                    ))}
                                    {match.specialties.length > 4 && (
                                      <Badge variant="secondary" className="text-xs body-font">
                                        +{match.specialties.length - 4} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right ml-4">
                                  <div className="text-2xl font-bold text-[#E75837] body-font">
                                    {match.estimatedCost}
                                  </div>
                                  <div className="text-sm text-gray-500 body-font">Estimated cost</div>
                                  <div className="text-xs text-gray-400 body-font mt-1">
                                    {match.responseRate}% response rate
                                  </div>
                                </div>
                              </div>

                              {/* AI Reasoning */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <h5 className="font-medium text-blue-800 mb-2 header-font flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  AI Match Reasoning
                                </h5>

                                <div className="space-y-3">
                                  <div>
                                    <h6 className="text-sm font-medium text-blue-700 header-font">
                                      Perfect Match Factors:
                                    </h6>
                                    <ul className="text-sm text-blue-600 body-font ml-4 space-y-1">
                                      {match.reasoning.primary.map((reason, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <CheckCircle className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                                          {reason}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {match.reasoning.secondary.length > 0 && (
                                    <div>
                                      <h6 className="text-sm font-medium text-blue-700 header-font">
                                        Additional Benefits:
                                      </h6>
                                      <ul className="text-sm text-blue-600 body-font ml-4 space-y-1">
                                        {match.reasoning.secondary.map((reason, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                                            {reason}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {match.reasoning.concerns.length > 0 && (
                                    <div>
                                      <h6 className="text-sm font-medium text-orange-700 header-font">
                                        Considerations:
                                      </h6>
                                      <ul className="text-sm text-orange-600 body-font ml-4 space-y-1">
                                        {match.reasoning.concerns.map((concern, index) => (
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

                              {/* Professional Status */}
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-4">
                                  <span className="body-font">Last active: {match.lastActive}</span>
                                  <span className="body-font">Flexibility: {match.availability.flexibility}</span>
                                </div>
                                <Badge
                                  className={`${
                                    match.responseRate >= 95
                                      ? "bg-green-100 text-green-800"
                                      : match.responseRate >= 85
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  } body-font`}
                                >
                                  <Award className="w-3 h-3 mr-1" />
                                  {match.responseRate}% Response Rate
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {routeToTier(professionalMatches, tier).length === 0 && (
                          <Card>
                            <CardContent className="p-8 text-center">
                              <div className="text-gray-400 mb-4">
                                <Award className="w-12 h-12 mx-auto" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-500 mb-2 header-font">
                                No Tier {tier} matches found
                              </h3>
                              <p className="text-gray-400 body-font">
                                All qualified professionals are in higher tiers for this request.
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Button
                      onClick={() => analyzeRequest(selectedRequest)}
                      size="lg"
                      className="bg-[#E75837] hover:bg-[#d04e30] body-font"
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      Start AI Analysis
                    </Button>
                    <p className="text-sm text-gray-500 mt-3 body-font">
                      Click to analyze this request and generate professional matches
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
