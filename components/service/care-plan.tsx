"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Heart, Activity, Pill, FileText, Sparkles, User } from "lucide-react"

type CarePlanItem = {
  id: string
  category: "medical" | "exercise" | "feeding" | "comfort" | "documentation"
  title: string
  description: string
  completed: boolean
  completedAt?: string
  notes?: string
  autoCompleted?: boolean
  fromProfile?: boolean
}

interface CarePlanProps {
  items: CarePlanItem[]
  onItemComplete: (itemId: string, notes?: string) => void
  progressPercentage: number
  pet: any
  serviceActive: boolean
}

export function CarePlan({ items, onItemComplete, progressPercentage, pet, serviceActive }: CarePlanProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [itemNotes, setItemNotes] = useState<{ [key: string]: string }>({})

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "medical":
        return <Pill className="w-4 h-4" />
      case "exercise":
        return <Activity className="w-4 h-4" />
      case "comfort":
        return <Heart className="w-4 h-4" />
      case "documentation":
        return <FileText className="w-4 h-4" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "medical":
        return "text-red-600 bg-red-50 border-red-200"
      case "exercise":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "comfort":
        return "text-purple-600 bg-purple-50 border-purple-200"
      case "documentation":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const handleItemClick = (itemId: string) => {
    if (!serviceActive) return
    setExpandedItem(expandedItem === itemId ? null : itemId)
  }

  const handleCompleteItem = (itemId: string) => {
    const notes = itemNotes[itemId] || ""
    onItemComplete(itemId, notes)
    setExpandedItem(null)
    setItemNotes((prev) => ({ ...prev, [itemId]: "" }))
  }

  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    },
    {} as { [key: string]: CarePlanItem[] },
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl header-font text-[#E75837] flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Critter Care Plan - {pet.name}
          </CardTitle>
          <Badge variant="outline" className="body-font">
            {Math.round(progressPercentage)}% Complete
          </Badge>
        </div>
        <Progress value={progressPercentage} className="mt-2" />

        {/* Auto-completion notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <User className="w-4 h-4" />
            <span className="font-medium">Smart Care Plan</span>
          </div>
          <p className="text-blue-700 text-xs mt-1 body-font">
            Items marked with ✨ are auto-populated from {pet.name}'s Critter profile including medications,
            preferences, and vet instructions.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category}>
            <h3 className="font-semibold text-gray-900 mb-3 header-font capitalize flex items-center gap-2">
              {getCategoryIcon(category)}
              {category} Care
            </h3>

            <div className="space-y-2">
              {categoryItems.map((item) => (
                <div key={item.id}>
                  <div
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      item.completed
                        ? "bg-green-50 border-green-200"
                        : serviceActive
                          ? "hover:bg-gray-50 border-gray-200"
                          : "border-gray-200 opacity-60"
                    }`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className={`font-medium body-font ${item.completed ? "text-green-800" : "text-gray-900"}`}
                          >
                            {item.title}
                          </h4>
                          {item.autoCompleted && (
                            <Sparkles className="w-3 h-3 text-blue-500" title="Auto-populated from pet profile" />
                          )}
                          {item.fromProfile && (
                            <Badge variant="outline" className="text-xs body-font">
                              From Profile
                            </Badge>
                          )}
                        </div>

                        <p className={`text-sm body-font ${item.completed ? "text-green-700" : "text-gray-600"}`}>
                          {item.description}
                        </p>

                        {item.completed && item.completedAt && (
                          <p className="text-xs text-green-600 mt-1 body-font">
                            Completed at {new Date(item.completedAt).toLocaleTimeString()}
                            {item.notes && ` • ${item.notes}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded item for completion */}
                  {expandedItem === item.id && !item.completed && serviceActive && (
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 body-font">Add notes (optional):</label>
                          <Textarea
                            placeholder="Any observations or notes about this task..."
                            value={itemNotes[item.id] || ""}
                            onChange={(e) => setItemNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            className="mt-1"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleCompleteItem(item.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white body-font"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Mark Complete
                          </Button>
                          <Button
                            onClick={() => setExpandedItem(null)}
                            size="sm"
                            variant="outline"
                            className="body-font"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {!serviceActive && (
          <div className="text-center py-8 text-gray-500 body-font">
            Start the service to begin completing care plan items
          </div>
        )}
      </CardContent>
    </Card>
  )
}
