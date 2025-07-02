"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, X, MapPin, DollarSign, Heart } from "lucide-react"
import type { ServiceRequest } from "../../types/concierge"
import { DEMO_SERVICE_REQUEST } from "../../utils/demo-data"

interface ServiceRequestIntakeProps {
  onComplete: (request: ServiceRequest) => void
}

export function ServiceRequestIntake({ onComplete }: ServiceRequestIntakeProps) {
  // Pre-populate with demo data for smooth demo experience
  const [formData, setFormData] = useState({
    // Contact Info - pre-populated
    firstName: DEMO_SERVICE_REQUEST.contactInfo.firstName,
    lastName: DEMO_SERVICE_REQUEST.contactInfo.lastName,
    email: DEMO_SERVICE_REQUEST.contactInfo.email,
    phone: DEMO_SERVICE_REQUEST.contactInfo.phone,
    preferredContact: DEMO_SERVICE_REQUEST.contactInfo.preferredContact,

    // Location - pre-populated
    address: DEMO_SERVICE_REQUEST.location.address,
    city: DEMO_SERVICE_REQUEST.location.city,
    state: DEMO_SERVICE_REQUEST.location.state,
    zipCode: DEMO_SERVICE_REQUEST.location.zipCode,

    // Pet Info - pre-populated with Luna's details
    pets: DEMO_SERVICE_REQUEST.pets.map((pet) => ({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age.toString(),
      size: pet.size,
      weight: pet.weight?.toString() || "",
      temperament: pet.temperament,
      specialNeeds: pet.specialNeeds,
      medications: pet.medications,
      vetClinic: pet.vetInfo?.clinicName || "",
      vetPhone: pet.vetInfo?.phone || "",
      specialInstructions: pet.preferences?.specialInstructions || "",
    })),

    // Services - pre-populated
    services: DEMO_SERVICE_REQUEST.services,

    // Timing - pre-populated
    urgency: DEMO_SERVICE_REQUEST.timing.urgency,
    preferredDate: DEMO_SERVICE_REQUEST.timing.preferredDate || "",
    preferredTime: DEMO_SERVICE_REQUEST.timing.preferredTime || "",

    // Budget - pre-populated
    budgetMin: DEMO_SERVICE_REQUEST.budget.min.toString(),
    budgetMax: DEMO_SERVICE_REQUEST.budget.max.toString(),
    budgetFlexible: DEMO_SERVICE_REQUEST.budget.flexible,

    // Preferences - pre-populated
    professionalType: DEMO_SERVICE_REQUEST.preferences.professionalType,
    experienceLevel: DEMO_SERVICE_REQUEST.preferences.experienceLevel,
    specialRequirements: DEMO_SERVICE_REQUEST.preferences.specialRequirements,

    // Additional notes - pre-populated
    additionalNotes: DEMO_SERVICE_REQUEST.additionalNotes,
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const serviceOptions = [
    "dog_walking",
    "pet_sitting",
    "overnight_care",
    "grooming",
    "vet_visits",
    "medication_admin",
    "training",
    "transportation",
    "emergency_care",
  ]

  const temperamentOptions = [
    "friendly",
    "energetic",
    "calm",
    "social",
    "anxious",
    "protective",
    "playful",
    "independent",
  ]

  const handleSubmit = () => {
    // Convert form data back to ServiceRequest format
    const serviceRequest: ServiceRequest = {
      id: DEMO_SERVICE_REQUEST.id,
      customerId: DEMO_SERVICE_REQUEST.customerId,
      pets: formData.pets.map((pet, index) => ({
        id: `pet_${pet.name.toLowerCase()}_${index}`,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: Number.parseInt(pet.age),
        size: pet.size as "small" | "medium" | "large",
        weight: pet.weight ? Number.parseInt(pet.weight) : undefined,
        temperament: pet.temperament,
        specialNeeds: pet.specialNeeds,
        medications: pet.medications,
        vetInfo: pet.vetClinic
          ? {
              clinicName: pet.vetClinic,
              phone: pet.vetPhone,
              address: "",
            }
          : undefined,
        emergencyContact: {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          relationship: "Owner",
        },
        preferences: {
          favoriteActivities: [],
          dislikes: [],
          specialInstructions: pet.specialInstructions,
        },
      })),
      services: formData.services,
      location: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        coordinates: DEMO_SERVICE_REQUEST.location.coordinates,
      },
      timing: {
        urgency: formData.urgency as "asap" | "today" | "this_week" | "flexible",
        preferredDate: formData.preferredDate || undefined,
        preferredTime: formData.preferredTime || undefined,
      },
      budget: {
        min: Number.parseInt(formData.budgetMin),
        max: Number.parseInt(formData.budgetMax),
        flexible: formData.budgetFlexible,
      },
      preferences: {
        professionalType: formData.professionalType as "individual" | "team" | "no_preference",
        experienceLevel: formData.experienceLevel as "any" | "experienced" | "expert",
        specialRequirements: formData.specialRequirements,
      },
      additionalNotes: formData.additionalNotes,
      contactInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        preferredContact: formData.preferredContact as "phone" | "email" | "text",
      },
      createdAt: new Date().toISOString(),
      status: "pending",
    }

    onComplete(serviceRequest)
  }

  const addPet = () => {
    setFormData((prev) => ({
      ...prev,
      pets: [
        ...prev.pets,
        {
          name: "",
          type: "dog",
          breed: "",
          age: "",
          size: "medium",
          weight: "",
          temperament: [],
          specialNeeds: [],
          medications: [],
          vetClinic: "",
          vetPhone: "",
          specialInstructions: "",
        },
      ],
    }))
  }

  const removePet = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pets: prev.pets.filter((_, i) => i !== index),
    }))
  }

  const updatePet = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      pets: prev.pets.map((pet, i) => (i === index ? { ...pet, [field]: value } : pet)),
    }))
  }

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }))
  }

  const toggleTemperament = (petIndex: number, temperament: string) => {
    const pet = formData.pets[petIndex]
    const newTemperament = pet.temperament.includes(temperament)
      ? pet.temperament.filter((t) => t !== temperament)
      : [...pet.temperament, temperament]

    updatePet(petIndex, "temperament", newTemperament)
  }

  const addSpecialNeed = (petIndex: number, need: string) => {
    if (need.trim()) {
      const pet = formData.pets[petIndex]
      updatePet(petIndex, "specialNeeds", [...pet.specialNeeds, need.trim()])
    }
  }

  const removeSpecialNeed = (petIndex: number, needIndex: number) => {
    const pet = formData.pets[petIndex]
    updatePet(
      petIndex,
      "specialNeeds",
      pet.specialNeeds.filter((_, i) => i !== needIndex),
    )
  }

  const addMedication = (petIndex: number, medication: string) => {
    if (medication.trim()) {
      const pet = formData.pets[petIndex]
      updatePet(petIndex, "medications", [...pet.medications, medication.trim()])
    }
  }

  const removeMedication = (petIndex: number, medIndex: number) => {
    const pet = formData.pets[petIndex]
    updatePet(
      petIndex,
      "medications",
      pet.medications.filter((_, i) => i !== medIndex),
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#E75837]" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                <Select
                  value={formData.preferredContact}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, preferredContact: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#E75837]" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Pet Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.pets.map((pet, petIndex) => (
                <div key={petIndex} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Pet {petIndex + 1}</h4>
                    {formData.pets.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => removePet(petIndex)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Pet Name</Label>
                      <Input value={pet.name} onChange={(e) => updatePet(petIndex, "name", e.target.value)} />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={pet.type} onValueChange={(value) => updatePet(petIndex, "type", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="bird">Bird</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Breed</Label>
                      <Input value={pet.breed} onChange={(e) => updatePet(petIndex, "breed", e.target.value)} />
                    </div>
                    <div>
                      <Label>Age (years)</Label>
                      <Input
                        type="number"
                        value={pet.age}
                        onChange={(e) => updatePet(petIndex, "age", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Weight (lbs)</Label>
                      <Input
                        type="number"
                        value={pet.weight}
                        onChange={(e) => updatePet(petIndex, "weight", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Size</Label>
                    <Select value={pet.size} onValueChange={(value) => updatePet(petIndex, "size", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Temperament</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {temperamentOptions.map((temperament) => (
                        <Badge
                          key={temperament}
                          variant={pet.temperament.includes(temperament) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTemperament(petIndex, temperament)}
                        >
                          {temperament}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Special Needs</Label>
                    <div className="space-y-2">
                      {pet.specialNeeds.map((need, needIndex) => (
                        <div key={needIndex} className="flex items-center gap-2">
                          <Badge variant="secondary">{need}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => removeSpecialNeed(petIndex, needIndex)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      <Input
                        placeholder="Add special need..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addSpecialNeed(petIndex, e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Medications</Label>
                    <div className="space-y-2">
                      {pet.medications.map((med, medIndex) => (
                        <div key={medIndex} className="flex items-center gap-2">
                          <Badge variant="secondary">{med}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => removeMedication(petIndex, medIndex)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      <Input
                        placeholder="Add medication..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addMedication(petIndex, e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Special Instructions</Label>
                    <Textarea
                      value={pet.specialInstructions}
                      onChange={(e) => updatePet(petIndex, "specialInstructions", e.target.value)}
                      placeholder="Any special care instructions..."
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addPet} className="w-full bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Another Pet
              </Button>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Services & Timing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Services Needed</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {serviceOptions.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={formData.services.includes(service)}
                        onCheckedChange={() => toggleService(service)}
                      />
                      <Label htmlFor={service} className="text-sm">
                        {service.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Urgency</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, urgency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Preferred Date</Label>
                  <Input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, preferredDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Preferred Time</Label>
                  <Input
                    type="time"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, preferredTime: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#E75837]" />
                Budget & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Budget Range</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="budgetMin" className="text-sm">
                      Minimum
                    </Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      value={formData.budgetMin}
                      onChange={(e) => setFormData((prev) => ({ ...prev, budgetMin: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="budgetMax" className="text-sm">
                      Maximum
                    </Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      value={formData.budgetMax}
                      onChange={(e) => setFormData((prev) => ({ ...prev, budgetMax: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="budgetFlexible"
                    checked={formData.budgetFlexible}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, budgetFlexible: !!checked }))}
                  />
                  <Label htmlFor="budgetFlexible" className="text-sm">
                    Budget is flexible
                  </Label>
                </div>
              </div>

              <div>
                <Label>Professional Type Preference</Label>
                <Select
                  value={formData.professionalType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, professionalType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Professional</SelectItem>
                    <SelectItem value="team">Team of Professionals</SelectItem>
                    <SelectItem value="no_preference">No Preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Experience Level Required</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, experienceLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Experience Level</SelectItem>
                    <SelectItem value="experienced">Experienced</SelectItem>
                    <SelectItem value="expert">Expert/Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                  placeholder="Any additional information about your pet's needs..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i + 1 <= currentStep ? "bg-[#E75837] text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${i + 1 < currentStep ? "bg-[#E75837]" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
            className="bg-[#E75837] hover:bg-[#d04e30]"
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-[#E75837] hover:bg-[#d04e30]">
            Submit Request
          </Button>
        )}
      </div>
    </div>
  )
}
