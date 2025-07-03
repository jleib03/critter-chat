"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Download,
  Mail,
  CheckCircle2,
  Clock,
  Heart,
  Stethoscope,
  Activity,
  Camera,
  Star,
  X,
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
  const completedItems = carePlanItems.filter((item) => item.completed)
  const serviceDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "medical":
        return <Stethoscope className="w-4 h-4 text-red-600" />
      case "exercise":
        return <Activity className="w-4 h-4 text-blue-600" />
      case "comfort":
        return <Heart className="w-4 h-4 text-purple-600" />
      case "documentation":
        return <FileText className="w-4 h-4 text-green-600" />
      default:
        return <CheckCircle2 className="w-4 h-4 text-gray-600" />
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="bg-[#E75837] text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl header-font flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Service Completion Report
                </CardTitle>
                <p className="text-orange-100 body-font mt-1">Professional care session for {pet.name}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-orange-600">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Service Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900 header-font">Service Status</p>
                <p className="text-sm text-green-700 body-font">Completed Successfully</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900 header-font">Duration</p>
                <p className="text-sm text-blue-700 body-font">{serviceDuration} minutes</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-purple-900 header-font">Tasks Completed</p>
                <p className="text-sm text-purple-700 body-font">
                  {completedItems.length} of {carePlanItems.length}
                </p>
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 header-font">Service Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 body-font">Date:</p>
                    <p className="font-medium body-font">{formatDate(startTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 body-font">Time:</p>
                    <p className="font-medium body-font">
                      {formatTime(startTime)} - {formatTime(endTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 body-font">Pet:</p>
                    <p className="font-medium body-font">
                      {pet.name} ({pet.breed}, {pet.age} years)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 body-font">Owner:</p>
                    <p className="font-medium body-font">
                      {customer.firstName} {customer.lastName}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* AI-Generated Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 header-font flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded text-white flex items-center justify-center text-xs font-bold">
                    AI
                  </div>
                  Professional Summary
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-800 body-font leading-relaxed">
                    Luna received comprehensive post-surgical care during today's 40-minute session. All prescribed
                    medications were administered successfully, including her daily Carprofen (75mg) and joint
                    supplement, both given with food as per her profile preferences. The surgical site inspection
                    revealed excellent healing progress with no signs of complications - the incision appears clean,
                    dry, and free from swelling or discharge.
                  </p>
                  <p className="text-gray-800 body-font leading-relaxed mt-3">
                    Luna demonstrated good mobility during her gentle 10-minute walk, showing minimal limping and
                    maintaining enthusiasm throughout. Mental stimulation was provided through puzzle toy engagement,
                    which she enjoyed without physical strain. Her overall demeanor was positive, with normal appetite,
                    good energy levels, and typical social behavior including tail wagging and engagement with
                    activities.
                  </p>
                  <p className="text-gray-800 body-font leading-relaxed mt-3">
                    <strong>Recommendation:</strong> Continue current care protocol. Luna is responding well to
                    treatment and showing excellent recovery progress. No concerns noted during this session.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Completed Tasks */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 header-font">Completed Care Tasks</h3>
                <div className="space-y-3">
                  {completedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex-shrink-0 mt-0.5">{getCategoryIcon(item.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 header-font">{item.title}</h4>
                          <Badge variant="outline" className="text-xs body-font">
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </Badge>
                          {item.completedAt && (
                            <span className="text-xs text-gray-500 body-font">
                              {formatTime(new Date(item.completedAt))}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 body-font mb-2">{item.description}</p>
                        {item.notes && (
                          <div className="bg-white border rounded p-2">
                            <p className="text-sm text-gray-700 body-font">
                              <strong>Notes:</strong> {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Photos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 header-font flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Documentation Photos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 body-font">Luna resting after medication</p>
                    <p className="text-xs text-gray-500 body-font mt-1">
                      Taken at {formatTime(new Date(Date.now() - 30 * 60 * 1000))}
                    </p>
                  </div>
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 body-font">Luna during gentle exercise</p>
                    <p className="text-xs text-gray-500 body-font mt-1">
                      Taken at {formatTime(new Date(Date.now() - 15 * 60 * 1000))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button className="flex-1 bg-[#E75837] hover:bg-orange-600 text-white body-font">
                <Mail className="w-4 h-4 mr-2" />
                Email Report to Customer
              </Button>
              <Button variant="outline" className="flex-1 body-font bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t">
              <p className="text-sm text-gray-500 body-font">
                Report generated automatically by Critter AI • Professional reviewed and approved
              </p>
              <p className="text-xs text-gray-400 body-font mt-1">
                Generated on {formatDate(new Date())} at {formatTime(new Date())}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
