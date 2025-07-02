"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Clock,
  CheckCircle2,
  Heart,
  Activity,
  Pill,
  Send,
  Sparkles,
  User,
  PawPrint,
  ThumbsUp,
} from "lucide-react"

interface AfterActionReportProps {
  pet: any
  customer: any
  carePlanItems: any[]
  timelineEvents: any[]
  startTime: Date
  endTime: Date
  onClose: () => void
}

export function AfterActionReport({
  pet,
  customer,
  carePlanItems,
  timelineEvents,
  startTime,
  endTime,
  onClose,
}: AfterActionReportProps) {
  const [professionalNotes, setProfessionalNotes] = useState("")
  const [aiDraftGenerated, setAiDraftGenerated] = useState(false)

  const serviceDuration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
  const completedItems = carePlanItems.filter((item) => item.completed)
  const completionRate = (completedItems.length / carePlanItems.length) * 100

  const generateAiDraft = () => {
    const aiGeneratedReport = `Service Summary for ${pet.name}:

Today's care session went exceptionally well. ${pet.name} was alert, responsive, and showed good spirits throughout the visit. Her post-surgical recovery continues to progress positively.

Medical Care Completed:
• Administered Carprofen 75mg with food as prescribed - ${pet.name} took medication without difficulty
• Provided joint supplement mixed with wet food per owner preferences
• Conducted visual inspection of hip surgery site - healing appears normal with no signs of swelling, discharge, or irritation

Exercise & Activity:
• Completed gentle 10-minute walk on flat surfaces - ${pet.name} walked steadily with minimal favoring of surgical leg
• Engaged in mental stimulation with puzzle toy - she remained focused and engaged for 15 minutes
• Avoided stairs and inclines as directed by veterinary team

Comfort & Behavior Assessment:
• ${pet.name} showed no obvious signs of pain or discomfort during activities
• Appetite appears normal - eagerly took treats and medication with food
• Mood was positive and social - tail wagging and seeking attention
• Rested comfortably on orthopedic bed between activities

Recommendations:
• Continue current medication regimen as prescribed
• Maintain gentle exercise routine - ${pet.name} is ready for slightly longer walks if approved by vet
• Monitor for any changes in mobility or comfort level
• Next visit should include assessment for increased activity level

Overall, ${pet.name} is recovering beautifully from her hip surgery. Her compliance with medication and positive attitude make her a joy to care for. I recommend continuing the current care plan with potential for gradual activity increases as healing progresses.`

    setProfessionalNotes(aiGeneratedReport)
    setAiDraftGenerated(true)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "medical":
        return <Pill className="w-4 h-4 text-red-600" />
      case "exercise":
        return <Activity className="w-4 h-4 text-blue-600" />
      case "comfort":
        return <Heart className="w-4 h-4 text-purple-600" />
      case "documentation":
        return <FileText className="w-4 h-4 text-green-600" />
      default:
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl header-font text-[#E75837] flex items-center gap-2">
                <FileText className="w-6 h-6" />
                After Action Report
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 body-font">Service Completed</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 body-font">
              <div className="flex items-center gap-1">
                <PawPrint className="w-4 h-4" />
                {pet.name} ({pet.breed})
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {customer.firstName} {customer.lastName}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {serviceDuration} minutes
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Service Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg header-font">Service Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{Math.round(completionRate)}%</div>
                <div className="text-sm text-gray-600 body-font">Care Plan Completion</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{serviceDuration}</div>
                <div className="text-sm text-gray-600 body-font">Minutes of Care</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">{timelineEvents.length}</div>
                <div className="text-sm text-gray-600 body-font">Timeline Updates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Care Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg header-font">Completed Care Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="mt-0.5">{getCategoryIcon(item.category)}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800 body-font">{item.title}</h4>
                    <p className="text-sm text-green-700 body-font">{item.description}</p>
                    {item.notes && <p className="text-xs text-green-600 mt-1 body-font italic">Note: {item.notes}</p>}
                    <p className="text-xs text-green-600 mt-1 body-font">
                      Completed at {new Date(item.completedAt!).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI-Generated Report */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg header-font flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Professional Report
              </CardTitle>
              {!aiDraftGenerated && (
                <Button onClick={generateAiDraft} variant="outline" className="body-font bg-transparent">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Draft
                </Button>
              )}
            </div>
            {aiDraftGenerated && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">AI-Generated Draft</span>
                </div>
                <p className="text-blue-700 text-xs mt-1 body-font">
                  This report was generated using AI based on completed care items and timeline data. Please review and
                  edit as needed.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Click 'Generate AI Draft' to create a professional report, then review and edit as needed..."
              value={professionalNotes}
              onChange={(e) => setProfessionalNotes(e.target.value)}
              className="min-h-[300px] body-font"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button onClick={onClose} variant="outline" className="body-font bg-transparent">
            Back to Service
          </Button>
          <Button className="bg-[#E75837] hover:bg-[#d14a2a] text-white body-font" disabled={!professionalNotes.trim()}>
            <Send className="w-4 h-4 mr-2" />
            Send Report to Customer
          </Button>
        </div>

        {/* Customer Notification Preview */}
        {professionalNotes.trim() && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg header-font text-green-800 flex items-center gap-2">
                <ThumbsUp className="w-5 h-5" />
                Customer Will Receive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#E75837] rounded-full flex items-center justify-center">
                    <PawPrint className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium body-font">Service Report for {pet.name}</h4>
                    <p className="text-sm text-gray-600 body-font">
                      From your Critter professional • {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 body-font">
                  Professional report, photos, and timeline will be delivered via email and Critter app notification.
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
