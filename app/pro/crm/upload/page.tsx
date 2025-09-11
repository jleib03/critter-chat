"use client"
import { useState, useRef } from "react"
import type React from "react"

import { Upload, FileText, Database, Check, AlertCircle, Download, Eye, ArrowLeft } from "lucide-react"
import Header from "../../../../components/header"
import PasswordProtection from "../../../../components/password-protection"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getWebhookEndpoint } from "@/types/webhook-endpoints"

type UploadStep = "select" | "upload" | "preview" | "mapping" | "complete"

export default function DataUploadPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentStep, setCurrentStep] = useState<UploadStep>("select")
  const [uploadMethod, setUploadMethod] = useState<string>("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({})
  const [professionalId, setProfessionalId] = useState<string>("")
  const [csvData, setCsvData] = useState<string>("")
  const [uploadError, setUploadError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onAuthenticated={() => setIsAuthenticated(true)}
        title="Data Upload Portal Access"
        description="Enter your professional password to access data upload tools."
      />
    )
  }

  const parseCSV = (csvText: string): any[] => {
    console.log("[v0] Starting CSV parsing...")
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log("[v0] CSV lines found:", lines.length)

    if (lines.length < 2) {
      console.log("[v0] Not enough lines in CSV")
      return []
    }

    // Handle both comma and semicolon separators
    const firstLine = lines[0]
    const separator = firstLine.includes(";") ? ";" : ","
    console.log("[v0] Using separator:", separator)

    const headers = firstLine.split(separator).map((h) => h.trim().replace(/"/g, ""))
    console.log("[v0] CSV headers:", headers)

    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map((v) => v.trim().replace(/"/g, ""))
      if (values.length === headers.length && values.some((v) => v.length > 0)) {
        const row: any = {}
        headers.forEach((header, index) => {
          row[header.toLowerCase().replace(/\s+/g, "_")] = values[index]
        })
        data.push(row)
      }
    }

    console.log("[v0] Final parsed data:", data)
    return data
  }

  const processCSVFile = async (file: File) => {
    try {
      console.log("[v0] Processing CSV file:", file.name)
      const text = await file.text()
      console.log("[v0] CSV file content length:", text.length)

      setCsvData(text)
      const parsedData = parseCSV(text)

      console.log("[v0] Parsed CSV data:", parsedData)
      console.log("[v0] Number of records parsed:", parsedData.length)

      if (parsedData.length === 0) {
        throw new Error("No valid data found in CSV file")
      }

      setPreviewData(parsedData)
      setUploadError("")

      // Automatically move to preview step after successful parsing
      setTimeout(() => {
        setCurrentStep("preview")
      }, 500)
    } catch (error) {
      console.error("[v0] CSV parsing error:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to parse CSV file")
      setPreviewData([])
    }
  }

  const sendDataToWebhook = async () => {
    if (!professionalId.trim()) {
      setUploadError("Professional ID is required")
      return false
    }

    if (!csvData) {
      setUploadError("No CSV data to upload")
      return false
    }

    if (previewData.length === 0) {
      setUploadError("No valid records to upload")
      return false
    }

    try {
      console.log("[v0] Sending CSV data to webhook...")
      console.log("[v0] Professional ID:", professionalId)
      console.log("[v0] Records to upload:", previewData.length)

      const webhookUrl = getWebhookEndpoint("CRM_INITIALIZATION")
      console.log("[v0] Webhook URL:", webhookUrl)

      const payload = {
        action: "customer_upload",
        professionalId: professionalId.trim(),
        csvData: csvData,
        parsedData: previewData, // Include parsed data for easier processing
        fileName: uploadedFile?.name || "upload.csv",
        recordCount: previewData.length,
        timestamp: new Date().toISOString(),
        source: "crm_upload_portal",
      }

      console.log("[v0] Webhook payload:", {
        ...payload,
        csvData: `${csvData.length} characters`,
        parsedData: `${previewData.length} records`,
      })

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("[v0] Webhook response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Webhook error response:", errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("[v0] Webhook response:", result)

      return true
    } catch (error) {
      console.error("[v0] Webhook upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload data")
      return false
    }
  }

  const handleCritterSync = async () => {
    setUploadMethod("critter")
    setCurrentStep("upload")

    // Instead of dummy data, we'll simulate the Critter API call
    // but for now, we'll skip to file upload since that's what the user wants
    setTimeout(() => {
      setCurrentStep("upload")
      // Set upload method to file so user can upload their CSV
      setUploadMethod("file")
    }, 1000)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setCurrentStep("upload")
      processCSVFile(file)
    }
  }

  const renderStepIndicator = () => {
    const steps = [
      { id: "select", label: "Select Source" },
      { id: "upload", label: "Upload Data" },
      { id: "preview", label: "Preview & Map" },
      { id: "complete", label: "Complete" },
    ]

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : steps.findIndex((s) => s.id === currentStep) > index
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {steps.findIndex((s) => s.id === currentStep) > index ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  steps.findIndex((s) => s.id === currentStep) > index ? "bg-green-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderSelectSource = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 header-font">Choose Your Data Source</h2>
        <p className="text-muted-foreground body-font">
          Select how you'd like to import your customer and pet data into the CRM system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="border-border hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={handleCritterSync}
        >
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="header-font">Sync Critter Data</CardTitle>
                <CardDescription className="body-font">Import from your existing Critter bookings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm body-font">Automatic customer sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm body-font">Booking history included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm body-font">Pet profiles & preferences</span>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={handleCritterSync}>
              <Database className="h-4 w-4 mr-2" />
              Connect Critter Account
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="header-font">Upload Files</CardTitle>
                <CardDescription className="body-font">Import from CSV</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm body-font">CSV support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm body-font">Field mapping tools</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm body-font">Data validation</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 bg-transparent"
              onClick={() => {
                setUploadMethod("file")
                setCurrentStep("upload")
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="header-font">Manual Entry</CardTitle>
                <CardDescription className="body-font">Add customers one by one or in small batches</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                setUploadMethod("manual")
                setCurrentStep("upload")
              }}
            >
              Start Manual Entry
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  )

  const renderUploadStep = () => {
    if (uploadMethod === "critter") {
      return (
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2 header-font">Syncing Critter Data</h2>
          <p className="text-muted-foreground body-font mb-6">
            Connecting to your Critter account and importing customer data...
          </p>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: "75%" }} />
          </div>
          <p className="text-sm text-muted-foreground mt-2 body-font">This may take a few moments...</p>
        </div>
      )
    }

    if (uploadMethod === "file") {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 header-font">Upload Your Data File</h2>
            <p className="text-muted-foreground body-font">
              Select a CSV file containing your customer and pet information.
            </p>
          </div>

          <Card className="border-border mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="professionalId" className="body-font">
                    Professional ID *
                  </Label>
                  <Input
                    id="professionalId"
                    value={professionalId}
                    onChange={(e) => setProfessionalId(e.target.value)}
                    placeholder="Enter your Professional ID"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1 body-font">
                    Your Professional ID is required to associate the uploaded data with your account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!uploadedFile ? (
            <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 header-font">Drop your CSV file here</h3>
                  <p className="text-muted-foreground body-font mb-4">or click to browse your computer</p>
                  <Button onClick={() => fileInputRef.current?.click()}>Choose File</Button>
                  <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-medium header-font">{uploadedFile.name}</h3>
                    <p className="text-sm text-muted-foreground body-font">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  {isUploading && (
                    <div className="text-right">
                      <p className="text-sm font-medium body-font">{uploadProgress}%</p>
                      <div className="w-20 bg-muted rounded-full h-1">
                        <div
                          className="bg-primary h-1 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {uploadError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="body-font">{uploadError}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="body-font">
                <strong>CSV Format:</strong> Make sure your CSV file includes columns for customer name, email, phone,
                and pet information. The first row should contain column headers.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )
    }

    if (uploadMethod === "manual") {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 header-font">Add Customer Manually</h2>
            <p className="text-muted-foreground body-font">
              Enter customer and pet information directly into the system.
            </p>
          </div>

          <Card className="border-border">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName" className="body-font">
                    Customer Name *
                  </Label>
                  <Input id="customerName" placeholder="John Smith" />
                </div>
                <div>
                  <Label htmlFor="customerEmail" className="body-font">
                    Email Address *
                  </Label>
                  <Input id="customerEmail" type="email" placeholder="john@email.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerPhone" className="body-font">
                    Phone Number
                  </Label>
                  <Input id="customerPhone" placeholder="555-0123" />
                </div>
                <div>
                  <Label htmlFor="petName" className="body-font">
                    Pet Name *
                  </Label>
                  <Input id="petName" placeholder="Buddy" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petType" className="body-font">
                    Pet Type *
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="rabbit">Rabbit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="petBreed" className="body-font">
                    Breed
                  </Label>
                  <Input id="petBreed" placeholder="Golden Retriever" />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="body-font">
                  Notes
                </Label>
                <Textarea id="notes" placeholder="Any special notes about the customer or pet..." />
              </div>

              <div className="flex space-x-4">
                <Button className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep("preview")}>
                  Preview Added Customers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  const renderPreviewStep = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 header-font">Preview Your Data</h2>
        <p className="text-muted-foreground body-font">Review the imported data before sending it for processing.</p>
      </div>

      <Card className="border-border mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="header-font">Data Preview</CardTitle>
              <CardDescription className="body-font">{previewData.length} records found</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {previewData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {Object.keys(previewData[0]).map((key) => (
                      <th key={key} className="text-left p-2 header-font capitalize">
                        {key.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="p-2 body-font">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 5 && (
                <p className="text-sm text-muted-foreground mt-2 body-font">
                  Showing first 5 of {previewData.length} records
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground body-font">No data to preview</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("select")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Source Selection
        </Button>
        <Button
          onClick={async () => {
            const success = await sendDataToWebhook()
            if (success) {
              setCurrentStep("complete")
            }
          }}
          disabled={previewData.length === 0 || !professionalId.trim()}
        >
          Upload {previewData.length} Records
          <Check className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold mb-2 header-font">Import Complete!</h2>
      <p className="text-muted-foreground body-font mb-6">
        Successfully imported {previewData.length} customers into your CRM system.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <h3 className="font-medium mb-1 header-font">Customers Added</h3>
            <p className="text-2xl font-bold text-primary">{previewData.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <h3 className="font-medium mb-1 header-font">Ready for Campaigns</h3>
            <p className="text-2xl font-bold text-green-500">{previewData.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => router.push("/pro/crm/customers")} className="flex-1">
          View Customer List
        </Button>
        <Button variant="outline" onClick={() => router.push("/pro/crm/campaigns")} className="flex-1">
          Create Campaign
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-4 flex flex-col page-content">
          <div className="text-center mb-8">
            <Button variant="ghost" onClick={() => router.push("/pro/crm")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to CRM Hub
            </Button>
            <h1 className="text-3xl md:text-4xl title-font mb-4 text-foreground">Data Upload Portal</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto body-font">
              Import your customer and pet data to start building targeted email campaigns
            </p>
          </div>

          {renderStepIndicator()}

          <div className="flex-1">
            {currentStep === "select" && renderSelectSource()}
            {currentStep === "upload" && renderUploadStep()}
            {currentStep === "preview" && renderPreviewStep()}
            {currentStep === "complete" && renderCompleteStep()}
          </div>
        </div>
      </main>
    </div>
  )
}
