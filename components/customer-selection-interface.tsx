"use client"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { getCRMData, getInactiveCustomers, waitForCRMData, isCRMDataAvailable } from "../utils/crm-data"

interface Customer {
  email: string
  name?: string
  petName?: string
  petType?: string
  lastBooking?: string
  totalBookings?: number
}

interface CustomerSelectionProps {
  crmData?: any
  crmLoading?: boolean
  selectedAudience: string
  onAudienceChange: (audience: string) => void
  onCustomersSelected: (customers: Customer[]) => void
  personalizeSubject: boolean
  onPersonalizeChange: (personalize: boolean) => void
  trackOpens: boolean
  onTrackOpensChange: (track: boolean) => void
  trackClicks: boolean
  onTrackClicksChange: (track: boolean) => void
}

export default function CustomerSelectionInterface({
  crmData: propCrmData,
  crmLoading: propCrmLoading = false,
  selectedAudience,
  onAudienceChange,
  onCustomersSelected,
  personalizeSubject,
  onPersonalizeChange,
  trackOpens,
  onTrackOpensChange,
  trackClicks,
  onTrackClicksChange,
}: CustomerSelectionProps) {
  const [localCrmData, setLocalCrmData] = useState<any>(null)
  const [localCrmLoading, setLocalCrmLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [showCustomerList, setShowCustomerList] = useState(false)
  const [dataAvailable, setDataAvailable] = useState(false)

  const crmData = propCrmData || localCrmData
  const crmLoading = propCrmLoading || localCrmLoading

  const getPetTypeFromIds = (pet: any): string => {
    if (pet.type_id === "1" || pet.dog_breed_id) return "Dog"
    if (pet.type_id === "2" || pet.cat_breed_id) return "Cat"
    if (pet.bird_breed_id) return "Bird"
    if (pet.fish_breed_id) return "Fish"
    if (pet.rabbit_breed_id) return "Rabbit"
    if (pet.hamster_breed_id) return "Hamster"
    if (pet.turtle_breed_id) return "Turtle"
    if (pet.frog_breed_id) return "Frog"
    if (pet.lizard_breed_id) return "Lizard"
    if (pet.snake_breed_id) return "Snake"
    return pet.pet_type || "Unknown"
  }

  useEffect(() => {
    if (propCrmData) {
      console.log("[v0] Customer selection: Using prop CRM data")
      setDataAvailable(true)
      return
    }

    console.log("[v0] Customer selection: Loading CRM data locally")
    setLocalCrmLoading(true)

    const loadData = async () => {
      // First check if data should be available
      const shouldHaveData = isCRMDataAvailable()
      console.log("[v0] Customer selection: Data should be available:", shouldHaveData)

      // First try immediate access
      let data = getCRMData()
      console.log("[v0] Customer selection: Immediate data check:", !!data)

      if (!data && shouldHaveData) {
        console.log("[v0] Customer selection: Data should exist but not found, waiting...")
        data = await waitForCRMData(8, 750) // Wait up to 6 seconds with longer delays
      } else if (!data) {
        console.log("[v0] Customer selection: No data expected, waiting briefly...")
        data = await waitForCRMData(3, 1000) // Shorter wait if no data expected
      }

      if (data) {
        console.log("[v0] Customer selection: Successfully loaded CRM data")
        console.log("[v0] Customer selection: Data structure:", {
          petCare: data.petCare?.length || 0,
          bookings: data.bookings?.length || 0,
          professionalId: data.professionalId,
        })
        setLocalCrmData(data)
        setDataAvailable(true)
      } else {
        console.log("[v0] Customer selection: Failed to load CRM data after waiting")
        setDataAvailable(false)
      }

      setLocalCrmLoading(false)
    }

    loadData()
  }, [propCrmData])

  useEffect(() => {
    if (!propCrmData && !localCrmData) {
      const checkInterval = setInterval(() => {
        const available = isCRMDataAvailable()
        if (available && !dataAvailable) {
          console.log("[v0] Customer selection: Data became available, reloading...")
          const data = getCRMData()
          if (data) {
            setLocalCrmData(data)
            setDataAvailable(true)
            clearInterval(checkInterval)
          }
        }
      }, 2000) // Check every 2 seconds

      return () => clearInterval(checkInterval)
    }
  }, [propCrmData, localCrmData, dataAvailable])

  useEffect(() => {
    if (!crmData || crmLoading) {
      console.log("[v0] Customer selection: No data or still loading")
      return
    }

    console.log("[v0] Customer selection: Processing CRM data")
    console.log("[v0] Data arrays:", {
      petCarePlans: crmData.petCare?.length || 0,
      bookings: crmData.bookings?.length || 0,
      invoices: crmData.invoices?.invoices?.length || 0,
      onboardingData: crmData.onboarding ? 1 : 0,
    })

    const customerMap = new Map<string, Customer>()

    crmData.bookings?.forEach((booking: any) => {
      const email = booking.customer_email
      if (email) {
        const customerName =
          `${booking.customer_first_name || ""} ${booking.customer_last_name || ""}`.trim() ||
          booking.customer_name ||
          email.split("@")[0]

        if (!customerMap.has(email)) {
          customerMap.set(email, {
            email,
            name: customerName,
            petName: "",
            petType: "",
            lastBooking: booking.booking_date,
            totalBookings: 1,
          })
        } else {
          const customer = customerMap.get(email)!
          customer.totalBookings = (customer.totalBookings || 0) + 1
          if (booking.booking_date > (customer.lastBooking || "")) {
            customer.lastBooking = booking.booking_date
          }
        }
      }
    })

    crmData.petCare?.forEach((pet: any) => {
      const petType = getPetTypeFromIds(pet)

      if (pet.contacts && Array.isArray(pet.contacts)) {
        pet.contacts.forEach((contact: any) => {
          if (contact.email) {
            const existingCustomer = customerMap.get(contact.email)
            if (existingCustomer) {
              if (pet.name) {
                existingCustomer.petName = existingCustomer.petName
                  ? `${existingCustomer.petName}, ${pet.name}`
                  : pet.name
              }
              if (petType) {
                const currentTypes = existingCustomer.petType ? existingCustomer.petType.split(", ") : []
                if (!currentTypes.includes(petType)) {
                  existingCustomer.petType = existingCustomer.petType
                    ? `${existingCustomer.petType}, ${petType}`
                    : petType
                }
              }
            } else {
              customerMap.set(contact.email, {
                email: contact.email,
                name: contact.contact_name || contact.email.split("@")[0],
                petName: pet.name,
                petType: petType,
                totalBookings: 0,
              })
            }
          }
        })
      }
    })

    if (crmData.onboarding && crmData.onboarding.email) {
      const onboardingEmail = crmData.onboarding.email
      if (!customerMap.has(onboardingEmail)) {
        const onboardingName = crmData.onboarding.supporting_details?.personal_info
          ? `${crmData.onboarding.supporting_details.personal_info.first_name || ""} ${crmData.onboarding.supporting_details.personal_info.last_name || ""}`.trim()
          : onboardingEmail.split("@")[0]

        customerMap.set(onboardingEmail, {
          email: onboardingEmail,
          name: onboardingName,
          petName: "",
          petType: "",
          totalBookings: 0,
        })

        if (crmData.onboarding.supporting_details?.pets?.details) {
          const petNames = crmData.onboarding.supporting_details.pets.details.map((p: any) => p.pet_name).join(", ")
          const customer = customerMap.get(onboardingEmail)!
          customer.petName = petNames
        }
      }
    }

    const allCustomers = Array.from(customerMap.values())
    console.log("[v0] Customer selection: Final customer list:", allCustomers.length, "customers")
    console.log("[v0] Customer selection: Sample customers:", allCustomers.slice(0, 3))
    setCustomers(allCustomers)
  }, [crmData, crmLoading])

  useEffect(() => {
    if (!crmData || !customers.length) return

    let filtered: Customer[] = []

    switch (selectedAudience) {
      case "all":
        filtered = customers
        break
      case "inactive-60":
        const inactiveEmails = getInactiveCustomers(crmData, 60)
        filtered = customers.filter((c) => inactiveEmails.includes(c.email))
        break
      case "new-customers":
        filtered = customers.filter((c) => (c.totalBookings || 0) <= 1)
        break
      case "repeat-customers":
        filtered = customers.filter((c) => (c.totalBookings || 0) > 1)
        break
      case "dog-owners":
        filtered = customers.filter((c) => c.petType?.toLowerCase().includes("dog"))
        break
      case "cat-owners":
        filtered = customers.filter((c) => c.petType?.toLowerCase().includes("cat"))
        break
      case "exotic-pets":
        filtered = customers.filter((c) => {
          const petType = c.petType?.toLowerCase() || ""
          const isExotic =
            petType &&
            !petType.includes("dog") &&
            !petType.includes("cat") &&
            (petType.includes("bird") ||
              petType.includes("fish") ||
              petType.includes("rabbit") ||
              petType.includes("hamster") ||
              petType.includes("turtle") ||
              petType.includes("frog") ||
              petType.includes("lizard") ||
              petType.includes("snake") ||
              petType.length > 0)
          return isExotic
        })
        break
      case "bird-owners":
        filtered = customers.filter((c) => c.petType?.toLowerCase().includes("bird"))
        break
      case "fish-owners":
        filtered = customers.filter((c) => c.petType?.toLowerCase().includes("fish"))
        break
      case "small-pets":
        filtered = customers.filter((c) => {
          const petType = c.petType?.toLowerCase() || ""
          return petType.includes("rabbit") || petType.includes("hamster") || petType.includes("guinea")
        })
        break
      default:
        filtered = customers
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.petType?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredCustomers(filtered)
    onCustomersSelected(filtered)
  }, [selectedAudience, customers, searchTerm, crmData])

  const toggleCustomerSelection = (email: string) => {
    const newSelected = new Set(selectedCustomers)
    if (newSelected.has(email)) {
      newSelected.delete(email)
    } else {
      newSelected.add(email)
    }
    setSelectedCustomers(newSelected)
  }

  const selectAllCustomers = () => {
    setSelectedCustomers(new Set(filteredCustomers.map((c) => c.email)))
  }

  const deselectAllCustomers = () => {
    setSelectedCustomers(new Set())
  }

  const getAudienceCount = () => filteredCustomers.length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 bg-card/30 rounded-lg border">
        <h3 className="text-lg font-semibold text-foreground mb-2">Target Audience</h3>
        <p className="text-muted-foreground mb-6">Choose who will receive this campaign</p>

        {crmLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading customer data...</p>
            <p className="text-xs text-muted-foreground mt-2">
              {dataAvailable ? "Processing customer information..." : "Waiting for CRM data..."}
            </p>
          </div>
        ) : !dataAvailable && !crmData ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No customer data available</p>
            <p className="text-xs text-muted-foreground mt-2">
              Please ensure CRM data is loaded before creating campaigns
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Audience Segment</label>
              <Select value={selectedAudience} onValueChange={onAudienceChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers ({customers.length} people)</SelectItem>
                  <SelectItem value="inactive-60">Inactive 60+ Days</SelectItem>
                  <SelectItem value="new-customers">New Customers</SelectItem>
                  <SelectItem value="repeat-customers">Repeat Customers</SelectItem>
                  <SelectItem value="dog-owners">Dog Owners</SelectItem>
                  <SelectItem value="cat-owners">Cat Owners</SelectItem>
                  <SelectItem value="exotic-pets">Exotic Pet Owners</SelectItem>
                  <SelectItem value="bird-owners">Bird Owners</SelectItem>
                  <SelectItem value="fish-owners">Fish Owners</SelectItem>
                  <SelectItem value="small-pets">Small Pet Owners</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Personalize Subject Lines</label>
                <Switch checked={personalizeSubject} onCheckedChange={onPersonalizeChange} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Track Email Opens</label>
                <Switch checked={trackOpens} onCheckedChange={onTrackOpensChange} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Track Link Clicks</label>
                <Switch checked={trackClicks} onCheckedChange={onTrackClicksChange} />
              </div>
            </div>

            <Button variant="outline" onClick={() => setShowCustomerList(!showCustomerList)} className="w-full">
              {showCustomerList ? "Hide" : "View"} Customer List ({getAudienceCount()})
            </Button>
          </div>
        )}
      </div>

      <div className="p-6 bg-card/30 rounded-lg border">
        <h3 className="text-lg font-semibold text-foreground mb-2">Campaign Statistics</h3>
        <p className="text-muted-foreground mb-6">Expected performance metrics</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-background rounded border text-center">
            <p className="text-sm text-muted-foreground">Recipients</p>
            <p className="text-2xl font-bold text-foreground">{getAudienceCount()}</p>
          </div>
          <div className="p-4 bg-background rounded border text-center">
            <p className="text-sm text-muted-foreground">Expected Opens</p>
            <p className="text-2xl font-bold text-foreground">{Math.round(getAudienceCount() * 0.68)}</p>
          </div>
          <div className="p-4 bg-background rounded border text-center">
            <p className="text-sm text-muted-foreground">Expected Clicks</p>
            <p className="text-2xl font-bold text-foreground">{Math.round(getAudienceCount() * 0.24)}</p>
          </div>
          <div className="p-4 bg-background rounded border text-center">
            <p className="text-sm text-muted-foreground">Est. Bookings</p>
            <p className="text-2xl font-bold text-foreground">{Math.round(getAudienceCount() * 0.08)}</p>
          </div>
        </div>

        <div className="p-4 bg-background rounded border">
          <h4 className="font-medium text-foreground mb-3">Sample Recipients</h4>
          <div className="space-y-2">
            {filteredCustomers.slice(0, 3).map((customer, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <span className="text-sm text-foreground">{customer.email}</span>
                <span className="text-xs text-muted-foreground">{customer.petName || "Pet"}</span>
              </div>
            ))}
            {getAudienceCount() > 3 && (
              <p className="text-xs text-muted-foreground">+ {getAudienceCount() - 3} more recipients</p>
            )}
          </div>
        </div>
      </div>

      {showCustomerList && (
        <div className="lg:col-span-2 p-6 bg-card/30 rounded-lg border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Customer List</h3>
              <p className="text-muted-foreground">{getAudienceCount()} customers in selected audience</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllCustomers}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllCustomers}>
                Clear
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.email}
                  className="flex items-center justify-between p-3 bg-background rounded border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedCustomers.has(customer.email)}
                      onCheckedChange={() => toggleCustomerSelection(customer.email)}
                    />
                    <div>
                      <p className="font-medium text-foreground">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {customer.petName && <span>{customer.petName}</span>}
                    {customer.petType && <span>• {customer.petType}</span>}
                    <span>• {customer.totalBookings || 0} bookings</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No customers found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
