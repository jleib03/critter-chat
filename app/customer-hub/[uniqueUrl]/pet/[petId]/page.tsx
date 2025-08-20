"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MoreHorizontal, Plus, ChevronRight } from "lucide-react"
import { Dog, Cat, Fish, Bird, Heart } from "lucide-react"

interface Pet {
  pet_name: string
  pet_id: string
  pet_type: string
  breed?: string
  sex?: string
  chip_id?: string
  spayed_neutered?: string
  birthdate?: string
  gotcha_date?: string
  feeding_instructions?: string
  medication_schedule?: string
  behavioral_notes?: string
  medical_conditions?: string
  allergies?: string
  emergency_contact?: string
  veterinarian_info?: string
  special_instructions?: string
  grooming_notes?: string
  exercise_requirements?: string
}

interface FoodItem {
  id: string
  name: string
  type: string
  started: string
  category: "Dry Food" | "Wet Food" | "Treats" | "Crisps"
}

interface HealthItem {
  id: string
  name: string
  type: string
  started: string
  category: "Treatment" | "Preventative" | "Allergies"
}

export default function PetProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { uniqueUrl, petId } = params

  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("general")
  const [activeSubTab, setActiveSubTab] = useState<string>("")

  // Mock data for demonstration - will be replaced with actual webhook data
  const mockFoodItems: FoodItem[] = [
    {
      id: "1",
      name: "Hill's Science Diet - Chicken & Grains (Primary)",
      type: "Dry Food",
      started: "4/16/2024",
      category: "Dry Food",
    },
    { id: "2", name: "Hills Science - Wet Food", type: "Wet Food", started: "7/4/2024", category: "Wet Food" },
    { id: "3", name: "Test", type: "Crisps", started: "10/3/2024", category: "Crisps" },
    { id: "4", name: "Test2", type: "Crisps", started: "6/24/2025", category: "Crisps" },
  ]

  const mockHealthItems: HealthItem[] = [
    { id: "1", name: "Apoquel", type: "Treatment", started: "4/16/2021", category: "Treatment" },
    { id: "2", name: "Simparica Trio", type: "Preventative", started: "4/16/2024", category: "Preventative" },
    { id: "3", name: "Tacrolimus", type: "Treatment", started: "4/16/2021", category: "Treatment" },
    { id: "4", name: "Test45", type: "Allergies", started: "6/24/2025", category: "Allergies" },
  ]

  useEffect(() => {
    // Mock pet data - will be replaced with actual webhook call
    const mockPet: Pet = {
      pet_name: "Spot",
      pet_id: petId as string,
      pet_type: "Dog",
      breed: "Golden Retriever",
      sex: "Male",
      chip_id: "124466",
      spayed_neutered: "Yes",
      birthdate: "None",
      gotcha_date: "None",
      feeding_instructions: "Feed twice daily",
      medication_schedule: "Apoquel once daily",
      exercise_requirements: "60 minutes daily",
      medical_conditions: "Allergies",
      allergies: "Environmental allergies",
      special_instructions: "Gentle with children",
    }

    setPet(mockPet)
    setLoading(false)
    setActiveSubTab("food") // Default sub-tab for food section
  }, [petId])

  const getPetIcon = (petType: string) => {
    const type = petType.toLowerCase()
    if (type.includes("dog")) return <Dog className="w-8 h-8" />
    if (type.includes("cat")) return <Cat className="w-8 h-8" />
    if (type.includes("fish")) return <Fish className="w-8 h-8" />
    if (type.includes("bird")) return <Bird className="w-8 h-8" />
    return <Heart className="w-8 h-8" />
  }

  const sidebarSections = [
    { id: "general", label: "General", active: activeSection === "general" },
    { id: "circle", label: "Circle", active: activeSection === "circle" },
    { id: "health", label: "Health", active: activeSection === "health" },
    { id: "food", label: "Food", active: activeSection === "food" },
  ]

  const renderGeneralContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-header">Pet Details</h2>
        <button className="text-[#E75837] hover:text-[#d64a2f]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-500 font-body">Name</label>
          <p className="text-lg text-gray-900 font-body">{pet?.pet_name}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 font-body">Type</label>
          <p className="text-lg text-gray-900 font-body">{pet?.pet_type}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 font-body">Sex</label>
          <p className="text-lg text-gray-900 font-body">{pet?.sex}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 font-body">Breed</label>
          <p className="text-lg text-gray-900 font-body">{pet?.breed}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 font-body">Spayed/Neutered</label>
          <p className="text-lg text-gray-900 font-body">{pet?.spayed_neutered}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 font-body">Chip ID</label>
          <p className="text-lg text-gray-900 font-body">{pet?.chip_id}</p>
        </div>
      </div>
    </div>
  )

  const renderFoodContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#E75837] font-header">Food</h2>
        <button className="text-[#E75837] hover:text-[#d64a2f]">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex space-x-8 border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab("food")}
          className={`pb-2 px-1 font-medium font-body ${
            activeSubTab === "food" ? "text-[#E75837] border-b-2 border-[#E75837]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Food
        </button>
        <button
          onClick={() => setActiveSubTab("treats")}
          className={`pb-2 px-1 font-medium font-body ${
            activeSubTab === "treats"
              ? "text-[#E75837] border-b-2 border-[#E75837]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Treats
        </button>
      </div>

      <div className="space-y-4">
        {mockFoodItems
          .filter((item) => (activeSubTab === "treats" ? item.category === "Treats" : item.category !== "Treats"))
          .map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div>
                <h3 className="font-medium text-gray-900 font-body">{item.name}</h3>
                <p className="text-sm text-gray-500 font-body">Started {item.started}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 font-body">{item.category}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
      </div>
    </div>
  )

  const renderHealthContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#E75837] font-header">Health</h2>
        <button className="text-[#E75837] hover:text-[#d64a2f]">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex space-x-8 border-b border-gray-200">
        {["medications", "conditions", "allergies", "weight"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-2 px-1 font-medium font-body capitalize ${
              activeSubTab === tab ? "text-[#E75837] border-b-2 border-[#E75837]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeSubTab === "medications" &&
          mockHealthItems
            .filter((item) => item.category === "Treatment" || item.category === "Preventative")
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium text-gray-900 font-body">{item.name}</h3>
                  <p className="text-sm text-gray-500 font-body">Started {item.started}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-body">{item.category}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}

        {activeSubTab === "allergies" &&
          mockHealthItems
            .filter((item) => item.category === "Allergies")
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium text-gray-900 font-body">{item.name}</h3>
                  <p className="text-sm text-gray-500 font-body">Started {item.started}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-body">{item.category}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}

        {(activeSubTab === "conditions" || activeSubTab === "weight") && (
          <div className="text-center py-8 text-gray-500 font-body">No {activeSubTab} recorded yet</div>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E75837] mx-auto mb-4"></div>
          <p className="text-gray-600 font-body">Loading pet profile...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-body">Pet not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-[#E75837] hover:text-[#d64a2f] flex items-center gap-2 font-body"
              >
                <ArrowLeft className="w-5 h-5" />
                {pet.pet_name} ({pet.pet_type})
              </button>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pet Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center text-[#E75837]">
                {getPetIcon(pet.pet_type)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-header">{pet.pet_name}</h1>
                <p className="text-gray-600 font-body">{pet.pet_type}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-[#E75837] text-[#E75837] rounded-lg hover:bg-[#E75837] hover:text-white transition-colors font-body">
                Activity Timeline
              </button>
              <button className="px-4 py-2 border border-[#E75837] text-[#E75837] rounded-lg hover:bg-[#E75837] hover:text-white transition-colors font-body">
                Care Plan
              </button>
              <button className="px-4 py-2 border border-[#E75837] text-[#E75837] rounded-lg hover:bg-[#E75837] hover:text-white transition-colors font-body">
                Vaccine Record
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info Grid */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500 font-body">Breed</label>
              <p className="text-gray-900 font-body">{pet.breed || "Not specified"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 font-body">Sex</label>
              <p className="text-gray-900 font-body">{pet.sex || "Not specified"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 font-body">Chip ID</label>
              <p className="text-gray-900 font-body">{pet.chip_id || "Not specified"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 font-body">Spayed/Neutered</label>
              <p className="text-gray-900 font-body">{pet.spayed_neutered || "Not specified"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 font-body">Birthdate</label>
              <p className="text-gray-900 font-body">{pet.birthdate || "None"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 font-body">Gotcha Date</label>
              <p className="text-gray-900 font-body">{pet.gotcha_date || "None"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-2">
              {sidebarSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id)
                    if (section.id === "food") setActiveSubTab("food")
                    if (section.id === "health") setActiveSubTab("medications")
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg font-body ${
                    section.active ? "bg-[#E75837] text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 p-8">
            {activeSection === "general" && renderGeneralContent()}
            {activeSection === "food" && renderFoodContent()}
            {activeSection === "health" && renderHealthContent()}
            {activeSection === "circle" && (
              <div className="text-center py-8 text-gray-500 font-body">Circle section coming soon</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
