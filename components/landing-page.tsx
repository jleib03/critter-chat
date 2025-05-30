"use client"

import type React from "react"
import { useRouter } from "next/router"

interface ActionCardProps {
  title: string
  description: string
  action: "existing" | "new" | "learn"
  onExistingCustomer?: () => void
  onNewCustomer?: () => void
  onLearnMore?: () => void
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  action,
  onExistingCustomer,
  onNewCustomer,
  onLearnMore,
}) => {
  const router = useRouter()

  const handleActionCardClick = () => {
    if (action === "existing") {
      if (onExistingCustomer) {
        onExistingCustomer()
      } else {
        // Default action for existing customers (e.g., navigate to login)
        router.push("/login")
      }
      return
    }

    if (action === "new") {
      // Always navigate to /newcustomer URL for new customers
      router.push("/newcustomer")
      return
    }

    if (action === "learn") {
      if (onLearnMore) {
        onLearnMore()
      } else {
        // Default action for learning more (e.g., navigate to a documentation page)
        router.push("/documentation")
      }
      return
    }
  }

  return (
    <div
      onClick={handleActionCardClick}
      style={{
        border: "1px solid #ccc",
        padding: "16px",
        margin: "8px",
        cursor: "pointer",
      }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

interface LandingPageProps {
  onExistingCustomer?: () => void
  onNewCustomer?: () => void
  onLearnMore?: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onExistingCustomer, onNewCustomer, onLearnMore }) => {
  return (
    <div>
      <h1>Welcome to Our Service</h1>
      <p>Choose an option below to get started:</p>

      <ActionCard
        title="Existing Customer"
        description="Log in to your account."
        action="existing"
        onExistingCustomer={onExistingCustomer}
      />

      <ActionCard title="New Customer" description="Create a new account." action="new" onNewCustomer={onNewCustomer} />

      <ActionCard
        title="Learn More"
        description="Discover the features and benefits."
        action="learn"
        onLearnMore={onLearnMore}
      />
    </div>
  )
}

export default LandingPage
