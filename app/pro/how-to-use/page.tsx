"use client"

const HowToUsePage = () => {
  return (
    <div className="min-h-screen bg-[#FBF8F3] py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">How to Use Critter Professional Tools</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Setting Up Your Landing Page</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your landing page is your digital storefront on Critter. It's where potential customers can learn about your
            services, view your contact information, and book appointments.
          </p>
          <ol className="list-decimal pl-6 text-gray-700 leading-relaxed">
            <li>
              <strong>Access the Setup Page:</strong> Navigate to the "Professional Setup" page from your Critter
              dashboard.
            </li>
            <li>
              <strong>Enter Business Name:</strong> Enter your business name exactly as it appears in your Critter
              account. This helps us locate your existing profile.
            </li>
            <li>
              <strong>Create Custom URL:</strong> Create a unique, easy-to-share URL for your landing page. Use only
              letters, numbers, hyphens, and underscores.
            </li>
            <li>
              <strong>Share Your Link:</strong> Share your custom URL with customers on social media, your website, and
              other marketing channels.
            </li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Configuring Your Schedule</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Setting up your schedule ensures that customers can see your availability and book appointments
            conveniently.
          </p>
          <ol className="list-decimal pl-6 text-gray-700 leading-relaxed">
            <li>
              <strong>Access Schedule Setup:</strong> Click on the "Schedule Setup" tile from the "Professional Setup"
              page.
            </li>
            <li>
              <strong>Enter Professional ID:</strong> Enter your Professional ID to access your schedule configuration.
            </li>
            <li>
              <strong>Set Working Hours:</strong> Define your working hours for each day of the week.
            </li>
            <li>
              <strong>Manage Team Members:</strong> Add and manage your team members, assigning them specific roles and
              working hours.
            </li>
            <li>
              <strong>Set Capacity Rules:</strong> Configure rules for maximum concurrent bookings, buffer time between
              appointments, and more.
            </li>
            <li>
              <strong>Block Time:</strong> Block specific dates and times when you're unavailable for bookings.
            </li>
            <li>
              <strong>Save Configuration:</strong> Save your schedule configuration to apply the changes.
            </li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Setting Up Your Custom Support Agent</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Create a personalized AI support agent trained on your business policies and FAQs to handle customer
            inquiries efficiently.
          </p>
          <ol className="list-decimal pl-6 text-gray-700 leading-relaxed">
            <li>
              <strong>Access Custom Support Agent Setup:</strong> Click on the "Custom Support Agent" tile from the
              "Professional Setup" page.
            </li>
            <li>
              <strong>Enroll Your Business:</strong> Enroll your business to enable the custom support agent feature.
            </li>
            <li>
              <strong>Configure Agent:</strong> Provide information about your business policies, cancellation policy,
              animal restrictions, and more.
            </li>
            <li>
              <strong>Customize Widget:</strong> Customize the appearance of the chat widget to match your brand.
            </li>
            <li>
              <strong>Test Your Agent:</strong> Test your agent by sending test messages and reviewing the responses.
            </li>
            <li>
              <strong>Implement the Agent:</strong> Implement the agent on your landing page by copying the provided
              code snippet.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Need More Help?</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions or need further assistance, please contact our support team at{" "}
            <a href="vercel.com/help" className="text-blue-600 underline">
              vercel.com/help
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}

export default HowToUsePage
