"use client"

type OnboardingFormData = {
  name: string
  email: string
  phone: string
}

type NewCustomerOnboardingFormProps = {
  formData: OnboardingFormData
  onChange: (data: OnboardingFormData) => void
  onSubmit: () => void
}

export default function NewCustomerOnboardingForm({ formData, onChange, onSubmit }: NewCustomerOnboardingFormProps) {
  const handleChange = (field: keyof OnboardingFormData, value: string) => {
    onChange({
      ...formData,
      [field]: value,
    })
  }

  return (
    <div className="mt-5 mb-6 bg-white p-4 rounded-lg shadow-sm">
      <p className="text-sm text-gray-600 mb-4 body-font font-medium">
        Please provide your information to get started:
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 header-font">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 header-font">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 header-font">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
            placeholder="(123) 456-7890"
          />
        </div>

        <button
          onClick={onSubmit}
          className="w-full bg-[#745E25] text-white border-none py-2 px-4 rounded-full cursor-pointer font-medium text-sm transition-colors duration-300 hover:bg-[#5d4b1e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(116,94,37,0.3)] body-font"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
