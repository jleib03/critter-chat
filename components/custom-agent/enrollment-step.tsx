"use client"
import type React from "react"
import { ArrowRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

type EnrollmentStepProps = {
  professionalId: string
  setProfessionalId: (id: string) => void
  isEnrolled: boolean | null
  toggleEnrollment: (enroll: boolean) => void
  onNext: () => void
}

export default function EnrollmentStep({
  professionalId,
  setProfessionalId,
  isEnrolled,
  toggleEnrollment,
  onNext,
}: EnrollmentStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const getStatusIcon = () => {
    if (isEnrolled === null) return null
    if (isEnrolled) return <CheckCircle2 className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusText = () => {
    if (isEnrolled === null) return ""
    if (isEnrolled) return "✅ Enrolled in Custom Support Agent program"
    return "❌ Not enrolled in Custom Support Agent program"
  }

  const getStatusColor = () => {
    if (isEnrolled === null) return ""
    if (isEnrolled) return "text-green-700 bg-green-50 border-green-200"
    return "text-red-700 bg-red-50 border-red-200"
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 header-font">Step 1: Enrollment Verification</h2>
      <p className="text-gray-600 mb-6 body-font">
        Enter your professional ID to verify your enrollment status in the Custom Support Agent program.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="professionalId" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Professional ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="professionalId"
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
            placeholder="Enter your professional ID (e.g., 151)"
            required
          />
          <p className="text-sm text-gray-500 mt-1 body-font">
            Your professional ID can be found in your Critter dashboard or account settings.
          </p>
        </div>

        {/* Status Display */}
        {isEnrolled !== null && (
          <div className={`border rounded-lg p-4 flex items-center ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-2 body-font">{getStatusText()}</span>
          </div>
        )}

        {/* Enrollment Action */}
        {isEnrolled === false && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-2 header-font">Enrollment Required</h3>
                <p className="text-sm text-blue-700 mb-3 body-font">
                  You need to be enrolled in the Custom Support Agent program to continue. Would you like to enroll now?
                </p>
                <button
                  type="button"
                  onClick={() => toggleEnrollment(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm body-font"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unenroll Option */}
        {isEnrolled === true && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2 header-font">Enrollment Status</h3>
            <p className="text-sm text-gray-600 mb-3 body-font">
              You are currently enrolled in the Custom Support Agent program. You can unenroll at any time.
            </p>
            <button
              type="button"
              onClick={() => toggleEnrollment(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm body-font"
            >
              Unenroll
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!professionalId.trim() || isEnrolled !== true}
            className="flex items-center px-6 py-2 rounded-lg bg-[#94ABD6] text-white hover:bg-[#7a90ba] transition-colors disabled:opacity-50 disabled:cursor-not-allowed body-font"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
