import type React from "react"

interface OnboardingFormProps {
  professionalName: string
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ professionalName }) => {
  return (
    <div>
      <h1>Onboarding Form</h1>
      <p>You're completing the intake process for {professionalName}</p>
      {/* Add form elements here */}
      <form>
        {/* Example form fields */}
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" />

        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" />

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default OnboardingForm
