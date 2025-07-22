"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

const ScheduleSetupPage = () => {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Schedule Setup</CardTitle>
          <CardDescription>Configure your availability and booking settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="John Doe" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="john.doe@example.com" className="mt-2" type="email" />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Tell us about your services" className="mt-2" />
          </div>
          <Separator />
          <div>
            <Label>Availability</Label>
            <div className="mt-2">
              {/* Calendar component or availability settings here */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !new Date() && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {new Date() ? format(new Date(), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar mode="single" selected={new Date()} onSelect={() => {}} className="rounded-md border" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScheduleSetupPage
