"use client"

import { useState } from "react"
import PasswordProtection from "@/components/PasswordProtection"

const HowToUsePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // If not authenticated, show password protection
  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onAuthenticated={() => setIsAuthenticated(true)}
        title="Professional Help Hub Access"
        description="Access professional resources and documentation."
      />
    )
  }

  return (
    <div>
      <h1>How to Use (Professional)</h1>
      <p>Welcome to the professional help hub!</p>
      {/* Add more content here */}
    </div>
  )
}

export default HowToUsePage
