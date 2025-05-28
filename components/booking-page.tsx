"use client"
import { useState, useRef } from "react"
import UserInfoForm, { type UserInfoFormHandle } from "./user-info-form"
import ChatInterface from "./chat-interface"
import DynamicSelectionPanel from "./dynamic-selection-panel"
import DateTimePanel from "./date-time-panel"
import { formatMessage } from "../utils/message-formatter"
import type { BookingInfo } from "./booking-calendar"
import type { Message, SelectionOption, SelectionType, StructuredMessage } from "../types/booking"

// Define actions that should never show selection bubbles
const NO_BUBBLES_ACTIONS = ["list_bookings", "list_outstanding"]

// Update the prop type definition
type BookingPageProps = {
  onStartOnboarding?: (sessionId: string | null, userId: string | null) => void
}

export default function BookingPage({ onStartOnboarding }: BookingPageProps) {
  // State for messages and UI
  const [statusColor, setStatusColor] = useState("#E75837")
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Let's get you started! First thing's first, share some details to the left so can match you to the right businesses on Critter.",
      isUser: false,
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [showActionBubbles, setShowActionBubbles] = useState(true)

  // State for form validation
  const [isFormValid, setIsFormValid] = useState(false)

  // State for selection panel
  const [selectionType, setSelectionType] = useState<SelectionType>(null)
  const [selectionOptions, setSelectionOptions] = useState<SelectionOption[]>([])
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [showSelectionPanel, setShowSelectionPanel] = useState(false)
  const [allowMultipleSelection, setAllowMultipleSelection] = useState(false)
  const [selectedMainService, setSelectedMainService] = useState<string | null>(null)

  // State for date/time panel
  const [showDateTimePanel, setShowDateTimePanel] = useState(false)

  // State for UI status
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [statusText, setStatusText] = useState("Ready to assist you")
  const [selectedAction, setSelectedAction] = useState<string>("")
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [showCalendar, setShowCalendar] = useState(false)

  // Refs
  const USER_ID = useRef(`web_user_${Math.random().toString(36).substring(2, 10)}`)
  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook-test/216e36c3-4fe2-4f2e-80c3-d9ce6524f445"
  const userInfoFormRef = useRef<UserInfoFormHandle>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  // Handle validation changes from UserInfoForm
  const handleValidationChange = (isValid: boolean) => {
    setIsFormValid(isValid)
  }

  // Reset the chat to its initial state
  const resetChat = () => {
    setSelectedAction("")
    setShowActionBubbles(true)
    setShowSelectionPanel(false)
    setShowDateTimePanel(false)
    setSelectionOptions([])
    setSelectedOptions([])
    setSelectedMainService(null)
    setSelectionType(null)
    setMessages([
      {
        text: "Let's get you started! First thing's first, share some details to the left so can match you to the right businesses on Critter.",
        isUser: false,
      },
    ])
    setInputValue("")
    updateStatus("Ready to assist you", "#E75837")
    console.log("Chat reset by user")
  }

  // Update the getUserInfo function to get values from the UserInfoForm component
  const getUserInfo = (actionOverride?: string) => {
    const formValues = userInfoFormRef.current?.getValues() || { firstName: "", lastName: "", email: "" }
    return {
      ...formValues,
      selectedAction: actionOverride || selectedAction,
    }
  }

  const updateStatus = (text: string, color: string) => {
    setStatusText(text)
    setStatusColor(color)
  }

  const handleActionBubbleClick = (action: string) => {
    if (!isFormValid) return

    console.log(`Action bubble clicked: "${action}"`)

    const actionMessages: { [key: string]: string } = {
      new_booking: "I'd like to make a new booking",
      change_booking: "I need to change my existing booking",
      cancel_booking: "I want to cancel my booking",
      list_bookings: "Show me my existing bookings",
      list_outstanding: "What are my outstanding invoices?",
    }

    const messageText = actionMessages[action]
    console.log(`Setting selectedAction to: "${action}"`)

    // Update the state
    setSelectedAction(action)
    setShowActionBubbles(false)

    // Send the message with the action explicitly passed
    sendMessage(messageText, action)
  }

  // Function to handle selection bubble clicks
  const handleSelectionClick = (option: SelectionOption) => {
    if (!isFormValid) return

    console.log("Selection clicked:", {
      option,
      selectionType,
      optionName: option.name,
      optionNameType: typeof option.name,
      fullOption: JSON.stringify(option),
    })

    if (selectionType === "service") {
      if (option.category === "Add-On") {
        setSelectedOptions((prev) => {
          const optionName = option.name
          console.log("Add-on toggle:", {
            optionName,
            optionNameType: typeof optionName,
            prev,
            prevTypes: prev.map((item) => typeof item),
          })

          if (prev.includes(optionName)) {
            return prev.filter((item) => item !== optionName)
          } else {
            return [...prev, optionName]
          }
        })

        setSelectionOptions((prev) =>
          prev.map((opt) => (opt.name === option.name ? { ...opt, selected: !opt.selected } : opt)),
        )
      } else {
        // Main service selection
        console.log("Main service selected:", {
          optionName: option.name,
          optionNameType: typeof option.name,
          fullOption: JSON.stringify(option),
        })
        setSelectionOptions((prev) =>
          prev.map((opt) => (opt.category !== "Add-On" ? { ...opt, selected: opt.name === option.name } : opt)),
        )
        setSelectedMainService(option.name)
      }
    } else if (allowMultipleSelection) {
      setSelectedOptions((prev) => {
        const optionName = option.name
        console.log("Multiple selection toggle:", {
          optionName,
          optionNameType: typeof optionName,
          prev,
          prevTypes: prev.map((item) => typeof item),
        })

        if (prev.includes(optionName)) {
          return prev.filter((item) => item !== optionName)
        } else {
          return [...prev, optionName]
        }
      })

      setSelectionOptions((prev) =>
        prev.map((opt) => (opt.name === option.name ? { ...opt, selected: !opt.selected } : opt)),
      )
    } else {
      console.log("Single selection:", {
        optionName: option.name,
        optionNameType: typeof option.name,
      })
      setSelectedOptions([option.name])
      setSelectionOptions((prev) => prev.map((opt) => ({ ...opt, selected: opt.name === option.name })))

      if (selectionType === "professional") {
        submitSelections(option.name)
      }
    }
  }

  // Function to submit the selected options
  const submitSelections = (directOption?: string) => {
    if (!isFormValid) return

    console.log("=== SUBMIT SELECTIONS DEBUG ===")
    console.log("directOption:", directOption, typeof directOption)
    console.log("selectedMainService:", selectedMainService, typeof selectedMainService)
    console.log(
      "selectedOptions:",
      selectedOptions,
      selectedOptions.map((opt) => typeof opt),
    )
    console.log("selectionType:", selectionType)

    let options: string[] = []

    if (directOption) {
      options = [directOption]
    } else if (selectionType === "service") {
      const mainService = selectedMainService
      const addOns = selectedOptions

      console.log("Service selection debug:", {
        mainService,
        mainServiceType: typeof mainService,
        addOns,
        addOnsTypes: addOns.map((addon) => typeof addon),
        selectedOptions,
      })

      if (!mainService) {
        console.log("No main service selected, cannot submit")
        return
      }

      // Ensure we're working with strings and log the conversion
      const mainServiceStr = typeof mainService === "string" ? mainService : String(mainService)
      const addOnStrs = addOns.map((addon, index) => {
        const converted = typeof addon === "string" ? addon : String(addon)
        console.log(`Add-on ${index}:`, addon, typeof addon, "->", converted)
        return converted
      })

      console.log("Converted values:", { mainServiceStr, addOnStrs })
      options = [mainServiceStr, ...addOnStrs]
    } else {
      // Ensure all selected options are strings
      options = selectedOptions.map((option, index) => {
        const converted = typeof option === "string" ? option : String(option)
        console.log(`Option ${index}:`, option, typeof option, "->", converted)
        return converted
      })
    }

    console.log(
      "Final options array:",
      options,
      options.map((opt) => typeof opt),
    )

    if (options.length === 0) {
      console.log("No options selected, cannot submit")
      return
    }

    let messageText = ""

    if (selectionType === "professional") {
      messageText = options.join(", ")
    } else if (selectionType === "service") {
      messageText = options.join(", ")
    } else if (selectionType === "pet") {
      messageText = options.join(", ")
    } else if (selectionType === "confirmation") {
      messageText =
        options[0] === "Yes, proceed" ? "Yes, I'd like to proceed with the booking." : "No, I need to make changes."
    }

    console.log("Final message text:", messageText, typeof messageText)
    console.log("=== END SUBMIT SELECTIONS DEBUG ===")

    console.log("About to send message:", messageText, typeof messageText)
    console.log("Message length:", messageText.length)
    console.log("Message JSON:", JSON.stringify(messageText))

    // Clear the selection panel state
    setShowSelectionPanel(false)
    setSelectionOptions([])
    setSelectedOptions([])
    setSelectedMainService(null)
    setSelectionType(null)

    // Send the message
    sendMessage(messageText)
  }

  // Function to try parsing JSON from a message
  const tryParseJSON = (message: string): StructuredMessage | null => {
    try {
      let jsonData = JSON.parse(message)

      if (jsonData.type && typeof jsonData.type === "string") {
        console.log("Successfully parsed structured data:", jsonData.type, jsonData)
        return jsonData as StructuredMessage
      }

      const jsonMatch = message.match(/\{[\s\S]*"type"[\s\S]*\}/m)
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0])
        if (jsonData.type && typeof jsonData.type === "string") {
          console.log("Successfully parsed embedded structured data:", jsonData.type, jsonData)
          return jsonData as StructuredMessage
        }
      }

      return null
    } catch (error) {
      console.log("Failed to parse JSON from message:", error)
      return null
    }
  }

  // Function to detect selection type from message
  const detectSelectionType = (
    message: string,
  ): {
    type: SelectionType
    options: SelectionOption[]
    allowMultiple: boolean
  } => {
    console.log("Analyzing message for selection type:", message)
    console.log("Current selected action:", selectedAction)

    if (NO_BUBBLES_ACTIONS.includes(selectedAction)) {
      console.log(`Action ${selectedAction} is in NO_BUBBLES_ACTIONS list, skipping all selection bubbles`)
      return { type: null, options: [], allowMultiple: false }
    }

    if (message.includes("has been successfully submitted") || message.includes("confirmation email has been sent")) {
      console.log("Detected confirmation message, skipping selection bubbles")
      return { type: null, options: [], allowMultiple: false }
    }

    const structuredData = tryParseJSON(message)

    if (structuredData) {
      console.log("Detected structured data with type:", structuredData.type)

      if (structuredData.type === "text_only") {
        console.log("Message type is text_only, skipping selection bubbles")
        return { type: null, options: [], allowMultiple: false }
      }

      // Add this new condition to handle text_with_list format for pets
      if (
        structuredData.type === "text_with_list" &&
        structuredData.intro &&
        structuredData.intro.toLowerCase().includes("which pet") &&
        Array.isArray(structuredData.items)
      ) {
        console.log("Detected pet list in text_with_list format")
        const options: SelectionOption[] = structuredData.items.map((item: any) => ({
          name: item.title,
          description: item.content,
          selected: false,
        }))
        return { type: "pet", options, allowMultiple: true }
      }

      // Handle different structured data types
      if (structuredData.type === "service_list" && Array.isArray(structuredData.items)) {
        const options: SelectionOption[] = structuredData.items.map((item: any) => {
          // More conservative add-on detection
          let category = item.category || "Main Service"

          // Only categorize as add-on if it's very explicitly an add-on
          const serviceName = item.name.toLowerCase()
          if (
            // Original category contains "add" (but be more specific)
            (category.toLowerCase().includes("add") &&
              (category.toLowerCase().includes("on") || category.toLowerCase().includes("-on"))) ||
            // Service name explicitly contains add-on patterns
            serviceName.includes(": add") ||
            serviceName.includes("add on") ||
            serviceName.includes("add-on") ||
            // Very specific add-on keywords in the name
            (serviceName.includes("transportation") && serviceName.includes("add")) ||
            (serviceName.includes("multiple") && serviceName.includes("add"))
          ) {
            category = "Add-On"
          } else {
            // Default to Main Service for everything else
            category = "Main Service"
          }

          return {
            name: item.name,
            category: category,
            details: item.details || [],
            selected: false,
          }
        })
        return { type: "service", options, allowMultiple: true }
      }

      if (structuredData.type === "professional_list" && Array.isArray(structuredData.items)) {
        const options: SelectionOption[] = structuredData.items.map((item: any) => ({
          name: item.name,
          description: item.email,
          details: item.details,
          selected: false,
        }))
        return { type: "professional", options, allowMultiple: false }
      }

      if (structuredData.type === "pet_list" && Array.isArray(structuredData.items)) {
        const options: SelectionOption[] = structuredData.items.map((item: any) => ({
          name: item.name,
          description: item.type,
          selected: false,
        }))
        return { type: "pet", options, allowMultiple: true }
      }

      if (structuredData.type === "confirmation") {
        return {
          type: "confirmation",
          options: [
            { name: "Yes, proceed", selected: false },
            { name: "No, I need to make changes", selected: false },
          ],
          allowMultiple: false,
        }
      }
    }

    // Fallback: detect service requests even in text_only messages
    if (
      structuredData &&
      structuredData.type === "text_only" &&
      structuredData.intro &&
      (structuredData.intro.toLowerCase().includes("which service") ||
        structuredData.intro.toLowerCase().includes("specify which service") ||
        structuredData.intro.toLowerCase().includes("list of services"))
    ) {
      console.log("Detected service request in text_only message, but no services provided")
      // For now, we'll skip showing the panel since we don't have service data
      // This indicates the webhook should be returning service_list type instead
      return { type: null, options: [], allowMultiple: false }
    }

    // Add text-based detection for pet selection
    if (
      message.toLowerCase().includes("which pet") ||
      message.toLowerCase().includes("confirm which pet") ||
      message.toLowerCase().includes("pet's name or names")
    ) {
      console.log("Detected pet selection request in text")

      // Try to extract pet names and types from the message
      const petOptions: SelectionOption[] = []

      // Look for patterns like "Name: Type" or "Name (Type)"
      const petPattern1 = /\*\*([^*]+)\*\*:\s*([^,\n]+)/g
      const petPattern2 = /\b([A-Z][a-z]+)\s*:\s*([A-Z][a-z]+)/g
      const petPattern3 = /\b([A-Z][a-z]+)\s*$$([A-Z][a-z]+)$$/g

      let match

      // Try the first pattern (with bold formatting)
      while ((match = petPattern1.exec(message)) !== null) {
        petOptions.push({
          name: match[1].trim(),
          description: match[2].trim(),
          selected: false,
        })
      }

      // If no matches, try the second pattern
      if (petOptions.length === 0) {
        while ((match = petPattern2.exec(message)) !== null) {
          petOptions.push({
            name: match[1].trim(),
            description: match[2].trim(),
            selected: false,
          })
        }
      }

      // If still no matches, try the third pattern
      if (petOptions.length === 0) {
        while ((match = petPattern3.exec(message)) !== null) {
          petOptions.push({
            name: match[1].trim(),
            description: match[2].trim(),
            selected: false,
          })
        }
      }

      if (petOptions.length > 0) {
        return { type: "pet", options: petOptions, allowMultiple: true }
      }
    }

    // For simplicity, we're returning a default value
    console.log("No selection options detected")
    return { type: null, options: [], allowMultiple: false }
  }

  // Function to detect if we should show the date/time panel
  const shouldShowDateTimePanel = (message: string): boolean => {
    console.log("Checking if date/time panel should show for message:", message)

    try {
      const jsonData = JSON.parse(message)
      if (jsonData.type === "text_only") {
        const fullText = [jsonData.intro || "", jsonData.footer || ""].join(" ").toLowerCase()
        const hasDateTimeKeywords =
          (fullText.includes("date") || fullText.includes("when")) &&
          (fullText.includes("time") || fullText.includes("schedule"))
        const isSchedulingRequest =
          fullText.includes("provide") ||
          fullText.includes("when would you like") ||
          fullText.includes("when you'd like") ||
          fullText.includes("schedule") ||
          fullText.includes("booking")
        return hasDateTimeKeywords && isSchedulingRequest
      }
      if (jsonData.type) {
        return false
      }
    } catch (error) {
      console.log("Message is not valid JSON, analyzing as text")
    }

    const lowerMessage = message.toLowerCase()
    const schedulingPhrases = [
      "when would you like to schedule",
      "when you'd like to schedule",
      "what date and time",
      "what time would you like",
      "please provide a date",
      "provide the date",
      "provide date",
      "when do you want this service",
      "when should we schedule",
      "preferred date and time",
      "what day works for you",
      "schedule these services",
      "schedule this service",
      "date, time, and your timezone",
    ]
    const containsSchedulingPhrase = schedulingPhrases.some((phrase) => lowerMessage.includes(phrase))
    const hasDateTimeKeywords =
      (lowerMessage.includes("date") || lowerMessage.includes("when")) &&
      (lowerMessage.includes("time") || lowerMessage.includes("schedule"))
    return containsSchedulingPhrase || (hasDateTimeKeywords && lowerMessage.includes("provide"))
  }

  // Function to handle date/time panel submission
  const handleDateTimeSubmit = (bookingInfo: BookingInfo) => {
    // Format the date correctly to avoid timezone issues
    const dateObj = bookingInfo.date
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() + 1 // getMonth() is zero-based
    const day = dateObj.getDate()
    const formattedDate = `${month}/${day}/${year}`

    const time = bookingInfo.time
    const formattedTime = time.split(":").map(Number)
    const hours = formattedTime[0]
    const minutes = formattedTime[1]
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    const timeString = `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`

    // Format the timezone for display (replace underscores with spaces)
    const displayTimezone = bookingInfo.timezone.replace(/_/g, " ")

    let messageText = `Date: ${formattedDate}, Time: ${timeString}, Timezone: ${displayTimezone}`

    if (bookingInfo.isRecurring && bookingInfo.recurringFrequency) {
      messageText += `, Recurring: ${bookingInfo.recurringFrequency}`
      if (bookingInfo.recurringEndDate) {
        // Format recurring end date the same way to avoid timezone issues
        const endDateObj = bookingInfo.recurringEndDate
        const endYear = endDateObj.getFullYear()
        const endMonth = endDateObj.getMonth() + 1
        const endDay = endDateObj.getDate()
        const formattedEndDate = `${endMonth}/${endDay}/${endYear}`
        messageText += `, Ends on: ${formattedEndDate}`
      }
    }

    if (bookingInfo.isMultiDay && bookingInfo.endDate) {
      // Format multi-day end date the same way
      const endDateObj = bookingInfo.endDate
      const endYear = endDateObj.getFullYear()
      const endMonth = endDateObj.getMonth() + 1
      const endDay = endDateObj.getDate()
      const formattedEndDate = `${endMonth}/${endDay}/${endYear}`
      messageText += `, Multi-day booking ending on: ${formattedEndDate}`
    }

    setShowDateTimePanel(false)
    sendMessage(messageText)
  }

  // Function to handle calendar submission (legacy)
  const handleCalendarSubmit = (bookingInfo: BookingInfo) => {
    handleDateTimeSubmit(bookingInfo)
  }

  const sendMessage = async (messageText?: string, actionOverride?: string) => {
    if (!isFormValid) return

    // Ensure we always have a string message
    let message = ""

    if (typeof messageText === "string") {
      message = messageText.trim()
    } else if (messageText) {
      // If messageText is an object, convert it to string
      console.log("Warning: messageText is not a string:", messageText, typeof messageText)
      message = String(messageText).trim()
    } else {
      message = inputValue.trim()
    }

    if (!message) {
      console.log("No message to send")
      return
    }

    console.log("Final message being sent:", message, typeof message)

    setShowActionBubbles(false)
    console.log("Sending message", { message })

    setMessages((prev) => {
      const newMessages = [...prev, { text: message, isUser: true }]
      console.log("Updated messages array", { messageCount: newMessages.length })
      return newMessages
    })

    setInputValue("")
    setIsTyping(true)
    updateStatus("Thinking...", "#745E25")

    try {
      // Get user info from the form, with optional action override
      const userInfo = getUserInfo(actionOverride)
      console.log("Sending user info with action:", userInfo)

      const payload = {
        message: {
          text: message,
          userId: USER_ID.current,
          timestamp: new Date().toISOString(),
          userInfo: userInfo,
        },
      } as any

      if (sessionId) {
        payload.message.sessionId = sessionId
      }
      if (conversationId) {
        payload.message.conversationId = conversationId
      }

      console.log("Sending message to webhook with payload:", payload)
      updateStatus("Connecting...", "#94ABD6")

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received response", data)

      setIsTyping(false)
      updateStatus("Ready to assist you", "#E75837")

      if (data.message) {
        const formattedMessage = formatMessage(data.message, data.htmlMessage)

        setMessages((prev) => [
          ...prev,
          {
            text: formattedMessage.text,
            isUser: false,
            htmlMessage: formattedMessage.html,
          },
        ])

        // Check if we should show the date/time panel instead of calendar
        if (shouldShowDateTimePanel(data.message)) {
          console.log("Showing date/time panel for scheduling")
          setShowDateTimePanel(true)
          return
        }

        console.log(`Before bubble check - selectedAction: "${selectedAction}"`)
        console.log(`NO_BUBBLES_ACTIONS includes selectedAction: ${NO_BUBBLES_ACTIONS.includes(selectedAction)}`)

        const currentAction = actionOverride || selectedAction
        console.log(`Current action: "${currentAction}"`)

        if (NO_BUBBLES_ACTIONS.includes(currentAction)) {
          console.log(`Action ${currentAction} is in NO_BUBBLES_ACTIONS list, skipping all selection bubbles`)
          setShowSelectionPanel(false)
        } else {
          const { type, options, allowMultiple } = detectSelectionType(data.message)
          console.log("Selection detection in sendMessage:", { type, options, allowMultiple })

          if (type && options.length > 0) {
            console.log("Showing selection panel for:", type, options)
            setSelectionType(type)
            setSelectionOptions(options)
            setSelectedOptions([])
            setSelectedMainService(null)
            setAllowMultipleSelection(allowMultiple)
            setShowSelectionPanel(true)
          } else {
            console.log("No selection options detected, hiding panel")
            setShowSelectionPanel(false)
          }
        }
      } else {
        setMessages((prev) => [...prev, { text: JSON.stringify(data), isUser: false }])
      }

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId)
        console.log("Set initial sessionId", data.sessionId)
      }

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId)
        console.log("Set initial conversationId", data.conversationId)
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      console.log("Error", error.message)

      setIsTyping(false)
      updateStatus("Connection error", "#3F001D")

      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error processing your request. Please try again later.",
          isUser: false,
        },
      ])
    }
  }

  // Determine which panel to show in the middle column
  const getMiddlePanel = () => {
    if (showDateTimePanel) {
      return (
        <DateTimePanel
          isVisible={showDateTimePanel}
          isFormValid={isFormValid}
          onSubmit={handleDateTimeSubmit}
          onClose={() => setShowDateTimePanel(false)}
          onSkip={() => {
            setShowDateTimePanel(false)
            sendMessage("I don't need a calendar")
          }}
        />
      )
    } else if (showSelectionPanel) {
      return (
        <DynamicSelectionPanel
          isVisible={showSelectionPanel}
          selectionType={selectionType}
          selectionOptions={selectionOptions}
          allowMultipleSelection={allowMultipleSelection}
          selectedMainService={selectedMainService}
          selectedOptions={selectedOptions}
          isFormValid={isFormValid}
          onSelectionClick={handleSelectionClick}
          onSubmit={submitSelections}
          onClose={() => setShowSelectionPanel(false)}
        />
      )
    }
    return null
  }

  const showMiddlePanel = showSelectionPanel || showDateTimePanel

  return (
    <div className="max-h-[calc(100vh-350px)]">
      {/* Three-column layout: User Info → Selection/DateTime Panel → Chat */}
      <div className="grid gap-4 h-full" style={{ gridTemplateColumns: showMiddlePanel ? "1fr 1fr 1fr" : "1fr 2fr" }}>
        {/* Left Column - User Info (Always visible) */}
        <div className="h-full flex flex-col">
          <UserInfoForm
            ref={userInfoFormRef}
            selectedAction={selectedAction}
            resetChat={resetChat}
            onValidationChange={handleValidationChange}
          />
        </div>

        {/* Middle Column - Selection/DateTime Panel (Conditional) */}
        {showMiddlePanel && <div className="h-full flex flex-col">{getMiddlePanel()}</div>}

        {/* Right Column - Chat (Always visible) */}
        <div className="h-full flex flex-col">
          <ChatInterface
            messages={messages}
            isTyping={isTyping}
            showActionBubbles={showActionBubbles}
            showSelectionBubbles={false} // We're not using the embedded selection bubbles anymore
            selectionType={null}
            selectionOptions={[]}
            allowMultipleSelection={false}
            selectedMainService={null}
            selectedOptions={[]}
            showCalendar={showCalendar}
            inputValue={inputValue}
            isFormValid={isFormValid}
            onInputChange={setInputValue}
            onSendMessage={() => sendMessage()}
            onActionSelect={handleActionBubbleClick}
            onSelectionClick={() => {}}
            onSelectionSubmit={() => {}}
            onCalendarSubmit={handleCalendarSubmit}
            onCalendarCancel={() => setShowCalendar(false)}
          />
        </div>
      </div>
    </div>
  )
}
