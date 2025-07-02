"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Heart,
  MapPin,
  Clock,
  DollarSign,
  User,
  Phone,
  Mail,
  Plus,
  X,
  Scissors,
  Home,
  Car,
  Stethoscope,
  GraduationCap,
  AlertTriangle,
} from "lucide-react"
import type { ServiceRequest, Pet, ServiceType } from "../../types/concierge"

interface ServiceRequestIntakeProps {
  onComplete: (request: ServiceRequest) => void
}

export function ServiceRequestIntake({ onComplete }: ServiceRequestIntakeProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([])
  const [formData, setFormData] = useState({
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    timing: {
      urgency: "flexible" as const,
      preferredDate: "",
      preferredTime: "",
      duration: 60,
    },
    budget: {
      min: 50,
      max: 200,
      flexible: true,
    },
    preferences: {
      professionalType: "no_preference" as const,
      experienceLevel: "experienced" as const,
      specialRequirements: [] as string[],
    },
    additionalNotes: "",
    contactInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      preferredContact: "email" as const,
    },
  })

  const sections = [
    "Pet Information",
    "Services Needed",
    "Location & Timing",
    "Budget & Preferences",
    "Contact Information",
  ]

  const serviceOptions = [
    { id: "grooming" as ServiceType, label: "Grooming", icon: Scissors, description: "Baths, haircuts, nail trims" },
    { id: "pet_sitting" as ServiceType, label: "Pet Sitting", icon: Home, description: "In-home pet care" },
    { id: "dog_walking" as ServiceType, label: "Dog Walking", icon: User, description: "Daily walks and exercise" },
    { id: "overnight_care" as ServiceType, label: "Overnight Care", icon: Home, description: "Overnight pet sitting" },
    { id: "pet_transport" as ServiceType, label: "Pet Transport", icon: Car, description: "Safe transportation" },
    { id: "vet_visits" as ServiceType, label: "Vet Visits", icon: Stethoscope, description: "Veterinary appointments" },
    { id: "training" as ServiceType, label: "Training", icon: GraduationCap, description: "Behavioral training" },
    {
      id: "emergency_care" as ServiceType,
      label: "Emergency Care",
      icon: AlertTriangle,
      description: "Urgent pet care",
    },
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
        relationship: "",
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

  const handleServiceToggle = (service: ServiceType) => {
    setSelectedServices((prev) => (prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]))
  }

  const handleSubmit = () => {
    const request: ServiceRequest = {
      id: `req_${Date.now()}`,
      customerId: `customer_${Date.now()}`,
      pets,
      services: selectedServices,
      location: formData.location,
      timing: formData.timing,
      budget: formData.budget,
      preferences: formData.preferences,
      additionalNotes: formData.additionalNotes,
      contactInfo: formData.contactInfo,
      createdAt: new Date().toISOString(),
      status: "pending",
    }

    onComplete(request)
  }

  const canProceed = () => {
    switch (currentSection) {
      case 0:
        return pets.length > 0 && pets.every((pet) => pet.name && pet.breed)
      case 1:
        return selectedServices.length > 0
      case 2:
        return formData.location.zipCode && formData.timing.urgency
      case 3:
        return formData.budget.min > 0 && formData.budget.max > 0
      case 4:
        return formData.contactInfo.firstName && formData.contactInfo.email
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 header-font">
            <Heart className="w-5 h-5 text-[#E75837]" />
            {sections[currentSection]}
          </CardTitle>
          <div className="flex space-x-2 mt-4">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded ${
                  index < currentSection ? "bg-green-500" : index === currentSection ? "bg-[#E75837]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Pet Information Section */}
          {currentSection === 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold header-font">Tell us about your pet(s)</h3>
                <Button onClick={addPet} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pet
                </Button>
              </div>

              {pets.map((pet, index) => (
                <Card key={pet.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium header-font">Pet #{index + 1}</h4>
                    {pets.length > 1 && (
                      <Button
                        onClick={() => removePet(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 body-font">Pet Name *</label>
                      <Input
                        value={pet.name}
                        onChange={(e) => updatePet(index, { name: e.target.value })}
                        placeholder="Enter pet's name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 body-font">Type</label>
                      <select
                        value={pet.type}
                        onChange={(e) => updatePet(index, { type: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-md body-font"
                      >
                        <option value="dog">Dog</option>
                        <option value="cat">Cat</option>
                        <option value="bird">Bird</option>
                        <option value="rabbit">Rabbit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 body-font">Breed *</label>
                      <Input
                        value={pet.breed}
                        onChange={(e) => updatePet(index, { breed: e.target.value })}
                        placeholder="Enter breed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 body-font">Age (years)</label>
                      <Input
                        type="number"
                        value={pet.age}
                        onChange={(e) => updatePet(index, { age: Number.parseInt(e.target.value) || 1 })}
                        min="0"
                        max="30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 body-font">Size</label>
                      <select
                        value={pet.size}
                        onChange={(e) => updatePet(index, { size: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-md body-font"
                      >
                        <option value="small">Small (under 25 lbs)</option>
                        <option value="medium">Medium (25-60 lbs)</option>
                        <option value="large">Large (60-100 lbs)</option>
                        <option value="extra_large">Extra Large (over 100 lbs)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 body-font">Weight (lbs)</label>
                      <Input
                        type="number"
                        value={pet.weight}
                        onChange={(e) => updatePet(index, { weight: Number.parseInt(e.target.value) || 25 })}
                        min="1"
                        max="200"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2 body-font">Special Instructions</label>
                    <Textarea
                      value={pet.preferences.specialInstructions}
                      onChange={(e) =>
                        updatePet(index, {
                          preferences: { ...pet.preferences, specialInstructions: e.target.value },
                        })
                      }
                      placeholder="Any special needs, medications, behavioral notes, or care instructions..."
                      rows={3}
                    />
                  </div>
                </Card>
              ))}

              {pets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="body-font">Add your first pet to get started</p>
                </div>
              )}
            </div>
          )}

          {/* Services Section */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold header-font">What services do you need?</h3>
              <p className="text-gray-600 body-font">
                Select all services you're interested in. We'll match you with professionals who can handle multiple
                services.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceOptions.map((service) => {
                  const IconComponent = service.icon
                  const isSelected = selectedServices.includes(service.id)

                  return (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? "ring-2 ring-[#E75837] bg-orange-50" : "hover:shadow-md"
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected ? "bg-[#E75837] text-white" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium header-font">{service.label}</h4>
                            <p className="text-sm text-gray-600 body-font">{service.description}</p>
                          </div>
                          <Checkbox checked={isSelected} />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Location & Timing Section */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 header-font flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#E75837]" />
                  Location & Timing
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 body-font">Address</label>
                    <Input
                      value={formData.location.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, address: e.target.value },
                        })
                      }
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 body-font">City</label>
                    <Input
                      value={formData.location.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, city: e.target.value },
                        })
                      }
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 body-font">State</label>
                    <Input
                      value={formData.location.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, state: e.target.value },
                        })
                      }
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 body-font">ZIP Code *</label>
                    <Input
                      value={formData.location.zipCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, zipCode: e.target.value },
                        })
                      }
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 header-font flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#E75837]" />
                  When do you need service?
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { value: "asap", label: "ASAP" },
                    { value: "today", label: "Today" },
                    { value: "this_week", label: "This Week" },
                    { value: "flexible", label: "I'm Flexible" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={formData.timing.urgency === option.value ? "default" : "outline"}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          timing: { ...formData.timing, urgency: option.value as any },
                        })
                      }
                      className="body-font"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                {formData.timing.urgency !== "flexible" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 body-font">Preferred Date</label>
                      <Input
                        type="date"
                        value={formData.timing.preferredDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            timing: { ...formData.timing, preferredDate: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 body-font">Preferred Time</label>
                      <Input
                        type="time"
                        value={formData.timing.preferredTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            timing: { ...formData.timing, preferredTime: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Budget & Preferences Section */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 header-font flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#E75837]" />
                  Budget & Preferences
                </h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 body-font">Budget Range</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 body-font">Minimum ($)</label>
                      <Input
                        type="number"
                        value={formData.budget.min}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            budget: { ...formData.budget, min: Number.parseInt(e.target.value) || 0 },
                          })
                        }
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 body-font">Maximum ($)</label>
                      <Input
                        type="number"
                        value={formData.budget.max}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            budget: { ...formData.budget, max: Number.parseInt(e.target.value) || 0 },
                          })
                        }
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-3">
                    <Checkbox
                      checked={formData.budget.flexible}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          budget: { ...formData.budget, flexible: !!checked },
                        })
                      }
                    />
                    <label className="text-sm body-font">I'm flexible with pricing for the right professional</label>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 body-font">Professional Preference</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: "individual", label: "Individual Professional" },
                      { value: "team", label: "Team of Professionals" },
                      { value: "no_preference", label: "No Preference" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={formData.preferences.professionalType === option.value ? "default" : "outline"}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, professionalType: option.value as any },
                          })
                        }
                        className="body-font text-sm"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3 body-font">Experience Level</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: "any", label: "Any Experience" },
                      { value: "experienced", label: "Experienced" },
                      { value: "expert", label: "Expert Level" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={formData.preferences.experienceLevel === option.value ? "default" : "outline"}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, experienceLevel: option.value as any },
                          })
                        }
                        className="body-font text-sm"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 body-font">Additional Notes</label>
                <Textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Any additional requirements, preferences, or special instructions..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Contact Information Section */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold header-font flex items-center gap-2">
                <User className="w-5 h-5 text-[#E75837]" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 body-font">First Name *</label>
                  <Input
                    value={formData.contactInfo.firstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInfo: { ...formData.contactInfo, firstName: e.target.value },
                      })
                    }
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 body-font">Last Name</label>
                  <Input
                    value={formData.contactInfo.lastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInfo: { ...formData.contactInfo, lastName: e.target.value },
                      })
                    }
                    placeholder="Last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 body-font">Email *</label>
                  <Input
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInfo: { ...formData.contactInfo, email: e.target.value },
                      })
                    }
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 body-font">Phone</label>
                  <Input
                    type="tel"
                    value={formData.contactInfo.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInfo: { ...formData.contactInfo, phone: e.target.value },
                      })
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 body-font">Preferred Contact Method</label>
                <div className="flex space-x-4">
                  {[
                    { value: "email", label: "Email", icon: Mail },
                    { value: "phone", label: "Phone", icon: Phone },
                    { value: "text", label: "Text", icon: Phone },
                  ].map((option) => {
                    const IconComponent = option.icon
                    return (
                      <Button
                        key={option.value}
                        variant={formData.contactInfo.preferredContact === option.value ? "default" : "outline"}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            contactInfo: { ...formData.contactInfo, preferredContact: option.value as any },
                          })
                        }
                        className="body-font"
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        {option.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="body-font"
            >
              Previous
            </Button>

            {currentSection < sections.length - 1 ? (
              <Button
                onClick={() => setCurrentSection(currentSection + 1)}
                disabled={!canProceed()}
                className="body-font"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="bg-[#E75837] hover:bg-[#d04e30] body-font"
              >
                Find My Perfect Match
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
