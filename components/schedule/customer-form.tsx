"use client"

// components/schedule/customer-form.tsx
import type React from "react"

const CustomerForm = () => {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Basic form data retrieval (replace with actual form data)
    const customerData = {
      firstName: (event.target as HTMLFormElement).firstName.value,
      lastName: (event.target as HTMLFormElement).lastName.value,
      email: (event.target as HTMLFormElement).email.value,
      phone: (event.target as HTMLFormElement).phone.value,
    }

    // Webhook URL
    const webhookUrl = "https://jleib03.app.n8n.cloud/webhook-test/5671c1dd-48f6-47a9-85ac-4e20cf261520"

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Webhook response:", data)

      // Redirect to pet selection page or next step
      // window.location.href = '/pet-selection'; // Example redirect
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="firstName">First Name:</label>
        <input type="text" id="firstName" name="firstName" required />
      </div>
      <div>
        <label htmlFor="lastName">Last Name:</label>
        <input type="text" id="lastName" name="lastName" required />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />
      </div>
      <div>
        <label htmlFor="phone">Phone:</label>
        <input type="tel" id="phone" name="phone" required />
      </div>
      <button type="submit">Next: Select Pet</button>
    </form>
  )
}

export default CustomerForm
