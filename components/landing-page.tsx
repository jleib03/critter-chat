"use client"

import type React from "react"
import { useRouter } from "next/router"

interface ActionCardProps {
  title: string
  description: string
  action: "new" | "existing"
  onNewCustomer?: () => void
  onExistingCustomer?: () => void
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, action, onNewCustomer, onExistingCustomer }) => {
  const router = useRouter()

  const handleActionCardClick = () => {
    if (action === "new") {
      // Always navigate to /newcustomer URL for new customers
      router.push("/newcustomer")
      return
    }

    if (action === "existing" && onExistingCustomer) {
      onExistingCustomer()
    }
  }

  return (
    <div
      onClick={handleActionCardClick}
      style={{ border: "1px solid #ccc", padding: "16px", margin: "8px", cursor: "pointer" }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

type LandingPageProps = {}

const LandingPage: React.FC<LandingPageProps> = () => {
  return (
    <div>
      <h1>Welcome!</h1>
      <p>Choose an option below:</p>

      <ActionCard title="New Customer" description="Start a new application." action="new" />

      <ActionCard
        title="Existing Customer"
        description="Continue an existing application."
        action="existing"
        onExistingCustomer={() => {
          alert("Navigating to existing customer flow (not implemented)")
        }}
      />
    </div>
  )
}

export default LandingPage
