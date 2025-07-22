"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Service, SelectedTimeSlot, BookingType, RecurringConfig } from "@/types/schedule"

type CustomerFormProps = {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalId: string
  professionalName: string
  sessionId: string
  onPetsReceived: (customerInfo: CustomerInfo, petResponse: PetResponse) => void
  onBack: () => void
  bookingType: BookingType | null
  recurringConfig: RecurringConfig | null
}

type CustomerInfo = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  notes?: string
}

type PetResponse = {
  pets: Pet[]
}

type Pet = {
  pet_id: string
  pet_name: string
  pet_type: string
  breed: string
  age: string
  weight: string
  special_notes: string
}

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
}: CustomerFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_customer_pets",
          uniqueUrl: professionalId,
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
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const petResponse: PetResponse = await response.json()
      console.log("Pets webhook response received:", petResponse)

      onPetsReceived(values, petResponse)
    } catch (error) {
      console.error("Error fetching pets:", error)
      alert("Failed to load pet data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#E75837] mb-2 header-font">Customer Information</h2>
        <p className="text-gray-600 body-font">
          Please provide your contact information to book with <span className="font-medium">{professionalName}</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="header-font">First Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} className="body-font" />
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
                  <FormLabel className="header-font">Last Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} className="body-font" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="header-font">Email*</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} className="body-font" />
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
                <FormLabel className="header-font">Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="847-555-1212" {...field} className="body-font" />
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
                <FormLabel className="header-font">Additional Notes</FormLabel>
                <FormControl>
                  <Input placeholder="Anything else we should know?" {...field} className="body-font" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack} className="flex items-center body-font bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Calendar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`flex items-center body-font ${
                loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#E75837] hover:bg-[#d04e30] text-white"
              }`}
            >
              {loading ? "Loading..." : "Continue to Pet Selection"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
