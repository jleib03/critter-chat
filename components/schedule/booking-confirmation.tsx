"use client"

import { Calendar, Clock, PawPrint, User, Dog } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface BookingDetails {
  service: string
  duration: number
  date: string
  time: string
  pet_info: {
    name: string
    breed: string
    age: number
    notes?: string
  }[]
  customer_info: {
    name: string
    email: string
    phone: string
  }
}

interface BookingConfirmationProps {
  bookingDetails: BookingDetails
  onConfirm: () => void
  onBack: () => void
  professionalName: string
}

export default function BookingConfirmation({
  bookingDetails,
  onConfirm,
  onBack,
  professionalName,
}: BookingConfirmationProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Confirm Your Booking</CardTitle>
        <p className="text-sm text-gray-500">Please review the details of your appointment with {professionalName}.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50/50">
          <div className="flex items-start space-x-3">
            <Dog className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="font-medium text-gray-800">Service</p>
              <p className="text-gray-600">
                {bookingDetails.service} ({bookingDetails.duration} minutes)
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="font-medium text-gray-800">Date</p>
              <p className="text-gray-600">{bookingDetails.date}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="font-medium text-gray-800">Time</p>
              <p className="text-gray-600">{bookingDetails.time}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 border rounded-lg bg-gray-50/50">
          <div className="flex items-start space-x-3">
            <PawPrint className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="font-medium text-gray-800">Pet(s)</p>
              {bookingDetails.pet_info.length > 0 ? (
                bookingDetails.pet_info.map((pet, index) => (
                  <p key={index} className="text-gray-600">
                    {pet.name} <span className="text-sm text-gray-500">({pet.breed})</span>
                  </p>
                ))
              ) : (
                <p className="text-gray-600">No pet selected</p>
              )}
            </div>
          </div>
          <Separator />
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="font-medium text-gray-800">Your Info</p>
              <p className="text-gray-600">{bookingDetails.customer_info.name}</p>
              <p className="text-sm text-gray-500">{bookingDetails.customer_info.email}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onConfirm} className="bg-orange-500 hover:bg-orange-600 text-white">
          Confirm Booking
        </Button>
      </CardFooter>
    </Card>
  )
}
