"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Edit, User, PawPrint, Calendar, Clock, Repeat, Mail, Phone, MapPin, StickyNote } from 'lucide-react'
import { type Service } from '@/types/booking'

type CustomerInfo = {
  name: string
  email: string
  phone: string
  address: string
  notes: string
}

type PetInfo = {
  name: string
  breed: string
  age: string
}

type SchedulingInfo = {
  bookingType: "one-time" | "recurring"
  date: Date | undefined
  time: string
  recurringEndDate?: string
  recurringDays?: string[]
}

type ConfirmationProps = {
  customerInfo: CustomerInfo
  petInfo: PetInfo[]
  services: Service[]
  schedulingInfo: SchedulingInfo
  professionalId: string
  onEdit: (step: number) => void
  webhookUrl: string
}

export default function Confirmation({
  customerInfo,
  petInfo,
  services,
  schedulingInfo,
  professionalId,
  onEdit,
  webhookUrl
}: ConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const totalCost = services.reduce((acc, service) => {
    const price = parseFloat(service.price.replace('$', ''))
    return acc + (isNaN(price) ? 0 : price)
  }, 0)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmissionStatus('idle')

    const payload = {
      customerInfo,
      petInfo,
      services,
      schedulingInfo,
      professionalId,
      totalCost: totalCost.toFixed(2),
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSubmissionStatus('success')
      } else {
        setSubmissionStatus('error')
      }
    } catch (error) {
      console.error('Webhook submission error:', error)
      setSubmissionStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submissionStatus === 'success') {
    return (
      <Alert variant="default" className="bg-green-50 border-green-200">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <AlertTitle className="header-font text-lg text-green-800">Request Submitted!</AlertTitle>
        <AlertDescription className="body-font text-green-700">
          Your booking request has been sent. The professional will contact you shortly to confirm.
        </AlertDescription>
      </Alert>
    )
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const parsedHour = parseInt(hour, 10);
    const ampm = parsedHour >= 12 ? 'PM' : 'AM';
    const formattedHour = parsedHour % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="header-font text-2xl">Please Confirm Your Request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {submissionStatus === 'error' && (
          <Alert variant="destructive">
            <AlertTitle>Submission Failed</AlertTitle>
            <AlertDescription>
              There was an error submitting your request. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Customer Info */}
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold header-font text-lg flex items-center"><User className="mr-2 h-5 w-5 text-[#E75837]" /> Your Information</h3>
                <Button variant="ghost" size="sm" onClick={() => onEdit(3)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            </div>
            <div className="pl-7 space-y-1 body-font text-sm text-gray-700">
                <p className="flex items-center"><Mail className="mr-3 h-4 w-4 text-gray-400" /> {customerInfo.name}</p>
                <p className="flex items-center"><Mail className="mr-3 h-4 w-4 text-gray-400" /> {customerInfo.email}</p>
                <p className="flex items-center"><Phone className="mr-3 h-4 w-4 text-gray-400" /> {customerInfo.phone}</p>
                <p className="flex items-center"><MapPin className="mr-3 h-4 w-4 text-gray-400" /> {customerInfo.address}</p>
                {customerInfo.notes && <p className="flex items-start"><StickyNote className="mr-3 h-4 w-4 text-gray-400 mt-1" /> {customerInfo.notes}</p>}
            </div>
        </div>
        <Separator />

        {/* Pet Info */}
        <div className="space-y-2">
            <h3 className="font-semibold header-font text-lg flex items-center"><PawPrint className="mr-2 h-5 w-5 text-[#E75837]" /> Pet(s)</h3>
            <div className="pl-7 space-y-2 body-font text-sm text-gray-700">
                {petInfo.map((pet, index) => (
                    <div key={index}>{pet.name} ({pet.breed}, {pet.age})</div>
                ))}
            </div>
        </div>
        <Separator />

        {/* Service Info */}
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold header-font text-lg flex items-center"><PawPrint className="mr-2 h-5 w-5 text-[#E75837]" /> Selected Services</h3>
                <Button variant="ghost" size="sm" onClick={() => onEdit(1)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            </div>
            <ul className="pl-7 space-y-1 body-font text-sm text-gray-700">
                {services.map(service => (
                    <li key={service.id} className="flex justify-between">
                        <span>{service.name}</span>
                        <span>{service.price}</span>
                    </li>
                ))}
            </ul>
        </div>
        <Separator />

        {/* Scheduling Info */}
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold header-font text-lg flex items-center"><Calendar className="mr-2 h-5 w-5 text-[#E75837]" /> Requested Schedule</h3>
                <Button variant="ghost" size="sm" onClick={() => onEdit(2)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            </div>
            <div className="pl-7 space-y-1 body-font text-sm text-gray-700">
                <p className="flex items-center"><Calendar className="mr-3 h-4 w-4 text-gray-400" /> {formatDate(schedulingInfo.date)}</p>
                <p className="flex items-center"><Clock className="mr-3 h-4 w-4 text-gray-400" /> {formatTime(schedulingInfo.time)}</p>
                {schedulingInfo.bookingType === 'recurring' && (
                    <div className="flex items-start">
                        <Repeat className="mr-3 h-4 w-4 text-gray-400 mt-1" />
                        <div>
                            <p>Recurring on: {schedulingInfo.recurringDays?.join(', ')}</p>
                            <p>Until: {formatDate(new Date(schedulingInfo.recurringEndDate || ''))}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

      </CardContent>
      <CardFooter className="flex flex-col items-stretch space-y-4">
        <div className="flex justify-between font-bold text-lg header-font">
          <span>Total Estimate</span>
          <span>${totalCost.toFixed(2)}</span>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#E75837] hover:bg-[#d04e30] text-white"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </CardFooter>
    </Card>
  )
}
