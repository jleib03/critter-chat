import type React from "react"

interface OnboardingFormProps {
  professionalName: string
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ professionalName }) => {
  return (
    <div>
      <h1>You're completing the intake process for {professionalName}</h1>
      {/* Rest of the onboarding form content goes here */}
      <p>Please fill out the following information to complete your onboarding.</p>
      {/* Add form fields and submit button here */}
    </div>
  )
}

export default OnboardingForm
