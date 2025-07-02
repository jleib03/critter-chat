"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, Heart, Brain, Target, AlertCircle, CheckCircle, Star, Filter, Search } from "lucide-react"
import type { ServiceRequest } from "../../types/concierge"

export default function ConciergeAdminPage() {
  const [activeRequests, setActiveRequests] = useState<ServiceRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [professionalMatches, setProfessionalMatches] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const mockRequests: ServiceRequest[] = [
      {
        id: "req_001",
        customerId: "cust_001",
        pets: [
          {
            id: "pet_001",
            name: "Luna",
            type: "dog",
            breed: "German Shepherd",
            age: 3,
            size: "large",
            weight: 75,
            temperament: ["energetic", "social"],
            specialNeeds: ["Hip dysplasia monitoring"],
            medications: ["Joint supplement"],
            vetInfo: {
              clinicName: "Lincoln Park Animal Hospital",
              phone: "(312) 555-0123",
              address: "123 Lincoln Ave, Chicago, IL",
            },
            emergencyContact: {
              name: "Sarah Johnson",
              phone: "(312) 555-0456",
              relationship: "Owner",
            },
            preferences: {
              favoriteActivities: ["Fetch", "Swimming"],
              dislikes: ["Loud noises"],
              specialInstructions: "Needs gentle handling due to hip condition",
            },
          },
        ],
        services: ["dog_walking", "pet_sitting"],
        location: {
          address: "456 N Lake Shore Dr",
          city: "Chicago",
          state: "IL",
          zipCode: "60611",
        },
        timing: {
          urgency: "this_week",
          preferredDate: "2024-01-15",
          preferredTime: "14:00",
        },
        budget: {
          min: 75,
          max: 150,
          flexible: true,
        },
        preferences: {
          professionalType: "no_preference",
          experienceLevel: "experienced",
          specialRequirements: ["Large dog experience", "Medical condition awareness"],
        },
        additionalNotes: "Luna is recovering from hip surgery and needs someone experienced with post-op care.",
        contactInfo: {
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.j@email.com",
          phone: "(312) 555-0456",
          preferredContact: "phone",
        },
        createdAt: "2024-01-10T10:30:00Z",
        status: "pending",
      },
    ]

    setActiveRequests(mockRequests)
  }, [])

  const analyzeRequest = async (request: ServiceRequest) => {
    setSelectedRequest(request)
    setIsAnalyzing(true)

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockMatches = [
      {
        professionalId: "prof_001",
        name: "Dr. Maria Rodriguez - Canine Rehabilitation Specialists",
        type: "premium",
        rating: 4.9,
        totalReviews: 156,
        specialties: ["Post-Surgical Care", "Large Breed Specialists", "Physical Therapy"],
        location: {
          distance: 0.8,
          area: "Lincoln Park",
        },
        availability: {
          nextAvailable: "Today 3:00 PM",
          flexibility: "high",
        },
        tier: 1,
        matchScore: 96,
        reasoning: {
          primary: [
            "Veterinary background with post-surgical experience",
            "German Shepherd breed specialist (owns 2 GSDs)",
            "Previous client with similar hip dysplasia case",
            "Located in same neighborhood",
          ],
          secondary: [
            "Premium service tier matches budget flexibility",
            "Available within requested timeframe",
            "Excellent customer reviews for medical cases",
          ],
          concerns: [],
        },
        estimatedCost: "$120-150",
        responseRate: 98,
        lastActive: "2 hours ago",
      },
      {
        professionalId: "prof_002",
        name: "Chicago K9 Care Team",
        type: "team",
        rating: 4.7,
        totalReviews: 234,
        specialties: ["Large Dogs", "Team Care", "Flexible Scheduling"],
        location: {
          distance: 1.2,
          area: "Old Town",
        },
        availability: {
          nextAvailable: "Tomorrow 9:00 AM",
          flexibility: "medium",
        },
        tier: 1,
        matchScore: 89,
        reasoning: {
          primary: [
            "Team approach allows for consistent care coverage",
            "Strong large dog experience (60% of clients)",
            "Flexible scheduling matches customer needs",
          ],
          secondary: ["Good rating and review history", "Reasonable distance from customer", "Within budget range"],
          concerns: ["No specific post-surgical experience mentioned", "Team approach may lack continuity"],
        },
        estimatedCost: "$85-110",
        responseRate: 92,
        lastActive: "1 hour ago",
      },
      {
        professionalId: "prof_003",
        name: "Jake's Dog Walking Service",
        type: "individual",
        rating: 4.5,
        totalReviews: 89,
        specialties: ["Dog Walking", "Pet Sitting", "Neighborhood Service"],
        location: {
          distance: 0.5,
          area: "Lincoln Park",
        },
        availability: {
          nextAvailable: "Today 2:00 PM",
          flexibility: "low",
        },
        tier: 2,
        matchScore: 72,
        reasoning: {
          primary: ["Very close proximity to customer", "Available immediately", "Budget-friendly option"],
          secondary: ["Local neighborhood knowledge", "Reliable service history"],
          concerns: [
            "Limited experience with medical conditions",
            "No specialized training mentioned",
            "Lower rating compared to other options",
          ],
        },
        estimatedCost: "$45-65",
        responseRate: 85,
        lastActive: "30 minutes ago",
      },
    ]

    setProfessionalMatches(mockMatches)
    setIsAnalyzing(false)
  }

  const routeToTier = (matches: any[], tier: number) => {
    return matches.filter((match) => match.tier === tier)
  }

  const sendToTier = async (tier: number) => {
    // In real implementation, this would:
    // 1. Send notifications to professionals in the tier
    // 2. Create claiming opportunities
    // 3. Set up monitoring for responses
    console.log(`Routing request ${selectedRequest?.id} to Tier ${tier} professionals`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold header-font">Concierge Admin Dashboard</h1>
            <p className="text-gray-600 body-font">Chicago Metro Team</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="body-font">
              {activeRequests.length} Active Requests
            </Badge>
            <Button variant="outline" size="sm" className="body-font bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
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
                  selectedRequest?.id === request.id ? "ring-2 ring-[#E75837]" : "hover:shadow-md"
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
                      <span className="body-font">{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
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
                            {pet.age} years, {pet.weight} lbs
                          </p>
                          {pet.specialNeeds.length > 0 && (
                            <p className="text-orange-600">Special needs: {pet.specialNeeds.join(", ")}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-1 header-font">Services & Timing</h4>
                      <div className="text-sm body-font">
                        <p className="mb-1">{selectedRequest.services.map((s) => s.replace("_", " ")).join(", ")}</p>
                        <p className="text-gray-600">
                          {selectedRequest.timing.urgency.replace("_", " ")}
                          {selectedRequest.timing.preferredDate &&
                            ` - ${new Date(selectedRequest.timing.preferredDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-1 header-font">Budget & Location</h4>
                      <div className="text-sm body-font">
                        <p>
                          ${selectedRequest.budget.min} - ${selectedRequest.budget.max}
                        </p>
                        <p className="text-gray-600">
                          {selectedRequest.location.city}, {selectedRequest.location.state}
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
                </CardContent>
              </Card>

              {/* AI Analysis Results */}
              {isAnalyzing ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Brain className="w-12 h-12 text-[#E75837] mx-auto mb-4 animate-pulse" />
                    <h3 className="text-lg font-semibold mb-2 header-font">AI Analysis in Progress</h3>
                    <p className="text-gray-600 body-font">
                      Analyzing pet needs, professional capabilities, and optimal matches...
                    </p>
                  </CardContent>
                </Card>
              ) : professionalMatches.length > 0 ? (
                <Tabs defaultValue="tier1" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
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

                  {[1, 2, 3].map((tier) => (
                    <TabsContent key={tier} value={`tier${tier}`} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold header-font">
                          Tier {tier} Professionals
                          {tier === 1 && " - Best Matches"}
                          {tier === 2 && " - Good Alternatives"}
                          {tier === 3 && " - Backup Options"}
                        </h3>
                        <Button onClick={() => sendToTier(tier)} className="bg-[#E75837] hover:bg-[#d04e30] body-font">
                          Route to Tier {tier}
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {routeToTier(professionalMatches, tier).map((match) => (
                          <Card key={match.professionalId}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-semibold text-lg header-font">{match.name}</h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
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
                                    <Badge variant="outline" className="body-font">
                                      {match.type}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-[#E75837] body-font">{match.matchScore}%</div>
                                  <div className="text-sm text-gray-500 body-font">Match Score</div>
                                </div>
                              </div>

                              {/* AI Reasoning */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <h5 className="font-medium text-blue-800 mb-2 header-font flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  AI Match Reasoning
                                </h5>

                                <div className="space-y-2">
                                  <div>
                                    <h6 className="text-sm font-medium text-blue-700 header-font">
                                      Primary Strengths:
                                    </h6>
                                    <ul className="text-sm text-blue-600 body-font ml-4">
                                      {match.reasoning.primary.map((reason, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <CheckCircle className="w-3 h-3 mt-0.5 text-green-500" />
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
                                      <ul className="text-sm text-blue-600 body-font ml-4">
                                        {match.reasoning.secondary.map((reason, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="w-3 h-3 mt-0.5 text-blue-500" />
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
                                      <ul className="text-sm text-orange-600 body-font ml-4">
                                        {match.reasoning.concerns.map((concern, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <AlertCircle className="w-3 h-3 mt-0.5 text-orange-500" />
                                            {concern}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Professional Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <h6 className="font-medium text-gray-700 header-font">Specialties</h6>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {match.specialties.map((specialty) => (
                                      <Badge key={specialty} variant="secondary" className="text-xs body-font">
                                        {specialty}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h6 className="font-medium text-gray-700 header-font">Availability</h6>
                                  <p className="text-gray-600 body-font">{match.availability.nextAvailable}</p>
                                  <p className="text-xs text-gray-500 body-font">
                                    Flexibility: {match.availability.flexibility}
                                  </p>
                                </div>

                                <div>
                                  <h6 className="font-medium text-gray-700 header-font">Pricing & Response</h6>
                                  <p className="text-gray-600 body-font">{match.estimatedCost}</p>
                                  <p className="text-xs text-gray-500 body-font">{match.responseRate}% response rate</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Button
                      onClick={() => analyzeRequest(selectedRequest)}
                      className="bg-[#E75837] hover:bg-[#d04e30] body-font"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Start AI Analysis
                    </Button>
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
