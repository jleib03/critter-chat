"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Stethoscope } from "lucide-react"
import type { ServiceRequest } from "@/types/concierge"
import { DEMO_SERVICE_REQUEST } from "@/utils/demo-data"

interface ServiceRequestIntakeProps {
  onSubmit: (request: ServiceRequest) => void
  onBack: () => void
}

export function ServiceRequestIntake({ onSubmit, onBack }: ServiceRequestIntakeProps) {
  // Prepopulate with demo data
  const [formData, setFormData] = useState({
    // Contact Information - prepopulated
    firstName: DEMO_SERVICE_REQUEST.contactInfo.firstName,
    lastName: DEMO_SERVICE_REQUEST.contactInfo.lastName,
    email: DEMO_SERVICE_REQUEST.contactInfo.email,
    phone: DEMO_SERVICE_REQUEST.contactInfo.phone,
    preferredContact: DEMO_SERVICE_REQUEST.contactInfo.preferredContact,

    // Pet Information - prepopulated
    petName: DEMO_SERVICE_REQUEST.pets[0].name,
    petType: DEMO_SERVICE_REQUEST.pets[0].type,
    petBreed: DEMO_SERVICE_REQUEST.pets[0].breed,
    petAge: DEMO_SERVICE_REQUEST.pets[0].age.toString(),
    petWeight: DEMO_SERVICE_REQUEST.pets[0].weight.toString(),
    petTemperament: DEMO_SERVICE_REQUEST.pets[0].temperament,
    specialNeeds: DEMO_SERVICE_REQUEST.pets[0].specialNeeds,
    medications: DEMO_SERVICE_REQUEST.pets[0].medications,
    vetClinic: DEMO_SERVICE_REQUEST.pets[0].vetInfo.clinicName,
    vetPhone: DEMO_SERVICE_REQUEST.pets[0].vetInfo.phone,
    vetAddress: DEMO_SERVICE_REQUEST.pets[0].vetInfo.address,
    emergencyContactName: DEMO_SERVICE_REQUEST.pets[0].emergencyContact.name,
    emergencyContactPhone: DEMO_SERVICE_REQUEST.pets[0].emergencyContact.phone,
    favoriteActivities: DEMO_SERVICE_REQUEST.pets[0].preferences.favoriteActivities,
    dislikes: DEMO_SERVICE_REQUEST.pets[0].preferences.dislikes,
    specialInstructions: DEMO_SERVICE_REQUEST.pets[0].preferences.specialInstructions,

    // Service Requirements - prepopulated
    services: DEMO_SERVICE_REQUEST.services,
    urgency: DEMO_SERVICE_REQUEST.timing.urgency,
    preferredDate: DEMO_SERVICE_REQUEST.timing.preferredDate,
    preferredTime: DEMO_SERVICE_REQUEST.timing.preferredTime,

    // Location - prepopulated
    address: DEMO_SERVICE_REQUEST.location.address,
    city: DEMO_SERVICE_REQUEST.location.city,
    state: DEMO_SERVICE_REQUEST.location.state,
    zipCode: DEMO_SERVICE_REQUEST.location.zipCode,

    // Budget - prepopulated
    budgetMin: DEMO_SERVICE_REQUEST.budget.min.toString(),
    budgetMax: DEMO_SERVICE_REQUEST.budget.max.toString(),
    budgetFlexible: DEMO_SERVICE_REQUEST.budget.flexible,

    // Preferences - prepopulated
    professionalType: DEMO_SERVICE_REQUEST.preferences.professionalType,
    experienceLevel: DEMO_SERVICE_REQUEST.preferences.experienceLevel,
    specialRequirements: DEMO_SERVICE_REQUEST.preferences.specialRequirements,

    // Additional Notes - prepopulated
    additionalNotes: DEMO_SERVICE_REQUEST.additionalNotes,
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }))
  }

  const handleTemperamentToggle = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      petTemperament: prev.petTemperament.includes(trait)
        ? prev.petTemperament.filter((t) => t !== trait)
        : [...prev.petTemperament, trait],
    }))
  }

  const handleSpecialNeedToggle = (need: string) => {
    setFormData((prev) => ({
      ...prev,
      specialNeeds: prev.specialNeeds.includes(need)
        ? prev.specialNeeds.filter((n) => n !== need)
        : [...prev.specialNeeds, need],
    }))
  }

  const handleSpecialRequirementToggle = (requirement: string) => {
    setFormData((prev) => ({
      ...prev,
      specialRequirements: prev.specialRequirements.includes(requirement)
        ? prev.specialRequirements.filter((r) => r !== requirement)
        : [...prev.specialRequirements, requirement],
    }))
  }

  const handleArrayInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const serviceRequest: ServiceRequest = {
      id: `req_${Date.now()}`,
      customerId: `cust_${Date.now()}`,
      pets: [
        {
          id: `pet_${Date.now()}`,
          name: formData.petName,
          type: formData.petType as "dog" | "cat" | "bird" | "other",
          breed: formData.petBreed,
          age: Number.parseInt(formData.petAge),
          size: formData.petWeight
            ? Number.parseInt(formData.petWeight) > 50
              ? "large"
              : Number.parseInt(formData.petWeight) > 25
                ? "medium"
                : "small"
            : "medium",
          weight: Number.parseInt(formData.petWeight),
          temperament: formData.petTemperament,
          specialNeeds: formData.specialNeeds,
          medications: formData.medications,
          vetInfo: {
            clinicName: formData.vetClinic,
            phone: formData.vetPhone,
            address: formData.vetAddress,
          },
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relationship: "Owner",
          },
          preferences: {
            favoriteActivities: formData.favoriteActivities,
            dislikes: formData.dislikes,
            specialInstructions: formData.specialInstructions,
          },
        },
      ],
      services: formData.services,
      location: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        coordinates: {
          lat: 41.8947, // Chicago coordinates for demo
          lng: -87.6197,
        },
      },
      timing: {
        urgency: formData.urgency as "asap" | "today" | "this_week" | "flexible",
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
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

    onSubmit(serviceRequest)
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-gray-600">Let's start with your basic information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Preferred Contact Method</Label>
              <RadioGroup
                value={formData.preferredContact}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, preferredContact: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone-contact" />
                  <Label htmlFor="phone-contact">Phone Call</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text-contact" />
                  <Label htmlFor="text-contact">Text Message</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email-contact" />
                  <Label htmlFor="email-contact">Email</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet Information</h2>
              <p className="text-gray-600">Tell us about your furry friend</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petName">Pet Name</Label>
                <Input
                  id="petName"
                  value={formData.petName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, petName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petType">Pet Type</Label>
                <Select
                  value={formData.petType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, petType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pet type" />
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
              <div className="space-y-2">
                <Label htmlFor="petBreed">Breed</Label>
                <Input
                  id="petBreed"
                  value={formData.petBreed}
                  onChange={(e) => setFormData((prev) => ({ ...prev, petBreed: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petAge">Age (years)</Label>
                <Input
                  id="petAge"
                  type="number"
                  value={formData.petAge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, petAge: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petWeight">Weight (lbs)</Label>
                <Input
                  id="petWeight"
                  type="number"
                  value={formData.petWeight}
                  onChange={(e) => setFormData((prev) => ({ ...prev, petWeight: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Temperament (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["friendly", "energetic", "calm", "social", "shy", "protective", "playful", "anxious"].map((trait) => (
                  <div key={trait} className="flex items-center space-x-2">
                    <Checkbox
                      id={trait}
                      checked={formData.petTemperament.includes(trait)}
                      onCheckedChange={() => handleTemperamentToggle(trait)}
                    />
                    <Label htmlFor={trait} className="capitalize">
                      {trait}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Special Needs or Medical Conditions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Hip dysplasia monitoring",
                  "Post-surgical recovery",
                  "Diabetes management",
                  "Arthritis care",
                  "Anxiety support",
                  "Senior care",
                  "Medication administration",
                  "Special diet",
                ].map((need) => (
                  <div key={need} className="flex items-center space-x-2">
                    <Checkbox
                      id={need}
                      checked={formData.specialNeeds.includes(need)}
                      onCheckedChange={() => handleSpecialNeedToggle(need)}
                    />
                    <Label htmlFor={need}>{need}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Current Medications (comma-separated)</Label>
              <Textarea
                id="medications"
                value={formData.medications.join(", ")}
                onChange={(e) => handleArrayInputChange("medications", e.target.value)}
                placeholder="e.g., Carprofen 75mg twice daily, Joint supplement"
                rows={2}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Veterinary & Emergency Information</h2>
              <p className="text-gray-600">Important contacts for your pet's care</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Veterinary Information</h3>
                  <p className="text-blue-700 text-sm">This helps our professionals coordinate care if needed</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vetClinic">Veterinary Clinic Name</Label>
                <Input
                  id="vetClinic"
                  value={formData.vetClinic}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vetClinic: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vetPhone">Vet Phone Number</Label>
                  <Input
                    id="vetPhone"
                    type="tel"
                    value={formData.vetPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, vetPhone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vetAddress">Veterinary Clinic Address</Label>
                <Input
                  id="vetAddress"
                  value={formData.vetAddress}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vetAddress: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Pet Preferences & Behavior</h3>

              <div className="space-y-2">
                <Label htmlFor="favoriteActivities">Favorite Activities (comma-separated)</Label>
                <Textarea
                  id="favoriteActivities"
                  value={formData.favoriteActivities.join(", ")}
                  onChange={(e) => handleArrayInputChange("favoriteActivities", e.target.value)}
                  placeholder="e.g., Gentle walks, Swimming therapy, Mental stimulation games"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dislikes">Dislikes or Triggers (comma-separated)</Label>
                <Textarea
                  id="dislikes"
                  value={formData.dislikes.join(", ")}
                  onChange={(e) => handleArrayInputChange("dislikes", e.target.value)}
                  placeholder="e.g., Loud noises, Rough play, Stairs"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Care Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Any specific instructions for caring for your pet..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Requirements</h2>
              <p className="text-gray-600">What services do you need?</p>
            </div>

            <div className="space-y-4">
              <Label>Services Needed (select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: "dog_walking", label: "Dog Walking", icon: "🚶" },
                  { id: "pet_sitting", label: "Pet Sitting", icon: "🏠" },
                  { id: "medication_admin", label: "Medication Administration", icon: "💊" },
                  { id: "vet_visits", label: "Vet Visit Assistance", icon: "🏥" },
                  { id: "grooming", label: "Grooming", icon: "✂️" },
                  { id: "overnight_care", label: "Overnight Care", icon: "🌙" },
                  { id: "exercise_programs", label: "Exercise Programs", icon: "🏃" },
                  { id: "behavioral_support", label: "Behavioral Support", icon: "🧠" },
                ].map((service) => (
                  <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={service.id}
                      checked={formData.services.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <Label htmlFor={service.id} className="flex items-center gap-2 cursor-pointer">
                      <span>{service.icon}</span>
                      {service.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="urgency">How soon do you need service?</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, urgency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP (within hours)</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This week</SelectItem>
                    <SelectItem value="flexible">I'm flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Input
                  id="preferredTime"
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, preferredTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, preferredDate: e.target.value }))}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget & Preferences</h2>
              <p className="text-gray-600">Help us find the right professional for you</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Budget Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">Minimum Budget ($)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budgetMin: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">Maximum Budget ($)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budgetMax: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="budgetFlexible"
                  checked={formData.budgetFlexible}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, budgetFlexible: !!checked }))}
                />
                <Label htmlFor="budgetFlexible">I'm flexible with budget for the right professional</Label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Professional Preferences</h3>

              <div className="space-y-2">
                <Label>Professional Type</Label>
                <RadioGroup
                  value={formData.professionalType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, professionalType: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual">Individual professional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="team" id="team" />
                    <Label htmlFor="team">Team/Company</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no_preference" id="no_preference" />
                    <Label htmlFor="no_preference">No preference</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Experience Level Required</Label>
                <RadioGroup
                  value={formData.experienceLevel}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, experienceLevel: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="any" id="any" />
                    <Label htmlFor="any">Any experience level</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="experienced" id="experienced" />
                    <Label htmlFor="experienced">Experienced (2+ years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expert" id="expert" />
                    <Label htmlFor="expert">Expert/Specialist</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Special Requirements (select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Post-surgical experience",
                    "Large dog handling",
                    "German Shepherd familiarity",
                    "Medical administration",
                    "Senior pet care",
                    "Behavioral training",
                    "Emergency response",
                    "Flexible scheduling",
                  ].map((requirement) => (
                    <div key={requirement} className="flex items-center space-x-2">
                      <Checkbox
                        id={requirement}
                        checked={formData.specialRequirements.includes(requirement)}
                        onCheckedChange={() => handleSpecialRequirementToggle(requirement)}
                      />
                      <Label htmlFor={requirement}>{requirement}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Any additional information that would help us find the perfect professional for your pet..."
                rows={4}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl">Service Request</CardTitle>
              <p className="text-gray-600 mt-1">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i + 1 <= currentStep ? "bg-blue-600" : "bg-gray-200"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            <div className="flex justify-between pt-8">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={onBack}>
                  Cancel
                </Button>
              </div>

              <div className="flex gap-2">
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep}>
                    Next Step
                  </Button>
                ) : (
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Submit Request
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
