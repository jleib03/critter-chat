"use client"
import { RefreshCw } from "lucide-react"
import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from "react"

type UserInfoFormProps = {
  selectedAction: string
  resetChat: () => void
  onValidationChange: (isValid: boolean) => void
}

export type UserInfoFormHandle = {
  getValues: () => {
    firstName: string
    lastName: string
    email: string
  }
  isValid: () => boolean
}

const UserInfoForm = forwardRef<UserInfoFormHandle, UserInfoFormProps>(
  ({ selectedAction, resetChat, onValidationChange }, ref) => {
    const firstNameRef = useRef<HTMLInputElement>(null)
    const lastNameRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)
    const actionSelectRef = useRef<HTMLInputElement>(null)

    const [validationErrors, setValidationErrors] = useState<{
      firstName?: string
      lastName?: string
      email?: string
    }>({})

    // Update the hidden input when selectedAction changes
    useEffect(() => {
      if (actionSelectRef.current) {
        actionSelectRef.current.value = selectedAction
      }
    }, [selectedAction])

    // Validation function
    const validateForm = () => {
      const firstName = firstNameRef.current?.value.trim() || ""
      const lastName = lastNameRef.current?.value.trim() || ""
      const email = emailRef.current?.value.trim() || ""

      const errors: typeof validationErrors = {}

      if (!firstName) {
        errors.firstName = "First name is required"
      }

      if (!lastName) {
        errors.lastName = "Last name is required"
      }

      if (!email) {
        errors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Please enter a valid email address"
      }

      setValidationErrors(errors)
      const isValid = Object.keys(errors).length === 0
      onValidationChange(isValid)
      return isValid
    }

    // Check validation on input changes
    const handleInputChange = () => {
      // Small delay to allow the input value to update
      setTimeout(validateForm, 0)
    }

    // Expose the form values and validation to the parent component
    useImperativeHandle(ref, () => ({
      getValues: () => ({
        firstName: firstNameRef.current?.value.trim() || "",
        lastName: lastNameRef.current?.value.trim() || "",
        email: emailRef.current?.value.trim() || "",
      }),
      isValid: () => {
        return validateForm()
      },
    }))

    // Run initial validation
    useEffect(() => {
      validateForm()
    }, [])

    // Helper function to display action name
    const getActionDisplayName = (action: string): string => {
      const actionDisplayNames: { [key: string]: string } = {
        new_customer: "New Customer",
        new_customer_onboarding: "New Customer (Has Professional)",
        new_customer_lead: "New Customer (Needs Professional)",
        new_booking: "New Booking",
        change_booking: "Change Existing Booking",
        cancel_booking: "Cancel Booking",
        list_bookings: "List Bookings",
        list_outstanding: "Outstanding Invoices",
      }
      return actionDisplayNames[action] || action
    }

    const hasAnyErrors = Object.keys(validationErrors).length > 0
    const hasRequiredFields =
      firstNameRef.current?.value.trim() && lastNameRef.current?.value.trim() && emailRef.current?.value.trim()

    return (
      <div className="flex flex-col h-full">
        <div className="bg-[#E75837] text-white py-3 px-4 rounded-t-lg">
          <h2 className="text-xl font-medium header-font">Tell us about you</h2>
        </div>
        <div className="bg-white rounded-b-lg p-6 shadow-sm flex-1 flex flex-col overflow-y-auto user-info-container">
          <p className="text-gray-700 mb-4 body-font">
            Let's start by telling us a little bit about yourself, with first/last name and/or email. This lets Critter
            match you to the services providers you already work with.
          </p>

          {/* Required fields notice */}
          {hasAnyErrors && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg mb-4 text-sm body-font">
              <p className="font-medium">Please complete all required fields to continue:</p>
              <ul className="mt-1 text-xs">
                {validationErrors.email && <li>• {validationErrors.email}</li>}
                {validationErrors.firstName && <li>• {validationErrors.firstName}</li>}
                {validationErrors.lastName && <li>• {validationErrors.lastName}</li>}
              </ul>
            </div>
          )}

          <div className="space-y-4 flex-1">
            <div>
              <input
                type="email"
                ref={emailRef}
                placeholder="Email*"
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                  validationErrors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-600 body-font">{validationErrors.email}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                ref={firstNameRef}
                placeholder="First Name*"
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                  validationErrors.firstName ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
              />
              {validationErrors.firstName && (
                <p className="mt-1 text-xs text-red-600 body-font">{validationErrors.firstName}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                ref={lastNameRef}
                placeholder="Last Name*"
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                  validationErrors.lastName ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
              />
              {validationErrors.lastName && (
                <p className="mt-1 text-xs text-red-600 body-font">{validationErrors.lastName}</p>
              )}
            </div>

            {/* Current Action Section */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2 header-font">Current Action</h3>
              <div
                className={`w-full p-3 border border-gray-300 rounded-lg text-base bg-gray-50 body-font ${
                  selectedAction ? "text-gray-800" : "text-gray-500 italic"
                }`}
              >
                {selectedAction ? getActionDisplayName(selectedAction) : "No action selected yet"}
              </div>
              <input type="hidden" id="action-select" ref={actionSelectRef} value={selectedAction} />
              <p className="mt-2 text-xs text-gray-500 body-font">
                {hasAnyErrors
                  ? "Complete the required fields above to select an action"
                  : "Please select an action from the chat options on the right"}
              </p>
            </div>

            {selectedAction && (
              <div className="mt-4">
                <button
                  onClick={resetChat}
                  className="flex items-center justify-center w-full p-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors body-font"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Do Something Else
                </button>
                <p className="mt-1 text-xs text-gray-500 body-font">
                  This will reset the chat and let you select a different action
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)

UserInfoForm.displayName = "UserInfoForm"

export default UserInfoForm
