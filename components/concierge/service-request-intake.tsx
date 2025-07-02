"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Heart, Plus, X, ArrowRight } from "lucide-react"
import type { ServiceRequest, Pet, ServiceType, UrgencyLevel, PetSize } from "../../types/concierge"

interface ServiceRequestIntakeProps {
  onComplete: (request: ServiceRequest) => void
}

type IntakeStep = "pets" | "services" | "location" | "timing" | "budget" | "preferences" | "contact"

export function ServiceRequestIntake({ onComplete }: ServiceRequestIntakeProps) {
  const [currentStep, setCurrentStep] = useState<IntakeStep>("pets")
  const [pets, setPets] = useState<Pet[]>([])
  const [services, setServices] = useState<ServiceType[]>([])
  const [location, setLocation] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })
  const [timing, setTiming] = useState({
    urgency: "flexible" as UrgencyLevel,
    preferredDate: "",
    preferredTime: "",
  })
  const [budget, setBudget] = useState({
    min: 50,
    max: 150,
    flexible: true,
  })
  const [preferences, setPreferences] = useState({
    professionalType: "no_preference" as const,
    experienceLevel: "experienced" as const,
    specialRequirements: [] as string[],
  })
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredContact: "phone" as const,
  })
  const [additionalNotes, setAdditionalNotes] = useState("")

  const serviceOptions: { value: ServiceType; label: string; description: string }[] = [
    { value: "grooming", label: "Grooming", description: "Full grooming services including bath, cut, nails" },
    { value: "pet_sitting", label: "Pet Sitting", description: "In-home pet care while you're away" },
    { value: "dog_walking", label: "Dog Walking", description: "Regular walks and exercise" },
    { value: "overnight_care", label: "Overnight Care", description: "24-hour pet supervision" },
    { value: "pet_transport", label: "Pet Transport", description: "Safe transportation for your pet" },
    { value: "vet_visits", label: "Vet Visits", description: "Accompaniment to veterinary appointments" },
    { value: "training", label: "Training", description: "Behavioral training and obedience" },
    { value: "emergency_care", label: "Emergency Care", description: "Urgent pet care needs" },
    { value: "medication_admin", label: "Medication Administration", description: "Giving medications and treatments" },
    { value: "exercise_programs", label: "Exercise Programs", description: "Specialized fitness routines" },
  ]

  const addPet = () => {
    const newPet: Pet = {
      id: `pet_${Date.now()}`,
      name: "",
      type: "dog",
      breed: "",
      age: 1,
      size: "medium",
      weight: 25,
      temperament: [],
      specialNeeds: [],
      medications: [],
      vetInfo: {
        clinicName: "",
        phone: "",
        address: "",
      },
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "Owner",
      },
      preferences: {
        favoriteActivities: [],
        dislikes: [],
        specialInstructions: "",
      },
    }
    setPets([...pets, newPet])
  }

  const updatePet = (index: number, updates: Partial<Pet>) => {
    const updatedPets = pets.map((pet, i) => (i === index ? { ...pet, ...updates } : pet))
    setPets(updatedPets)
  }

  const removePet = (index: number) => {
    setPets(pets.filter((_, i) => i !== index))
  }

  const toggleService = (service: ServiceType) => {
    setServices((prev) => (prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]))
  }

  const canProceedFromStep = (step: IntakeStep): boolean => {
    switch (step) {
      case "pets":
        return pets.length > 0 && pets.every((pet) => pet.name && pet.breed)
      case "services":
        return services.length > 0
      case "location":
        return location.city && location.state && location.zipCode
      case "timing":
        return timing.urgency !== undefined
      case "budget":
        return budget.min > 0 && budget.max > budget.min
      case "preferences":
        return true // All optional
      case "contact":
        return contactInfo.firstName && contactInfo.lastName && contactInfo.email && contactInfo.phone
      default:
        return false
    }
  }

  const handleSubmit = () => {
    const serviceRequest: ServiceRequest = {
      id: `req_${Date.now()}`,
      customerId: `cust_${Date.now()}`,
      pets,
      services,
      location,
      timing,
      budget,
      preferences,
      additionalNotes,
      contactInfo,
      createdAt: new Date().toISOString(),
      status: "pending",
    }

    onComplete(serviceRequest)
  }

  const stepTitles = {
    pets: "Tell Us About Your Pet(s)",
    services: "What Services Do You Need?",
    location: "Where Are You Located?",
    timing: "When Do You Need Service?",
    budget: "What's Your Budget?",
    preferences: "Any Preferences?",
    contact: "Contact Information",
  }

  const stepOrder: IntakeStep[] = ["pets", "services", "location", "timing", "budget", "preferences", "contact"]
  const currentStepIndex = stepOrder.indexOf(currentStep)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500 body-font">
            Step {currentStepIndex + 1} of {stepOrder.length}
          </span>
          <span className="text-sm font-medium text-gray-500 body-font">
            {Math.round(((currentStepIndex + 1) / stepOrder.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#E75837] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / stepOrder.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 header-font">
            <Heart className="w-5 h-5 text-[#E75837]" />
            {stepTitles[currentStep]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pet Information Step */}
          {currentStep === "pets" && (
            <div className="space-y-6">
              {pets.map((pet, index) => (
                <Card key={pet.id} className="border-2 border-gray-100">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <h3 className="text-lg font-semibold header-font">
                      Pet {index + 1} {pet.name && `- ${pet.name}`}
                    </h3>
                    {pets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePet(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`pet-name-${index}`} className="header-font">
                          Pet Name *
                        </Label>
                        <Input
                          id={`pet-name-${index}`}
                          value={pet.name}
                          onChange={(e) => updatePet(index, { name: e.target.value })}
                          placeholder="Enter pet's name"
                          className="body-font"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`pet-type-${index}`} className="header-font">
                          Pet Type *
                        </Label>
                        <Select value={pet.type} onValueChange={(value) => updatePet(index, { type: value as any })}>
                          <SelectTrigger className="body-font">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dog">Dog</SelectItem>
                            <SelectItem value="cat">Cat</SelectItem>
                            <SelectItem value="bird">Bird</SelectItem>
                            <SelectItem value="rabbit">Rabbit</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`pet-breed-${index}`} className="header-font">
                          Breed *
                        </Label>
                        <Input
                          id={`pet-breed-${index}`}
                          value={pet.breed}
                          onChange={(e) => updatePet(index, { breed: e.target.value })}
                          placeholder="Enter breed"
                          className="body-font"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`pet-age-${index}`} className="header-font">
                          Age (years)
                        </Label>
                        <Input
                          id={`pet-age-${index}`}
                          type="number"
                          value={pet.age}
                          onChange={(e) => updatePet(index, { age: Number.parseInt(e.target.value) || 0 })}
                          min="0"
                          max="30"
                          className="body-font"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`pet-size-${index}`} className="header-font">
                          Size
                        </Label>
                        <Select
                          value={pet.size}
                          onValueChange={(value) => updatePet(index, { size: value as PetSize })}
                        >
                          <SelectTrigger className="body-font">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (under 25 lbs)</SelectItem>
                            <SelectItem value="medium">Medium (25-60 lbs)</SelectItem>
                            <SelectItem value="large">Large (60-100 lbs)</SelectItem>
                            <SelectItem value="extra_large">Extra Large (over 100 lbs)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`pet-weight-${index}`} className="header-font">
                          Weight (lbs)
                        </Label>
                        <Input
                          id={`pet-weight-${index}`}
                          type="number"
                          value={pet.weight}
                          onChange={(e) => updatePet(index, { weight: Number.parseInt(e.target.value) || 0 })}
                          min="1"
                          max="300"
                          className="body-font"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="header-font">Special Needs or Medical Conditions</Label>
                      <Textarea
                        value={pet.specialNeeds.join(", ")}
                        onChange={(e) =>
                          updatePet(index, {
                            specialNeeds: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="List any special needs, medical conditions, or medications (comma separated)"
                        className="body-font"
                      />
                    </div>

                    <div>
                      <Label className="header-font">Special Instructions</Label>
                      <Textarea
                        value={pet.preferences.specialInstructions}
                        onChange={(e) =>
                          updatePet(index, {
                            preferences: { ...pet.preferences, specialInstructions: e.target.value },
                          })
                        }
                        placeholder="Any special care instructions, favorite activities, or things to avoid"
                        className="body-font"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={addPet}
                className="w-full border-dashed border-2 body-font bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Pet
              </Button>
            </div>
          )}

          {/* Services Step */}
          {currentStep === "services" && (
            <div className="space-y-4">
              <p className="text-gray-600 body-font">Select all services you need for your pet(s):</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceOptions.map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all ${
                      services.includes(option.value)
                        ? "border-[#E75837] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleService(option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={services.includes(option.value)}
                          onChange={() => toggleService(option.value)}
                        />
                        <div>
                          <h3 className="font-medium header-font">{option.label}</h3>
                          <p className="text-sm text-gray-600 body-font">{option.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {services.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2 body-font">Selected services:</p>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => (
                      <Badge key={service} variant="secondary" className="body-font">
                        {serviceOptions.find((opt) => opt.value === service)?.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location Step */}
          {currentStep === "location" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="header-font">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    value={location.address}
                    onChange={(e) => setLocation({ ...location, address: e.target.value })}
                    placeholder="123 Main Street"
                    className="body-font"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="header-font">
                    City *
                  </Label>
                  <Input
                    id="city"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    placeholder="Chicago"
                    className="body-font"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="header-font">
                    State *
                  </Label>
                  <Input
                    id="state"
                    value={location.state}
                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                    placeholder="IL"
                    className="body-font"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode" className="header-font">
                    ZIP Code *
                  </Label>
                  <Input
                    id="zipCode"
                    value={location.zipCode}
                    onChange={(e) => setLocation({ ...location, zipCode: e.target.value })}
                    placeholder="60611"
                    className="body-font"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Timing Step */}
          {currentStep === "timing" && (
            <div className="space-y-6">
              <div>
                <Label className="header-font">How urgent is your need? *</Label>
                <RadioGroup
                  value={timing.urgency}
                  onValueChange={(value) => setTiming({ ...timing, urgency: value as UrgencyLevel })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="asap" id="asap" />
                    <Label htmlFor="asap" className="body-font">
                      ASAP - I need help right now
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="today" id="today" />
                    <Label htmlFor="today" className="body-font">
                      Today - Within the next few hours
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="this_week" id="this_week" />
                    <Label htmlFor="this_week" className="body-font">
                      This week - Within the next 7 days
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flexible" id="flexible" />
                    <Label htmlFor="flexible" className="body-font">
                      Flexible - I can wait for the right professional
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {timing.urgency !== "asap" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredDate" className="header-font">
                      Preferred Date
                    </Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={timing.preferredDate}
                      onChange={(e) => setTiming({ ...timing, preferredDate: e.target.value })}
                      className="body-font"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredTime" className="header-font">
                      Preferred Time
                    </Label>
                    <Input
                      id="preferredTime"
                      type="time"
                      value={timing.preferredTime}
                      onChange={(e) => setTiming({ ...timing, preferredTime: e.target.value })}
                      className="body-font"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Budget Step */}
          {currentStep === "budget" && (
            <div className="space-y-6">
              <div>
                <Label className="header-font">Budget Range *</Label>
                <p className="text-sm text-gray-600 mb-4 body-font">
                  What's your budget for the services you've selected?
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minBudget" className="header-font">
                      Minimum ($)
                    </Label>
                    <Input
                      id="minBudget"
                      type="number"
                      value={budget.min}
                      onChange={(e) => setBudget({ ...budget, min: Number.parseInt(e.target.value) || 0 })}
                      min="0"
                      className="body-font"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxBudget" className="header-font">
                      Maximum ($)
                    </Label>
                    <Input
                      id="maxBudget"
                      type="number"
                      value={budget.max}
                      onChange={(e) => setBudget({ ...budget, max: Number.parseInt(e.target.value) || 0 })}
                      min={budget.min}
                      className="body-font"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flexible"
                  checked={budget.flexible}
                  onCheckedChange={(checked) => setBudget({ ...budget, flexible: !!checked })}
                />
                <Label htmlFor="flexible" className="body-font">
                  I'm flexible with my budget for the right professional
                </Label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 body-font">
                  <strong>
                    Budget Range: ${budget.min} - ${budget.max}
                  </strong>
                  {budget.flexible && " (Flexible)"}
                </p>
                <p className="text-xs text-blue-600 mt-1 body-font">
                  Our concierge team will find professionals within your budget range and may suggest premium options if
                  you're flexible.
                </p>
              </div>
            </div>
          )}

          {/* Preferences Step */}
          {currentStep === "preferences" && (
            <div className="space-y-6">
              <div>
                <Label className="header-font">Professional Type Preference</Label>
                <RadioGroup
                  value={preferences.professionalType}
                  onValueChange={(value) => setPreferences({ ...preferences, professionalType: value as any })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="body-font">
                      Individual specialist
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="team" id="team" />
                    <Label htmlFor="team" className="body-font">
                      Team of professionals
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no_preference" id="no_preference" />
                    <Label htmlFor="no_preference" className="body-font">
                      No preference
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="header-font">Experience Level</Label>
                <RadioGroup
                  value={preferences.experienceLevel}
                  onValueChange={(value) => setPreferences({ ...preferences, experienceLevel: value as any })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="any" id="any" />
                    <Label htmlFor="any" className="body-font">
                      Any experience level
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="experienced" id="experienced" />
                    <Label htmlFor="experienced" className="body-font">
                      Experienced professionals only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expert" id="expert" />
                    <Label htmlFor="expert" className="body-font">
                      Expert/specialist level only
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="specialRequirements" className="header-font">
                  Special Requirements
                </Label>
                <Textarea
                  id="specialRequirements"
                  value={preferences.specialRequirements.join(", ")}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      specialRequirements: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Any specific requirements or certifications needed (comma separated)"
                  className="body-font"
                />
              </div>
            </div>
          )}

          {/* Contact Step */}
          {currentStep === "contact" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="header-font">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={contactInfo.firstName}
                    onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })}
                    placeholder="John"
                    className="body-font"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="header-font">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={contactInfo.lastName}
                    onChange={(e) => setContactInfo({ ...contactInfo, lastName: e.target.value })}
                    placeholder="Smith"
                    className="body-font"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="header-font">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    placeholder="john@example.com"
                    className="body-font"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="header-font">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="body-font"
                  />
                </div>
              </div>

              <div>
                <Label className="header-font">Preferred Contact Method</Label>
                <RadioGroup
                  value={contactInfo.preferredContact}
                  onValueChange={(value) => setContactInfo({ ...contactInfo, preferredContact: value as any })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="body-font">
                      Phone call
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="text" />
                    <Label htmlFor="text" className="body-font">
                      Text message
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="body-font">
                      Email
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="additionalNotes" className="header-font">
                  Additional Notes
                </Label>
                <Textarea
                  id="additionalNotes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional information that would help us find the perfect professional for your pet"
                  className="body-font"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                const currentIndex = stepOrder.indexOf(currentStep)
                if (currentIndex > 0) {
                  setCurrentStep(stepOrder[currentIndex - 1])
                }
              }}
              disabled={currentStepIndex === 0}
              className="body-font"
            >
              Previous
            </Button>

            {currentStepIndex === stepOrder.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceedFromStep(currentStep)}
                className="bg-[#E75837] hover:bg-[#d04e30] body-font"
              >
                Submit Request
              </Button>
            ) : (
              <Button
                onClick={() => {
                  const currentIndex = stepOrder.indexOf(currentStep)
                  if (currentIndex < stepOrder.length - 1) {
                    setCurrentStep(stepOrder[currentIndex + 1])
                  }
                }}
                disabled={!canProceedFromStep(currentStep)}
                className="bg-[#E75837] hover:bg-[#d04e30] body-font"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
