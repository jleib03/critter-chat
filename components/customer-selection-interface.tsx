"use client"
import { useState, useEffect } from "react"
import { Search, Users, Mail, Check, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { getCRMData, getInactiveCustomers } from "../utils/crm-data"

interface Customer {
  email: string
  name?: string
  petName?: string
  petType?: string
  lastBooking?: string
  totalBookings?: number
}

interface CustomerSelectionProps {
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
  const [crmData, setCrmData] = useState<any>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [showCustomerList, setShowCustomerList] = useState(false)

  useEffect(() => {
    const data = getCRMData()
    setCrmData(data)

    if (data) {
      const customerMap = new Map<string, Customer>()

      // Process bookings to build customer profiles
      data.bookings.forEach((booking: any) => {
        const email = booking.customer_email
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            email,
            name: booking.customer_name || email.split("@")[0],
            petName: booking.pet_name,
            petType: booking.pet_type,
            lastBooking: booking.date,
            totalBookings: 1,
          })
        } else {
          const customer = customerMap.get(email)!
          customer.totalBookings = (customer.totalBookings || 0) + 1
          // Update with most recent booking info
          if (booking.date > (customer.lastBooking || "")) {
            customer.lastBooking = booking.date
            customer.petName = booking.pet_name || customer.petName
            customer.petType = booking.pet_type || customer.petType
          }
        }
      })

      // Add pet care data
      data.petCare.forEach((pet: any) => {
        const email = pet.owner_email || pet.customer_email
        if (email && !customerMap.has(email)) {
          customerMap.set(email, {
            email,
            name: pet.owner_name || email.split("@")[0],
            petName: pet.pet_name,
            petType: pet.pet_type,
            totalBookings: 0,
          })
        }
      })

      const allCustomers = Array.from(customerMap.values())
      setCustomers(allCustomers)
    }
  }, [])

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
          return !petType.includes("dog") && !petType.includes("cat") && petType.length > 0
        })
        break
      default:
        filtered = customers
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.petName?.toLowerCase().includes(searchTerm.toLowerCase()),
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
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="header-font">Target Audience</CardTitle>
          <CardDescription className="body-font">Choose who will receive this campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="body-font">Audience Segment</Label>
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
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="body-font">Personalize Subject Lines</Label>
              <Switch checked={personalizeSubject} onCheckedChange={onPersonalizeChange} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="body-font">Track Email Opens</Label>
              <Switch checked={trackOpens} onCheckedChange={onTrackOpensChange} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="body-font">Track Link Clicks</Label>
              <Switch checked={trackClicks} onCheckedChange={onTrackClicksChange} />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCustomerList(!showCustomerList)} className="w-full">
              <Users className="h-4 w-4 mr-2" />
              {showCustomerList ? "Hide" : "View"} Customer List ({getAudienceCount()})
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="header-font">Campaign Statistics</CardTitle>
          <CardDescription className="body-font">Expected performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground body-font">Total Recipients</p>
                <p className="font-bold text-2xl header-font">{getAudienceCount()}</p>
              </div>
              <div>
                <p className="text-muted-foreground body-font">Expected Opens</p>
                <p className="font-bold text-2xl header-font">{Math.round(getAudienceCount() * 0.68)}</p>
              </div>
              <div>
                <p className="text-muted-foreground body-font">Expected Clicks</p>
                <p className="font-bold text-2xl header-font">{Math.round(getAudienceCount() * 0.24)}</p>
              </div>
              <div>
                <p className="text-muted-foreground body-font">Est. Bookings</p>
                <p className="font-bold text-2xl header-font">{Math.round(getAudienceCount() * 0.08)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2 body-font">Sample Recipients:</p>
              <div className="space-y-2 text-sm">
                {filteredCustomers.slice(0, 3).map((customer, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="body-font text-xs">{customer.email}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {customer.petName || "Pet"}
                    </Badge>
                  </div>
                ))}
                {getAudienceCount() > 3 && (
                  <p className="text-xs text-muted-foreground body-font">+ {getAudienceCount() - 3} more recipients</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCustomerList && (
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="header-font">Customer List</CardTitle>
                  <CardDescription className="body-font">
                    {getAudienceCount()} customers in selected audience
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAllCustomers}>
                    <Check className="h-4 w-4 mr-1" />
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllCustomers}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers by email, name, or pet name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.email}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedCustomers.has(customer.email)}
                          onCheckedChange={() => toggleCustomerSelection(customer.email)}
                        />
                        <div>
                          <p className="font-medium body-font">{customer.name}</p>
                          <p className="text-sm text-muted-foreground body-font">{customer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {customer.petName && (
                          <Badge variant="secondary" className="text-xs">
                            {customer.petName}
                          </Badge>
                        )}
                        {customer.petType && (
                          <Badge variant="outline" className="text-xs">
                            {customer.petType}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground body-font">
                          {customer.totalBookings || 0} bookings
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredCustomers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground body-font">No customers found matching your criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
