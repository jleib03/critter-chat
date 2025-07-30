"use client"

import { useState } from "react"

const CustomerForm = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    const webhookUrl = "https://jleib03.app.n8n.cloud/webhook/b550ab35-0e19-48d0-a831-a12dd775dfce"
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email }),
    })

    if (response.ok) {
      console.log("Form submitted successfully")
    } else {
      console.error("Failed to submit form")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button type="submit">Submit</button>
    </form>
  )
}

export default CustomerForm
