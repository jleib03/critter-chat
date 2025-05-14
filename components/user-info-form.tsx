"use client"
import { RefreshCw } from "lucide-react"
import { useRef, forwardRef, useImperativeHandle, useEffect } from "react"

type UserInfoFormProps = {
  selectedAction: string
  resetChat: () => void
}

export type UserInfoFormHandle = {
  getValues: () => {
    firstName: string
    lastName: string
    email: string
  }
}

const UserInfoForm = forwardRef<UserInfoFormHandle, UserInfoFormProps>(({ selectedAction, resetChat }, ref) => {
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const actionSelectRef = useRef<HTMLInputElement>(null)

  // Update the hidden input when selectedAction changes
  useEffect(() => {
    if (actionSelectRef.current) {
      actionSelectRef.current.value = selectedAction
    }
  }, [selectedAction])

  // Expose the form values to the parent component
  useImperativeHandle(ref, () => ({
    getValues: () => ({
      firstName: firstNameRef.current?.value.trim() || "",
      lastName: lastNameRef.current?.value.trim() || "",
      email: emailRef.current?.value.trim() || "",
    }),
  }))

  // Helper function to display action name
  const getActionDisplayName = (action: string): string => {
    const actionDisplayNames: { [key: string]: string } = {
      new_booking: "New Booking",
      change_booking: "Change Existing Booking",
      cancel_booking: "Cancel Booking",
      list_bookings: "List Bookings",
      list_outstanding: "Outstanding Invoices",
    }
    return actionDisplayNames[action] || action
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#E75837] text-white py-3 px-4 rounded-t-lg">
        <h2 className="text-xl font-medium header-font">Tell us about you</h2>
      </div>
      <div className="bg-white rounded-b-lg p-6 shadow-sm flex-1 flex flex-col">
        <p className="text-gray-700 mb-4 body-font">
          Let's start by telling us a little bit about yourself, with first/last name and/or email. This lets Critter
          match you to the services providers you already work with.
        </p>

        <div className="space-y-4 flex-1">
          <div>
            <input
              type="email"
              ref={emailRef}
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
            />
          </div>
          <div>
            <input
              type="text"
              ref={firstNameRef}
              placeholder="First Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
            />
          </div>
          <div>
            <input
              type="text"
              ref={lastNameRef}
              placeholder="Last Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
            />
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
              Please select an action from the chat options on the right
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
})

UserInfoForm.displayName = "UserInfoForm"

export default UserInfoForm
