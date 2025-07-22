"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { CustomerInfoFormProps } from "@/types/schedule"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PetResponse } from "@/types/schedule"

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export function CustomerForm({
  selectedServices,
  selectedTimeSlot,
  professionalId,
  professionalName,
  sessionId,
  onPetsReceived,
  onBack,
  bookingType,
  recurringConfig,
}: CustomerInfoFormProps) {
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      const petData = {
        action: "get_customer_pets",
        uniqueUrl: professionalId, // Use uniqueUrl here
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        customer_info: values,
        booking_context: {
          selected_services: selectedServices.map((s) => s.name),
          selected_date: selectedTimeSlot.date,
          selected_time: selectedTimeSlot.startTime,
          booking_type: bookingType,
          recurring_config: recurringConfig,
        },
      }

      console.log("Sending webhook to:", webhookUrl)
      console.log("Sending customer pets webhook with payload:", petData)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(petData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const petResponse = (await response.json()) as PetResponse
      console.log("Pets webhook response received:", petResponse)

      // Parse the pet data
      const parsedPets = petResponse[0]?.pets || []
      console.log("Parsed pets:", parsedPets)

      // Format the pet response
      const finalPetResponse = {
        pets: parsedPets.map((pet) => ({
          pet_id: pet.pet_id,
          pet_name: pet.pet_name,
          pet_type: pet.pet_type,
          breed: "",
          age: "",
          weight: "",
          special_notes: "",
        })),
      }
      console.log("Final pet response:", finalPetResponse)

      onPetsReceived(values, finalPetResponse)
    } catch (error) {
      console.error("Error fetching pets:", error)
      alert("Failed to load pet data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pt-16">
      <Card className="shadow-lg border-0 rounded-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl header-font">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your-email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="847-707-5040" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requests or notes for the professional?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => onBack()} disabled={loading}>
                  Back to Schedule
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Loading..." : "Continue to Pet Selection"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
