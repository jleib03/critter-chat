"use client"
import type { Service, SelectedTimeSlot, CustomerInfo, PetResponse } from "@/types/schedule"

type RecurringConfig = {
  selectedDays: string[]
  endDate: string
  totalAppointments: number
}

type CustomerFormProps = {
  selectedServices: Service[]
  selectedTimeSlot: SelectedTimeSlot
  professionalId: string
  professionalName: string
  sessionId: string
  onPetsReceived: (customerInfo: CustomerInfo, petResponse: PetResponse) => void
  onBack: () => void
  bookingType?: "one-time" | "recurring"
  recurringConfig?: Recur
