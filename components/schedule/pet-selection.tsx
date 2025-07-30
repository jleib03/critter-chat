"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Pet } from "@/types/schedule"

type PetSelectionProps = {
  pets: Pet[]
  selectedPets: Pet[]
  onSelectedPetsChange: (pets: Pet[]) => void
  onNext: () => void
  onBack: () => void
}

export function PetSelection({ pets, selectedPets, onSelectedPetsChange, onNext, onBack }: PetSelectionProps) {
  const handlePetSelection = (pet: Pet) => {
    const isSelected = selectedPets.some((p) => p.id === pet.id)
    if (isSelected) {
      onSelectedPetsChange(selectedPets.filter((p) => p.id !== pet.id))
    } else {
      onSelectedPetsChange([...selectedPets, pet])
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="header-font text-2xl">Select Your Pet(s)</CardTitle>
        <CardDescription className="body-font">You can select one or more pets for this appointment.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pets.map((pet) => (
            <div
              key={pet.id}
              onClick={() => handlePetSelection(pet)}
              className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                id={`pet-${pet.id}`}
                checked={selectedPets.some((p) => p.id === pet.id)}
                aria-labelledby={`pet-label-${pet.id}`}
              />
              <Label id={`pet-label-${pet.id}`} className="font-medium text-base body-font cursor-pointer">
                {pet.pet_name} <span className="text-gray-500">({pet.pet_type})</span>
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={selectedPets.length === 0} className="bg-[#E75837] hover:bg-[#d14a2a]">
          Next
        </Button>
      </CardFooter>
    </Card>
  )
}
