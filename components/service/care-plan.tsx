"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Sparkles, Stethoscope, Activity, Heart, FileText, AlertCircle } from "lucide-react"

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

const categoryIcons = {
  medical: Stethoscope,
  exercise: Activity,
  feeding: Heart,
  comfort: Heart,
  documentation: FileText,
}

const categoryColors = {
  medical: "bg-red-50 border-red-200 text-red-800",
  exercise: "bg-blue-50 border-blue-200 text-blue-800",
  feeding: "bg-green-50 border-green-200 text-green-800",
  comfort: "bg-purple-50 border-purple-200 text-purple-800",
  documentation: "bg-gray-50 border-gray-200 text-gray-800",
}

export function CarePlan({ items, onItemComplete, progressPercentage, pet, serviceActive }: CarePlanProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const handleItemClick = (itemId: string) => {
    if (!serviceActive) return

    const item = items.find((i) => i.id === itemId)
    if (item?.completed) return

    setExpandedItem(expandedItem === itemId ? null : itemId)
  }

  const handleComplete = (itemId: string) => {
    const itemNotes = notes[itemId] || ""
    onItemComplete(itemId, itemNotes)
    setExpandedItem(null)
    setNotes((prev) => ({ ...prev, [itemId]: "" }))
  }

  const completedItems = items.filter((item) => item.completed)
  const pendingItems = items.filter((item) => !item.completed)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 header-font">
            <Sparkles className="w-5 h-5 text-[#E75837]" />
            Critter Care Plan - {pet.name}
          </CardTitle>
          <Badge variant="outline" className="body-font">
            {completedItems.length} of {items.length} completed
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 body-font">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {!serviceActive && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-800 body-font">
              Start the service timer to begin completing care plan items
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Auto-completed items notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 header-font">Smart Care Plan</span>
          </div>
          <p className="text-xs text-blue-700 body-font">
            Items marked with ✨ are auto-populated from {pet.name}'s Critter profile, including vet instructions,
            medication schedules, and care preferences.
          </p>
        </div>

        {/* Pending Items */}
        {pendingItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 header-font">Pending Tasks</h4>
            {pendingItems.map((item) => {
              const Icon = categoryIcons[item.category]
              const isExpanded = expandedItem === item.id

              return (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <div
                    className={`p-4 cursor-pointer transition-colors ${
                      serviceActive ? "hover:bg-gray-50" : "opacity-60"
                    }`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900 header-font">{item.title}</span>
                          {item.autoCompleted && <Sparkles className="w-3 h-3 text-blue-500" />}
                          {item.fromProfile && (
                            <Badge variant="secondary" className="text-xs body-font">
                              From Profile
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 body-font">{item.description}</p>

                        <Badge variant="outline" className={`mt-2 text-xs ${categoryColors[item.category]} body-font`}>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {isExpanded && serviceActive && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 header-font">
                            Completion Notes
                          </label>
                          <Textarea
                            placeholder="Add any observations, notes, or details about completing this task..."
                            value={notes[item.id] || ""}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            className="body-font"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleComplete(item.id)}
                            className="bg-green-600 hover:bg-green-700 text-white body-font"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark Complete
                          </Button>
                          <Button variant="outline" onClick={() => setExpandedItem(null)} className="body-font">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 header-font">Completed Tasks</h4>
            {completedItems.map((item) => {
              const Icon = categoryIcons[item.category]

              return (
                <div key={item.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900 header-font">{item.title}</span>
                        {item.autoCompleted && <Sparkles className="w-3 h-3 text-blue-500" />}
                        {item.fromProfile && (
                          <Badge variant="secondary" className="text-xs body-font">
                            From Profile
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-green-700 body-font">{item.description}</p>

                      {item.notes && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <p className="text-sm text-gray-700 body-font">
                            <strong>Notes:</strong> {item.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs ${categoryColors[item.category]} body-font`}>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </Badge>
                        {item.completedAt && (
                          <span className="text-xs text-green-600 body-font">
                            Completed at {new Date(item.completedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
