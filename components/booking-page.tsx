"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { RefreshCw, Check, Send } from "lucide-react"

// Add the import for the BookingCalendar component at the top of the file
import BookingCalendar, { type BookingInfo } from "./booking-calendar"

// Define types for our selection options
type SelectionOption = {
  name: string
  description?: string
  details?: string[]
  selected?: boolean
  category?: string
}

type SelectionType = "professional" | "service" | "pet" | "confirmation" | null

// Define types for the structured data we might receive
type ServiceItem = {
  name: string
  category: string
  details: string[]
}

type ProfessionalItem = {
  name: string
  email?: string
  details?: string[]
}

type PetItem = {
  name: string
  type: string
}

// Add a new type for list items
type ListItem = {
  title: string
  content: string
}

type StructuredMessage = {
  type: string
  intro?: string
  items?: ServiceItem[] | ProfessionalItem[] | PetItem[] | ListItem[]
  footer?: string
  text?: string
}

// Define actions that should never show selection bubbles
// Make sure these match EXACTLY what's being set in handleActionBubbleClick
const NO_BUBBLES_ACTIONS = ["list_bookings", "list_outstanding"]

export default function BookingPage() {
  // Simple message formatter function to handle HTML messages
  const formatMessage = (message: string, htmlMessage?: string): { text: string; html: string } => {
    // If we already have an HTML message from the backend, use it directly
    if (htmlMessage) {
      return {
        text: removeMarkdown(message), // Provide plain text for accessibility
        html: htmlMessage,
      }
    }

    // Create a clean text version without markdown
    const cleanText = removeMarkdown(message)

    // For other messages, just convert markdown to HTML
    return {
      text: cleanText,
      html: markdownToHtml(message),
    }
  }

  // Function to convert markdown to HTML
  const markdownToHtml = (text: string): string => {
    // Convert bold markdown (**text**) to HTML <strong> tags
    let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Convert newlines to <br> tags
    html = html.replace(/\n/g, "<br>")

    return html
  }

  // Function to remove markdown formatting from text
  const removeMarkdown = (text: string): string => {
    // Remove bold markdown (**text**)
    return text.replace(/\*\*(.*?)\*\*/g, "$1")
  }

  // Update the status colors to match the new primary color
  const [statusColor, setStatusColor] = useState("#E75837") // Updated to Orange (primary)
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; htmlMessage?: string }>>([
    {
      text: "Let's get you started! First thing's first, share some details to the left so can match you to the right businesses on Critter.",
      isUser: false,
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [showActionBubbles, setShowActionBubbles] = useState(true)

  // New state for selection bubbles
  const [selectionType, setSelectionType] = useState<SelectionType>(null)
  const [selectionOptions, setSelectionOptions] = useState<SelectionOption[]>([])
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [showSelectionBubbles, setShowSelectionBubbles] = useState(false)
  const [allowMultipleSelection, setAllowMultipleSelection] = useState(false)
  const [selectedMainService, setSelectedMainService] = useState<string | null>(null)

  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [statusText, setStatusText] = useState("Ready to assist you")
  const [selectedAction, setSelectedAction] = useState<string>("")
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Add debug state to track action values
  const [debugInfo, setDebugInfo] = useState<string>("")

  const USER_ID = useRef(`web_user_${Math.random().toString(36).substring(2, 10)}`)
  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook-test/93c29983-1098-4ff9-a3c5-eae58e04fbab"

  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const actionSelectRef = useRef<HTMLInputElement>(null)

  // Add a new state for showing the calendar widget
  const [showCalendar, setShowCalendar] = useState(false)

  // Helper function to check if the current action should show bubbles
  const shouldShowBubbles = () => {
    const result = !NO_BUBBLES_ACTIONS.includes(selectedAction)
    console.log(`shouldShowBubbles check: action=${selectedAction}, result=${result}`)
    // Update debug info
    setDebugInfo(`Action: "${selectedAction}", Should show bubbles: ${result}`)
    return result
  }

  useEffect(() => {
    // Focus on first name input if empty
    if (firstNameRef.current && !firstNameRef.current.value) {
      firstNameRef.current.focus()
    }
  }, [])

  // Add a function to check if the user is at the bottom of the chat
  const checkIfAtBottom = () => {
    if (chatMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
      setIsAtBottom(isAtBottom)
    }
  }

  // Add an event listener to track scrolling
  useEffect(() => {
    const chatContainer = chatMessagesRef.current
    if (chatContainer) {
      chatContainer.addEventListener("scroll", checkIfAtBottom)
      return () => chatContainer.removeEventListener("scroll", checkIfAtBottom)
    }
  }, [])

  // Modify the scroll behavior when messages change
  useEffect(() => {
    // Only auto-scroll if the user was already at the bottom
    if (chatMessagesRef.current && isAtBottom) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages, isTyping, isAtBottom, showSelectionBubbles])

  // Add effect to log selectedAction changes
  useEffect(() => {
    console.log("selectedAction changed:", selectedAction)
    // Check if this action should show bubbles
    const shouldShow = !NO_BUBBLES_ACTIONS.includes(selectedAction)
    console.log(`Action ${selectedAction} should show bubbles: ${shouldShow}`)
  }, [selectedAction])

  // Reset the chat to its initial state
  const resetChat = () => {
    // Reset the selected action
    setSelectedAction("")
    if (actionSelectRef.current) {
      actionSelectRef.current.value = ""
    }

    // Show the action bubbles again
    setShowActionBubbles(true)

    // Reset selection bubbles
    setShowSelectionBubbles(false)
    setSelectionOptions([])
    setSelectedOptions([])
    setSelectedMainService(null)
    setSelectionType(null)

    // Reset the messages to just the welcome message
    setMessages([
      {
        text: "Let's get you started! First thing's first, share some details to the left so can match you to the right businesses on Critter.",
        isUser: false,
      },
    ])

    // Reset the input value
    setInputValue("")

    // Reset the status
    updateStatus("Ready to assist you", "#E75837")

    // Log the reset
    console.log("Chat reset by user")

    // Note: We're keeping the user's personal information (name, email)
    // and the user ID to maintain some continuity
  }

  // Update the getUserInfo function to include the selected action
  const getUserInfo = () => {
    return {
      firstName: firstNameRef.current?.value.trim() || "",
      lastName: lastNameRef.current?.value.trim() || "",
      email: emailRef.current?.value.trim() || "",
      selectedAction: selectedAction || actionSelectRef.current?.value || "",
    }
  }

  const updateStatus = (text: string, color: string) => {
    setStatusText(text)
    setStatusColor(color)
  }

  const handleActionBubbleClick = (action: string) => {
    // Get the message text for the selected action
    const actionMessages: { [key: string]: string } = {
      new_booking: "I'd like to make a new booking",
      change_booking: "I need to change my existing booking",
      cancel_booking: "I want to cancel my booking",
      list_bookings: "Show me my existing bookings",
      list_outstanding: "What are my outstanding invoices?",
    }

    const messageText = actionMessages[action]

    // Set the selected action
    console.log(`Setting selectedAction to: "${action}"`)
    setSelectedAction(action)

    // Update the hidden input value
    if (actionSelectRef.current) {
      actionSelectRef.current.value = action
      console.log(`Updated actionSelectRef.current.value to: "${action}"`)
    }

    // Hide the action bubbles after selection
    setShowActionBubbles(false)

    // Send the message
    sendMessage(messageText)
  }

  // Function to handle selection bubble clicks
  const handleSelectionBubbleClick = (option: SelectionOption) => {
    if (selectionType === "service") {
      // For services, handle differently based on category
      if (option.category === "Add-On") {
        // For add-ons, toggle selection
        setSelectedOptions((prev) => {
          if (prev.includes(option.name)) {
            return prev.filter((item) => item !== option.name)
          } else {
            return [...prev, option.name]
          }
        })

        // Update the selection options to show which ones are selected
        setSelectionOptions((prev) =>
          prev.map((opt) => (opt.name === option.name ? { ...opt, selected: !opt.selected } : opt)),
        )
      } else {
        // For main services, only allow one selection
        // Deselect any previously selected main service
        setSelectionOptions((prev) =>
          prev.map((opt) => (opt.category !== "Add-On" ? { ...opt, selected: opt.name === option.name } : opt)),
        )

        // Update the selected main service
        setSelectedMainService(option.name)
      }
    } else if (allowMultipleSelection) {
      // For multi-select (like pets), toggle the selection
      setSelectedOptions((prev) => {
        if (prev.includes(option.name)) {
          return prev.filter((item) => item !== option.name)
        } else {
          return [...prev, option.name]
        }
      })

      // Update the selection options to show which ones are selected
      setSelectionOptions((prev) =>
        prev.map((opt) => (opt.name === option.name ? { ...opt, selected: !opt.selected } : opt)),
      )
    } else {
      // For single select (like professionals), just select the option
      setSelectedOptions([option.name])

      // Update the selection options to show which one is selected
      setSelectionOptions((prev) => prev.map((opt) => ({ ...opt, selected: opt.name === option.name })))

      // Auto-submit for professionals only
      if (selectionType === "professional") {
        submitSelections(option.name)
      }
    }
  }

  // Function to submit the selected options
  const submitSelections = (directOption?: string) => {
    let options: string[] = []

    if (directOption) {
      options = [directOption]
    } else if (selectionType === "service") {
      // For services, combine the main service and add-ons
      const mainService = selectedMainService
      const addOns = selectedOptions

      if (!mainService) {
        // If no main service is selected, don't submit
        return
      }

      options = [mainService, ...addOns]
    } else {
      options = selectedOptions
    }

    if (options.length === 0) return

    // Format the message based on selection type
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

    // Hide the selection bubbles
    setShowSelectionBubbles(false)
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
      // First, check if the message is already a valid JSON
      let jsonData = JSON.parse(message)

      // If it has a type field, it might be our structured message
      if (jsonData.type && typeof jsonData.type === "string") {
        console.log("Successfully parsed structured data:", jsonData.type, jsonData)
        return jsonData as StructuredMessage
      }

      // If not, look for JSON within the message
      // This handles cases where the message might contain other text before/after the JSON
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
    // Log the current state for debugging
    console.log("Analyzing message for selection type:", message)
    console.log("Current selected action:", selectedAction)

    // FIRST AND FOREMOST: Check if the current action should never show bubbles
    // This check takes precedence over everything else
    if (NO_BUBBLES_ACTIONS.includes(selectedAction)) {
      console.log(`Action ${selectedAction} is in NO_BUBBLES_ACTIONS list, skipping all selection bubbles`)
      return { type: null, options: [], allowMultiple: false }
    }

    // Skip detection for booking confirmation messages
    if (message.includes("has been successfully submitted") || message.includes("confirmation email has been sent")) {
      console.log("Detected confirmation message, skipping selection bubbles")
      return { type: null, options: [], allowMultiple: false }
    }

    // First, try to parse structured JSON data
    const structuredData = tryParseJSON(message)

    if (structuredData) {
      console.log("Detected structured data with type:", structuredData.type)

      // If the type is text_only, don't show any selection bubbles
      if (structuredData.type === "text_only") {
        console.log("Message type is text_only, skipping selection bubbles")
        return { type: null, options: [], allowMultiple: false }
      }

      // Handle text_with_list type that contains pet options
      if (structuredData.type === "text_with_list" && Array.isArray(structuredData.items)) {
        console.log("Processing text_with_list items:", structuredData.items)

        // Check if this is a pet selection list (look for pet-related text)
        const isPetList =
          (structuredData.intro &&
            (structuredData.intro.toLowerCase().includes("which pet") ||
              structuredData.intro.toLowerCase().includes("confirm which pet") ||
              structuredData.intro.toLowerCase().includes("pet(s) you'd like") ||
              structuredData.intro.toLowerCase().includes("confirm if you want to proceed with") ||
              structuredData.intro.toLowerCase().includes("add any other pets"))) ||
          (structuredData.footer &&
            (structuredData.footer.toLowerCase().includes("specify the pet") ||
              structuredData.footer.toLowerCase().includes("pet(s) by name") ||
              structuredData.footer.toLowerCase().includes("confirm the pet") ||
              structuredData.footer.toLowerCase().includes("pets for this booking")))

        if (isPetList) {
          console.log("Detected pet list in text_with_list")
          const options: SelectionOption[] = structuredData.items.map((item: any) => {
            let petName = ""
            let petType = ""

            // Special case: If title is "Pet Name", use the content as the pet name
            if (item.title === "Pet Name") {
              petName = item.content
              console.log(`Extracted pet from "Pet Name" title: ${petName}`)
            }
            // Check if the content contains pet name and type in format "Name (Type)"
            else if (item.content.match(/([A-Za-z]+)\s*$$([A-Za-z]+)$$/)) {
              const contentMatch = item.content.match(/([A-Za-z]+)\s*$$([A-Za-z]+)$$/)
              petName = contentMatch[1]
              petType = contentMatch[2]
              console.log(`Extracted pet from content: ${petName} (${petType})`)
            }
            // If not found in content, try to extract from title
            else {
              petName = item.title
                .replace(/^\d+\.\s*/, "")
                .replace(/^[^a-zA-Z]+/, "")
                .replace(/^Pet option \d+/, "")
              petType = item.content

              // If title starts with "Pet option", it's not the actual pet name
              if (item.title.startsWith("Pet option")) {
                // Try to extract from content again with a different pattern
                const parts = item.content.split(/[(:]/)
                if (parts.length > 0) {
                  petName = parts[0].trim()
                  if (parts.length > 1) {
                    petType = parts[1].replace(/\)$/, "").trim()
                  }
                }
              }
            }

            return {
              name: petName,
              description: petType,
              selected: false,
            }
          })

          // Filter out any options with empty names
          const validOptions = options.filter((opt) => opt.name.length > 0)

          return {
            type: "pet",
            options: validOptions,
            allowMultiple: true,
          }
        }
      }

      // Handle different types of structured data
      if (structuredData.type === "service_list" && Array.isArray(structuredData.items)) {
        console.log("Processing service_list items:", structuredData.items)

        const options: SelectionOption[] = structuredData.items.map((item: any) => {
          // Ensure category is properly normalized
          let category = item.category || "Main Service"

          // Normalize "Add-On" category variations
          if (category.includes("Add") && category.includes("On")) {
            category = "Add-On"
          }

          console.log(`Service item: ${item.name}, Category: ${category}`)

          return {
            name: item.name,
            category: category,
            details: item.details || [],
            selected: false,
          }
        })

        // Log the processed options
        console.log("Processed service options:", options)

        return {
          type: "service",
          options,
          allowMultiple: true, // This ensures we can select multiple items (for add-ons)
        }
      }

      if (structuredData.type === "professional_list" && Array.isArray(structuredData.items)) {
        const options: SelectionOption[] = structuredData.items.map((item: any) => ({
          name: item.name,
          description: item.email,
          details: item.details,
          selected: false,
        }))

        return {
          type: "professional",
          options,
          allowMultiple: false,
        }
      }

      if (structuredData.type === "pet_list" && Array.isArray(structuredData.items)) {
        const options: SelectionOption[] = structuredData.items.map((item: any) => ({
          name: item.name,
          description: item.type,
          selected: false,
        }))

        return {
          type: "pet",
          options,
          allowMultiple: true,
        }
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

    // Convert to lowercase for case-insensitive matching
    const lowerMessage = message.toLowerCase()

    // Skip detection for open-ended questions about dates, times, etc.
    if (
      (message.includes("date") && message.includes("time")) ||
      message.includes("when would you like") ||
      message.includes("provide the date") ||
      message.includes("what time") ||
      message.includes("Looking forward to your details") ||
      (message.includes("Please provide") && !message.includes("Please provide the name of")) ||
      message.includes("recurring booking request")
    ) {
      console.log("Detected open-ended question, skipping selection bubbles")
      return { type: null, options: [], allowMultiple: false }
    }

    // Check for pet selection - this needs to come BEFORE confirmation check
    // to ensure "confirm which pet" is handled correctly
    if (
      lowerMessage.includes("which pet") ||
      lowerMessage.includes("confirm which pet") ||
      lowerMessage.includes("please confirm which pet") ||
      lowerMessage.includes("please specify the pet name") ||
      (lowerMessage.includes("pet") && lowerMessage.includes("booking request is for")) ||
      (lowerMessage.includes("pet") && lowerMessage.includes("this booking request is for"))
    ) {
      console.log("Detected pet selection request")
      // Extract pet options
      const options: SelectionOption[] = []

      // First try to extract structured data if it looks like JSON
      if (message.includes('"type":') || message.includes('"name":') || message.includes('"items":')) {
        // This might be a JSON-like response, try to extract pet names
        const nameMatches = message.match(/"name":\s*"([^"]+)"/g)
        const typeMatches = message.match(/"type":\s*"([^"]+)"/g)

        if (nameMatches && nameMatches.length > 0) {
          nameMatches.forEach((match, index) => {
            const name = match.replace(/"name":\s*"/, "").replace(/"/, "")

            // Try to get the corresponding pet type
            let petType = ""
            if (typeMatches && typeMatches[index]) {
              petType = typeMatches[index].replace(/"type":\s*"/, "").replace(/"/, "")
            }

            // Only add if it looks like a pet name (not JSON syntax)
            if (!name.includes("{") && !name.includes("}") && !name.includes("[") && !name.includes("]")) {
              options.push({
                name: name,
                description: petType,
                selected: false,
              })
            }
          })
        }
      }

      // If we couldn't extract from JSON, try the regular approach
      if (options.length === 0) {
        // Look for numbered list format (1.: Pet Name (Type))
        const numberedPetRegex = /\d+\.:\s*([A-Za-z]+)\s*$$([A-Za-z]+)$$/g
        let match

        while ((match = numberedPetRegex.exec(message)) !== null) {
          options.push({
            name: match[1],
            description: match[2],
            selected: false,
          })
        }

        // If no numbered format, try the standard format
        if (options.length === 0) {
          const petRegex = /([A-Za-z]+):\s*([A-Za-z]+)/g
          while ((match = petRegex.exec(message)) !== null) {
            options.push({
              name: match[1],
              description: match[2],
              selected: false,
            })
          }
        }
      }

      // Remove the hardcoded fallbacks section
      if (options.length === 0) {
        // Instead of hardcoded values, try to extract any pet-like names from the message
        const petNameMatches = message.match(/([A-Z][a-z]+)(?:\s*$$([A-Za-z]+)$$)?/g)
        if (petNameMatches) {
          petNameMatches.forEach((match) => {
            const nameParts = match.match(/([A-Z][a-z]+)(?:\s*$$([A-Za-z]+)$$)?/)
            if (nameParts && nameParts[1] && !options.some((opt) => opt.name === nameParts[1])) {
              options.push({
                name: nameParts[1],
                description: nameParts[2] || "",
                selected: false,
              })
            }
          })
        }
      }

      return {
        type: "pet",
        options,
        allowMultiple: true, // Allow multiple pet selection
      }
    }

    // Check for professional selection
    if (
      (message.includes("professionals available") ||
        message.includes("which professional") ||
        message.includes("Which professional") ||
        message.includes("Please confirm which professional") ||
        message.includes("Please specify the professional") ||
        message.includes("Which one would you like") ||
        message.includes("booking request with?") ||
        message.includes("professional would you like to adjust") ||
        message.includes("professional associated with your account") ||
        message.includes("found the following professional") ||
        message.includes("adjust a booking with") ||
        message.includes("cancel a booking with") ||
        message.includes("change a booking with")) &&
      // Make sure we're not in a booking confirmation message
      !message.includes("has been successfully submitted") &&
      !message.includes("confirmation email has been sent")
    ) {
      // Extract professional options
      const options: SelectionOption[] = []

      // First try to extract structured data if it looks like JSON
      if (message.includes('"type":') || message.includes('"name":') || message.includes('"items":')) {
        // This might be a JSON-like response, try to extract just the professional names
        const nameMatches = message.match(/"name":\s*"([^"]+)"/g)
        if (nameMatches && nameMatches.length > 0) {
          nameMatches.forEach((match) => {
            const name = match.replace(/"name":\s*"/, "").replace(/"/, "")
            // Add all extracted names without filtering for specific keywords
            if (name && !name.includes("{") && !name.includes("}") && !name.includes("[") && !name.includes("]")) {
              options.push({
                name: name,
                selected: false,
              })
            }
          })
        }
      }

      // If we couldn't extract from JSON or didn't find any options, try the regular approach
      if (options.length === 0) {
        // Try to extract from plain text format
        const lines = message.split("\n")
        let inProfessionalSection = false

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()

          // Skip empty lines
          if (!line) continue

          // Check if we're entering the professional section
          if (line.includes("professionals") || line.includes("Which one would you like")) {
            inProfessionalSection = true
            continue
          }

          // If we're in the professional section and find a line that looks like a professional name
          if (inProfessionalSection) {
            // If it's a professional name (not an email or instruction)
            if (
              !line.includes("Email:") &&
              !line.includes("Professional") &&
              !line.includes("Please let me know") &&
              !line.includes("please") &&
              !line.includes("select") &&
              line.length > 3 &&
              line.length < 50
            ) {
              // Clean up the name (remove any trailing punctuation)
              const name = line.replace(/\.$/, "")

              // Check if this name is already in options
              if (!options.some((opt) => opt.name === name)) {
                options.push({
                  name: name,
                  selected: false,
                })
              }
            }
          }
        }
      }

      // Try to extract professionals from the format shown in the change/cancel flow
      if (options.length === 0) {
        // Look for a professional name followed by "Email:" pattern - more generic pattern
        const professionalEmailPattern = /([A-Za-z\s']+)\s+Email:/
        const professionalMatch = message.match(professionalEmailPattern)

        if (professionalMatch && professionalMatch[1]) {
          options.push({
            name: professionalMatch[1].trim(),
            selected: false,
          })
        }
      }

      return {
        type: "professional",
        options,
        allowMultiple: false,
      }
    }

    // Check for service selection
    else if (
      message.includes("services offered") ||
      message.includes("which service") ||
      message.includes("Please specify the name of the service")
    ) {
      // Extract service options
      const options: SelectionOption[] = []

      // First try to extract structured data if it looks like JSON
      if (message.includes('"type":') || message.includes('"name":') || message.includes('"items":')) {
        // This might be a JSON-like response, try to extract service names and categories
        const nameMatches = message.match(/"name":\s*"([^"]+)"/g)
        const categoryMatches = message.match(/"category":\s*"([^"]+)"/g)

        if (nameMatches && nameMatches.length > 0) {
          nameMatches.forEach((match, index) => {
            const name = match.replace(/"name":\s*"/, "").replace(/"/, "")

            // Try to get the corresponding category
            let category = "Main Service" // Default
            if (categoryMatches && categoryMatches[index]) {
              category = categoryMatches[index].replace(/"category":\s*"/, "").replace(/"/, "")
            }

            // Only add if it looks like a service name (not JSON syntax)
            if (!name.includes("{") && !name.includes("}") && !name.includes("[") && !name.includes("]")) {
              options.push({
                name: name,
                category: category,
                selected: false,
              })
            }
          })
        }
      }

      // If we couldn't extract from JSON or didn't find any options, try the regular approach
      if (options.length === 0) {
        // Try to extract service names from the message using a more generic pattern
        const serviceLines = message
          .split("\n")
          .filter(
            (line) =>
              line.trim().length > 0 &&
              !line.includes("Please") &&
              !line.includes("services offered") &&
              !line.includes("which service"),
          )

        for (const line of serviceLines) {
          // Look for lines that might be service names
          if (
            line.length > 3 &&
            line.length < 50 &&
            !line.includes("Duration") &&
            !line.includes("Price") &&
            !line.includes("Email") &&
            !line.includes("description")
          ) {
            // Determine if it's a main service or add-on
            const isAddOn = line.toLowerCase().includes("add") && line.toLowerCase().includes("on")

            options.push({
              name: line.trim(),
              category: isAddOn ? "Add-On" : "Main Service",
              selected: false,
            })
          }
        }
      }

      return {
        type: "service",
        options,
        allowMultiple: true, // We'll handle the main service vs add-on logic separately
      }
    }

    // Check for confirmation - this should be very specific and only for final booking confirmation
    // NOT for pet selection or other confirmations
    else if (
      (lowerMessage.includes("would you like to proceed") ||
        lowerMessage.includes("confirm to finalize") ||
        lowerMessage.includes("confirm your booking")) &&
      !lowerMessage.includes("recurring booking request") &&
      !lowerMessage.includes("confirm which pet") &&
      !lowerMessage.includes("please confirm which pet") &&
      !lowerMessage.includes("please specify") &&
      !lowerMessage.includes("confirm which pet") &&
      !lowerMessage.includes("confirm which pet") &&
      !lowerMessage.includes("let me know the pet") &&
      !lowerMessage.includes("could you please confirm") &&
      !lowerMessage.includes("has been successfully submitted") &&
      !lowerMessage.includes("confirmation email has been sent")
    ) {
      console.log("Detected final booking confirmation request")
      return {
        type: "confirmation",
        options: [
          { name: "Yes, proceed", selected: false },
          { name: "No, I need to make changes", selected: false },
        ],
        allowMultiple: false,
      }
    }

    // No selection type detected
    console.log("No selection options detected")
    return { type: null, options: [], allowMultiple: false }
  }

  // Add a function to detect if we should show the calendar
  const shouldShowCalendar = (message: string): boolean => {
    const lowerMessage = message.toLowerCase()
    return (
      (lowerMessage.includes("date") && lowerMessage.includes("time")) ||
      lowerMessage.includes("when would you like") ||
      lowerMessage.includes("provide the date") ||
      lowerMessage.includes("what time") ||
      lowerMessage.includes("schedule") ||
      lowerMessage.includes("when do you want") ||
      (lowerMessage.includes("please provide") && lowerMessage.includes("date"))
    )
  }

  // Add a function to detect if we should show the calendar
  const shouldShowCalendarLogic = (message: string): boolean => {
    console.log("Checking if calendar should show for message:", message)

    // First try to parse the message as JSON
    try {
      const jsonData = JSON.parse(message)

      // If it's a text_only message, check its content
      if (jsonData.type === "text_only") {
        console.log("Found text_only message, checking content")

        // Combine intro and footer for checking
        const fullText = [jsonData.intro || "", jsonData.footer || ""].join(" ").toLowerCase()

        // Check for date/time related keywords
        const hasDateTimeKeywords =
          (fullText.includes("date") || fullText.includes("when")) &&
          (fullText.includes("time") || fullText.includes("schedule"))

        // Check for scheduling request indicators
        const isSchedulingRequest =
          fullText.includes("provide") ||
          fullText.includes("when would you like") ||
          fullText.includes("when you'd like") ||
          fullText.includes("schedule") ||
          fullText.includes("booking")

        const result = hasDateTimeKeywords && isSchedulingRequest
        console.log(
          `Calendar detection for text_only: hasDateTimeKeywords=${hasDateTimeKeywords}, isSchedulingRequest=${isSchedulingRequest}, result=${result}`,
        )
        return result
      }

      // For other structured message types, don't show calendar
      if (jsonData.type) {
        console.log(`Message is structured data with type: ${jsonData.type}, not showing calendar`)
        return false
      }
    } catch (error) {
      // Not valid JSON, continue with text analysis
      console.log("Message is not valid JSON, analyzing as text")
    }

    // For plain text messages, check content
    const lowerMessage = message.toLowerCase()

    // Check for specific scheduling phrases
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

    // Check if any scheduling phrase is in the message
    const containsSchedulingPhrase = schedulingPhrases.some((phrase) => lowerMessage.includes(phrase))

    // Only show calendar if it contains scheduling phrases AND date/time keywords
    const hasDateTimeKeywords =
      (lowerMessage.includes("date") || lowerMessage.includes("when")) &&
      (lowerMessage.includes("time") || lowerMessage.includes("schedule"))

    const result = containsSchedulingPhrase || (hasDateTimeKeywords && lowerMessage.includes("provide"))

    console.log(
      `Calendar detection result for plain text: ${result}, containsSchedulingPhrase: ${containsSchedulingPhrase}, hasDateTimeKeywords: ${hasDateTimeKeywords}`,
    )
    return result
  }

  // Add a function to handle calendar submission
  const handleCalendarSubmit = (bookingInfo: BookingInfo) => {
    // Format the date and time for the message
    const date = bookingInfo.date.toLocaleDateString()
    const time = bookingInfo.time
    const formattedTime = time.split(":").map(Number)
    const hours = formattedTime[0]
    const minutes = formattedTime[1]
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    const timeString = `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`

    // Create a more neutral message text without the "I'd like to book" prefix
    let messageText = `Date: ${date}, Time: ${timeString}, Timezone: ${bookingInfo.timezone}`

    // Add recurring information if applicable
    if (bookingInfo.isRecurring && bookingInfo.recurringFrequency) {
      messageText += `, Recurring: ${bookingInfo.recurringFrequency}`

      // Add recurring end date if available
      if (bookingInfo.recurringEndDate) {
        messageText += `, Ends on: ${bookingInfo.recurringEndDate.toLocaleDateString()}`
      }
    }

    // Add multi-day information if applicable
    if (bookingInfo.isMultiDay && bookingInfo.endDate) {
      messageText += `, Multi-day booking ending on: ${bookingInfo.endDate.toLocaleDateString()}`
    }

    // Hide the calendar
    setShowCalendar(false)

    // Send the message
    sendMessage(messageText)
  }

  const sendMessage = async (messageText?: string) => {
    // Get the message text from the parameter or the input value
    const message = messageText || inputValue.trim()
    if (!message) return

    setShowActionBubbles(false)

    // Log that we're sending a message
    console.log("Sending message", { message })

    // Add user message to chat immediately
    setMessages((prev) => {
      const newMessages = [...prev, { text: message, isUser: true }]
      console.log("Updated messages array", { messageCount: newMessages.length })
      return newMessages
    })

    // Clear input field
    setInputValue("")

    // Show typing indicator
    setIsTyping(true)
    // Update the status color in the sendMessage function
    updateStatus("Thinking...", "#745E25") // Updated to Green (secondary)

    try {
      // Get user info
      const userInfo = getUserInfo()

      // Prepare request payload
      const payload = {
        message: {
          text: message,
          userId: USER_ID.current,
          timestamp: new Date().toISOString(),
          userInfo: userInfo,
        },
      } as any

      // Add session and conversation IDs if available
      if (sessionId) {
        payload.message.sessionId = sessionId
      }
      if (conversationId) {
        payload.message.conversationId = conversationId
      }

      // Log what we're sending
      console.log("Sending message to webhook", payload)
      // Update the status color in the sendMessage function
      updateStatus("Connecting...", "#94ABD6") // Updated to Blue

      // Send message to webhook
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

      // Parse response
      const data = await response.json()

      // Log the response
      console.log("Received response", data)

      // Hide typing indicator
      setIsTyping(false)
      // Update the status color in the sendMessage function
      updateStatus("Ready to assist you", "#E75837") // Updated to Orange (primary)

      // Process the response message if it exists
      if (data.message) {
        // Use our formatter to process the message
        const formattedMessage = formatMessage(data.message, data.htmlMessage)

        // Add bot response to chat with the formatted HTML
        setMessages((prev) => [
          ...prev,
          {
            text: formattedMessage.text,
            isUser: false,
            htmlMessage: formattedMessage.html,
          },
        ])

        // Check if we should show the calendar
        if (shouldShowCalendarLogic(data.message)) {
          console.log("Showing calendar for date/time selection")
          setShowCalendar(true)
          return // Early return to prevent showing selection bubbles
        }

        // SIMPLIFIED APPROACH: Check if the current action should NEVER show bubbles
        // If it's list_bookings or list_outstanding, never show bubbles regardless of message content
        console.log(`Before bubble check - selectedAction: "${selectedAction}"`)
        console.log(`NO_BUBBLES_ACTIONS includes selectedAction: ${NO_BUBBLES_ACTIONS.includes(selectedAction)}`)

        // Force a check of the current action from the input field
        const currentAction = actionSelectRef.current?.value || selectedAction
        console.log(`Current action from ref: "${currentAction}"`)

        if (NO_BUBBLES_ACTIONS.includes(currentAction)) {
          console.log(`Action ${currentAction} is in NO_BUBBLES_ACTIONS list, skipping all selection bubbles`)
          setShowSelectionBubbles(false)
        } else {
          // Only try to detect selection options for actions that can show bubbles
          const { type, options, allowMultiple } = detectSelectionType(data.message)

          console.log("Selection detection in sendMessage:", { type, options, allowMultiple })

          if (type && options.length > 0) {
            console.log("Showing selection bubbles for:", type, options)
            setSelectionType(type)
            setSelectionOptions(options)
            setSelectedOptions([])
            setSelectedMainService(null)
            setAllowMultipleSelection(allowMultiple)
            setShowSelectionBubbles(true)
          } else {
            console.log("No selection options detected, hiding bubbles")
            setShowSelectionBubbles(false)
          }
        }
      } else {
        // If no message, just use what we got
        setMessages((prev) => [...prev, { text: JSON.stringify(data), isUser: false }])
      }

      // Store session and conversation IDs - defensive approach
      if (data.sessionId) {
        // Only update if we don't already have a session ID
        if (!sessionId) {
          setSessionId(data.sessionId)
          console.log("Set initial sessionId", data.sessionId)
        } else {
          // Log that we're keeping the existing ID
          console.log("Keeping existing sessionId", sessionId)
        }
      }

      if (data.conversationId) {
        // Only update if we don't already have a conversation ID
        if (!conversationId) {
          setConversationId(data.conversationId)
          console.log("Set initial conversationId", data.conversationId)
        } else {
          // Log that we're keeping the existing ID
          console.log("Keeping existing conversationId", conversationId)
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      console.log("Error", error.message)

      // Hide typing indicator
      setIsTyping(false)
      updateStatus("Connection error", "#3F001D") // Updated to Maroon

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error processing your request. Please try again later.",
          isUser: false,
        },
      ])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  // Helper function to display action name
  const getActionDisplayName = (action: string): string => {
    switch (action) {
      case "new_booking":
        return "New Booking"
      case "change_booking":
        return "Change Booking"
      case "cancel_booking":
        return "Cancel Booking"
      case "list_bookings":
        return "List Bookings"
      case "list_outstanding":
        return "List Outstanding Invoices"
      default:
        return "No action selected yet"
    }
  }

  // Fix the layout to ensure side-by-side display
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Left Column - User Info */}
      <div className="md:col-span-5">
        <div className="bg-[#E75837] text-white p-4 rounded-t-lg">
          <h2 className="text-xl font-medium header-font">Tell us about you</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-b-lg p-6 shadow-sm">
          <p className="text-gray-700 mb-4 body-font">
            Let's start by telling us a little bit about yourself, with first/last name and/or email. This lets Critter
            match you to the services providers you already work with.
          </p>

          <div className="space-y-4">
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

      {/* Right Column - Chat */}
      <div className="md:col-span-7">
        <div className="bg-[#E75837] text-white p-4 rounded-t-lg">
          <h2 className="text-xl font-medium header-font">What can Critter do for you?</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto p-5 border-b border-gray-200 body-font" ref={chatMessagesRef}>
            <p className="text-gray-700 mb-4 body-font">
              Let's get you started! First thing's first, share some details to the left so can match you to the right
              businesses on Critter.
            </p>

            {messages.slice(1).map((msg, index) => {
              return msg.htmlMessage ? (
                <div
                  key={index}
                  className={`message mb-4 p-3 rounded-lg max-w-[80%] relative ${
                    msg.isUser
                      ? "bg-[#E75837] text-white ml-auto rounded-br-sm"
                      : "bg-gray-100 text-gray-800 mr-auto rounded-bl-sm"
                  } body-font`}
                  dangerouslySetInnerHTML={{ __html: msg.htmlMessage }}
                />
              ) : (
                <div
                  key={index}
                  className={`message mb-4 p-3 rounded-lg max-w-[80%] relative ${
                    msg.isUser
                      ? "bg-[#E75837] text-white ml-auto rounded-br-sm"
                      : "bg-gray-100 text-gray-800 mr-auto rounded-bl-sm"
                  } body-font`}
                >
                  {msg.text}
                </div>
              )
            })}

            {/* Initial action bubbles */}
            {showActionBubbles && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2 body-font">
                  Then, pick from the options below to get started on your request:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleActionBubbleClick("new_booking")}
                    className="px-4 py-2 bg-[#E75837] hover:bg-[#d04e30] text-white rounded-full text-sm font-medium transition-colors body-font"
                  >
                    Request a new booking
                  </button>
                  <button
                    onClick={() => handleActionBubbleClick("change_booking")}
                    className="px-4 py-2 bg-[#E75837] hover:bg-[#d04e30] text-white rounded-full text-sm font-medium transition-colors body-font"
                  >
                    Make a change to an existing booking
                  </button>
                  <button
                    onClick={() => handleActionBubbleClick("cancel_booking")}
                    className="px-4 py-2 bg-[#E75837] hover:bg-[#d04e30] text-white rounded-full text-sm font-medium transition-colors body-font"
                  >
                    Cancel an existing booking
                  </button>
                  <button
                    onClick={() => handleActionBubbleClick("list_bookings")}
                    className="px-4 py-2 bg-[#E75837] hover:bg-[#d04e30] text-white rounded-full text-sm font-medium transition-colors body-font"
                  >
                    See upcoming bookings
                  </button>
                  <button
                    onClick={() => handleActionBubbleClick("list_outstanding")}
                    className="px-4 py-2 bg-[#E75837] hover:bg-[#d04e30] text-white rounded-full text-sm font-medium transition-colors body-font"
                  >
                    Review open invoices
                  </button>
                </div>
              </div>
            )}

            {/* Selection bubbles for professionals, services, pets, confirmation */}
            {showSelectionBubbles && (
              <div className="selection-bubbles flex flex-col gap-4 mt-4 mb-4">
                <div className="selection-options">
                  <p className="text-sm text-gray-600 mb-2 body-font">
                    {selectionType === "professional" && "Select a professional:"}
                    {selectionType === "service" && "Select a service:"}
                    {selectionType === "pet" && `Select ${allowMultipleSelection ? "pet(s)" : "a pet"}:`}
                    {selectionType === "confirmation" && "Confirm your booking:"}
                  </p>

                  {/* Group options by category for services */}
                  {selectionType === "service" && (
                    <>
                      {/* Main Services */}
                      {selectionOptions.some((opt) => opt.category !== "Add-On") && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1 body-font">Main Services (select one):</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {selectionOptions
                              .filter((opt) => opt.category !== "Add-On")
                              .map((option, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSelectionBubbleClick(option)}
                                  className={`selection-bubble px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center body-font ${
                                    option.selected
                                      ? "bg-[#d04e30] text-white"
                                      : "bg-[#e75837] hover:bg-[#d04e30] text-white"
                                  }`}
                                >
                                  {option.selected && <Check className="w-4 h-4 mr-1" />}
                                  {option.name}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Add-Ons */}
                      {selectionOptions.some((opt) => opt.category === "Add-On") && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1 body-font">Add-Ons (select any):</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {selectionOptions
                              .filter((opt) => opt.category === "Add-On")
                              .map((option, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSelectionBubbleClick(option)}
                                  className={`selection-bubble px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center body-font ${
                                    option.selected
                                      ? "bg-[#745E25] text-white"
                                      : "bg-[#94ABD6] hover:bg-[#7a8eb3] text-white"
                                  }`}
                                >
                                  {option.selected && <Check className="w-4 h-4 mr-1" />}
                                  {option.name}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* For non-service selections */}
                  {selectionType !== "service" && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectionOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectionBubbleClick(option)}
                          className={`selection-bubble px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center body-font ${
                            option.selected ? "bg-[#d04e30] text-white" : "bg-[#e75837] hover:bg-[#d04e30] text-white"
                          }`}
                        >
                          {option.selected && <Check className="w-4 h-4 mr-1" />}
                          {option.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Show details for the selected options */}
                  {selectionOptions
                    .filter((opt) => opt.selected)
                    .map((option, index) => (
                      <div key={index} className="selected-option-details mb-3 p-3 bg-[#f9f9f9] rounded-md body-font">
                        <div className="font-medium header-font">{option.name}</div>
                        {option.description && (
                          <div className="text-sm text-gray-600 body-font">{option.description}</div>
                        )}
                        {option.details &&
                          option.details.map((detail, i) => (
                            <div key={i} className="text-sm text-gray-600 body-font">
                              {detail}
                            </div>
                          ))}
                      </div>
                    ))}

                  {/* Submit button for services (when main service is selected) or multiple selections */}
                  {((selectionType === "service" && selectedMainService) ||
                    (selectionType === "confirmation" && selectedOptions.length > 0) ||
                    (selectionType === "pet" && selectedOptions.length > 0) ||
                    (selectionType !== "service" &&
                      selectionType !== "professional" &&
                      selectedOptions.length > 0)) && (
                    <button
                      onClick={() => submitSelections()}
                      className="bg-[#745E25] text-white border-none py-2 px-4 rounded-full cursor-pointer font-medium text-sm transition-colors duration-300 hover:bg-[#5d4b1e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(116,94,37,0.3)] inline-flex items-center justify-center body-font"
                    >
                      Submit Selection
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Calendar widget for date/time selection */}
            {showCalendar && (
              <div className="calendar-widget mt-4 mb-4">
                <BookingCalendar onSubmit={handleCalendarSubmit} onCancel={() => setShowCalendar(false)} />
              </div>
            )}

            {isTyping && (
              <div className="typing-indicator p-3 bg-gray-100 rounded-lg mb-4 w-16 mr-auto rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="p-4 border-t border-gray-200 flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
            />

            <button
              onClick={() => sendMessage()}
              className="bg-[#E75837] text-white px-4 py-3 rounded-r-lg hover:bg-[#d04e30] transition-colors flex items-center header-font"
            >
              <span className="mr-2">Send</span>
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get a user-friendly display name for the action
function getActionDisplayName(action: string): string {
  const actionDisplayNames: { [key: string]: string } = {
    new_booking: "New Booking",
    change_booking: "Change Existing Booking",
    cancel_booking: "Cancel Booking",
    list_bookings: "List Bookings",
    list_outstanding: "Outstanding Invoices",
  }

  return actionDisplayNames[action] || action
}
