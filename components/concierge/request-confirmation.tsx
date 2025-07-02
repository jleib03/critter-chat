"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft } from "lucide-react"
import type { ServiceRequest, MatchedProfessional } from "../../types/concierge"

interface RequestConfirmationProps {
  serviceRequest: ServiceRequest
  selectedProfessional: MatchedProfessional
  onBack: () => void
  onConfirm: () => void
}

export function RequestConfirmation({ serviceRequest, selectedProfessional, onBack, onConfirm }: RequestConfirmationProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-6 body-font">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Professional Selection
      </Button>

      <Card className="border-green-200 bg-green-50 mb-6">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2 header-\
