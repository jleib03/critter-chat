"use client"
import { useState } from "react"
import { ArrowRight, Check, X } from "lucide-react"

type EnrollmentStepProps = {
  professionalName: string
  setProfessionalName: (name: string) => void
  isEnrolled: boolean
  toggleEnrollment: (enroll: boolean) => Promise<boolean>
  onNext: () => void
}

export default function EnrollmentStep({
  professionalName,
  setProfessionalName,
  isEnrolled,
  toggleEnrollment,
  onNext,
}: EnrollmentStepProps) {
  const [wantsToEnroll, setWantsToEnroll] = useState(false)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 header-font">Step 1: Enrollment</h2>
      <p className="text-gray-600 mb-6 body-font">
        Let's start by verifying your Critter professional account. Please enter your business name exactly as it
        appears in your Critter account.
      </p>

      <div className="mb-6">
        <label htmlFor="professionalName" className="block text-sm font-medium text-gray-700 mb-2 header-font">
          Business Name*
        </label>
        <input
          type="text"
          id="professionalName"
          value={professionalName}
          onChange={(e) => setProfessionalName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
          placeholder="Enter your business name as it appears in Critter"
        />
        <p className="mt-2 text-sm text-gray-500 body-font">
          This helps us verify your account and set up your custom support agent.
        </p>
      </div>

      {isEnrolled !== null && professionalName && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            isEnrolled ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
          }`}
        >
          {isEnrolled ? (
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 header-font">Enrollment Active</h3>
                <p className="mt-1 text-sm text-green-700 body-font">
                  Your business is already enrolled in the Custom Support Agent program. You can proceed to configure
                  your agent.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800 header-font">Not Enrolled</h3>
                <p className="mt-1 text-sm text-amber-700 body-font">
                  Your business is not currently enrolled in the Custom Support Agent program. Would you like to enroll
                  now?
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setWantsToEnroll(true)
                      toggleEnrollment(true)
                    }}
                    className="bg-[#94ABD6] text-white px-4 py-2 rounded-lg hover:bg-[#7a90ba] transition-colors body-font"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          disabled={!professionalName || (!isEnrolled && !wantsToEnroll)}
          className={`flex items-center px-6 py-2 rounded-lg text-white transition-colors body-font ${
            professionalName && (isEnrolled || wantsToEnroll)
              ? "bg-[#94ABD6] hover:bg-[#7a90ba]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
