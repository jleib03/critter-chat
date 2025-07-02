"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { FileText, Clock, CheckCircle2, Sparkles, Send, Edit3, Download, Share } from "lucide-react"

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

type TimelineEvent = {
  id: string
  timestamp: string
  type: "start" | "completion" | "note" | "photo" | "end"
  title: string
  description?: string
  category?: string
}

interface AfterActionReportProps {
  pet: any
  customer: any
  carePlanItems: CarePlanItem[]
  timelineEvents: TimelineEvent[]
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
  const [isEditing, setIsEditing] = useState(false)
  const [reportContent, setReportContent] = useState(() => {
    // AI-generated draft report
    const completedItems = carePlanItems.filter((item) => item.completed)
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

    return `**Service Summary for ${pet.name}**

**Duration:** ${duration} minutes
**Date:** ${startTime.toLocaleDateString()}
**Time:** ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}

**Care Provided:**
${completedItems.map((item) => `• ${item.title}${item.notes ? ` - ${item.notes}` : ""}`).join("\n")}

**Medical Care:**
Luna received her prescribed Carprofen 75mg with food as directed. Joint supplement was administered mixed with wet food per her preference. Surgical site inspection showed excellent healing with no signs of swelling, discharge, or irritation.

**Exercise & Activity:**
Completed a gentle 10-minute walk on flat surfaces, avoiding stairs and inclines as recommended. Luna showed good energy and mobility. Mental stimulation provided through puzzle toy engagement - she particularly enjoyed the treat-dispensing toy.

**Comfort Assessment:**
Luna appeared comfortable throughout the session with no signs of pain or discomfort. She had access to her orthopedic bedding and settled comfortably after activities.

**Overall Condition:**
Luna is progressing well in her post-surgical recovery. Her appetite remains good, energy levels are appropriate for her recovery stage, and she continues to show positive engagement with activities. No concerns noted during this session.

**Recommendations:**
Continue current medication schedule and gentle exercise routine. Luna is ready for gradual activity increases as approved by her veterinarian.

**Next Steps:**
Follow-up care session scheduled. Recommend continuing current care plan with potential for increased activity duration next week.`
  })

  const formatDuration = (start: Date, end: Date) => {
    const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  const completedItems = carePlanItems.filter((item) => item.completed)
  const completionRate = Math.round((completedItems.length / carePlanItems.length) * 100)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 header-font">
                <FileText className="w-6 h-6 text-[#E75837]" />
                After Action Report - {pet.name}
              </CardTitle>
              <Button variant="outline" onClick={onClose} className="body-font bg-transparent">
                Back to Service
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="body-font">{formatDuration(startTime, endTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="body-font">
                  {completedItems.length}/{carePlanItems.length} tasks completed
                </span>
              </div>
              <Badge variant="outline" className="body-font">
                {completionRate}% completion rate
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* AI Draft Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800 header-font">AI-Generated Draft Report</span>
              </div>
              <p className="text-sm text-blue-700 body-font">
                This report has been automatically generated based on completed care plan items and timeline events.
                Please review and edit as needed before sending to the customer.
              </p>
            </div>

            {/* Report Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold header-font">Report Content</h3>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="body-font">
                  <Edit3 className="w-4 h-4 mr-2" />
                  {isEditing ? "Preview" : "Edit Report"}
                </Button>
              </div>

              {isEditing ? (
                <Textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm body-font"
                  placeholder="Edit the report content..."
                />
              ) : (
                <div className="bg-white border rounded-lg p-6">
                  <div className="prose prose-sm max-w-none">
                    {reportContent.split("\n").map((line, index) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                          <h4 key={index} className="font-semibold text-gray-900 mt-4 mb-2 header-font">
                            {line.replace(/\*\*/g, "")}
                          </h4>
                        )
                      }
                      if (line.startsWith("•")) {
                        return (
                          <li key={index} className="text-gray-700 body-font">
                            {line.substring(2)}
                          </li>
                        )
                      }
                      if (line.trim()) {
                        return (
                          <p key={index} className="text-gray-700 mb-2 body-font">
                            {line}
                          </p>
                        )
                      }
                      return <br key={index} />
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Service Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#E75837] body-font">{completedItems.length}</div>
                  <div className="text-sm text-gray-600 body-font">Tasks Completed</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#E75837] body-font">
                    {formatDuration(startTime, endTime)}
                  </div>
                  <div className="text-sm text-gray-600 body-font">Service Duration</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#E75837] body-font">{completionRate}%</div>
                  <div className="text-sm text-gray-600 body-font">Completion Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t">
              <Button className="bg-[#E75837] hover:bg-[#d04e30] text-white body-font">
                <Send className="w-4 h-4 mr-2" />
                Send to Customer
              </Button>

              <Button variant="outline" className="body-font bg-transparent">
                <Share className="w-4 h-4 mr-2" />
                Share with Vet
              </Button>

              <Button variant="outline" className="body-font bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>

            {/* Customer Preview */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 header-font">Customer Will Receive:</h4>
              <div className="text-sm text-gray-600 space-y-1 body-font">
                <p>• Detailed service report via email and app notification</p>
                <p>• Real-time timeline of all completed activities</p>
                <p>• Photos and documentation from the session</p>
                <p>• Recommendations for ongoing care</p>
                <p>• Option to share report with veterinarian</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
