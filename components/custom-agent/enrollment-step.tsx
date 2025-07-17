"use client"
import { useState } from "react"
import { ArrowRight, Check, X, Search, Loader2 } from "lucide-react"

type EnrollmentStepProps = {
  professionalId: string
  setProfessionalId: (id: string) => void
  isEnrolled: boolean | null
  toggleEnrollment: (enroll: boolean) => Promise<boolean>
  onNext: () => void
}

export default function EnrollmentStep({
  professionalId,
  setProfessionalId,
  isEnrolled,
  toggleEnrollment,
  onNext,
}: EnrollmentStepProps) {
  const [wantsToEnroll, setWantsToEnroll] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [hasVerified, setHasVerified] = useState(false)
  const [justEnrolled, setJustEnrolled] = useState(false)

  const handleVerify = async () => {
    if (!professionalId.trim()) return
    setIsVerifying(true)

    try {
      // This will trigger the parent component's checkEnrollmentStatus function
      await onNext()
      setHasVerified(true)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleEnrollNow = async () => {
    setWantsToEnroll(true)
    const success = await toggleEnrollment(true)
    if (success) {
      setJustEnrolled(true)
      // Enrollment was successful, the parent will update isEnrolled state
    }
  }

  // Show verification form if we haven't verified yet
  if (!hasVerified || isEnrolled === null) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4 header-font">Step 1: Enrollment Verification</h2>
        <p className="text-gray-600 mb-6 body-font">
          Enter your professional ID to verify your enrollment status in the Custom Support Agent program.
        </p>

        <div className="mb-6">
          <label htmlFor="professionalId" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Professional ID*
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="professionalId"
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
              placeholder="Enter your professional ID (e.g., 151)"
              disabled={isVerifying}
            />
            <button
              onClick={handleVerify}
              disabled={!professionalId.trim() || isVerifying}
              className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors ${
                !professionalId.trim() || isVerifying
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#94ABD6] hover:bg-[#7a90ba] text-white"
              }`}
            >
              {isVerifying ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 mr-1" />
                  Verify
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500 body-font">
            Your professional ID can be found in your Critter dashboard or account settings.
          </p>
        </div>
      </div>
    )
  }

  // Show enrollment status after verification
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 header-font">Step 1: Enrollment Verification</h2>
      <p className="text-gray-600 mb-6 body-font">
        Great! We've verified your professional ID. Here's your enrollment status:
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 header-font">Professional ID</label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg body-font text-gray-700">{professionalId}</div>
      </div>

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
              {justEnrolled ? (
                <>
                  <h3 className="text-sm font-medium text-green-800 header-font">Successfully Enrolled!</h3>
                  <p className="mt-1 text-sm text-green-700 body-font">
                    Great! Your professional account has been successfully enrolled in the Custom Support Agent program.
                    You can now proceed to configure your personalized agent.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-green-800 header-font">Enrollment Active</h3>
                  <p className="mt-1 text-sm text-green-700 body-font">
                    Your professional account is already enrolled in the Custom Support Agent program. You can proceed
                    to update your agent configuration or create a new setup.
                  </p>
                </>
              )}
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
                Your professional account is not currently enrolled in the Custom Support Agent program. Would you like
                to enroll now?
              </p>
              <div className="mt-3">
                <button
                  onClick={handleEnrollNow}
                  disabled={wantsToEnroll}
                  className={`px-4 py-2 rounded-lg transition-colors body-font ${
                    wantsToEnroll ? "bg-gray-300 cursor-not-allowed" : "bg-[#94ABD6] text-white hover:bg-[#7a90ba]"
                  }`}
                >
                  {wantsToEnroll ? "Enrolling..." : "Enroll Now"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={() => onNext()}
          disabled={!isEnrolled && !wantsToEnroll}
          className={`flex items-center px-6 py-2 rounded-lg text-white transition-colors body-font ${
            isEnrolled || wantsToEnroll ? "bg-[#94ABD6] hover:bg-[#7a90ba]" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {justEnrolled ? "Configure Agent" : isEnrolled ? "Update Configuration" : "Next"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
