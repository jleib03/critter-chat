"use client"

import { useState } from "react"
import Header from "../../components/header"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"

export default function CustomerHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const onboardingSteps = [
    {
      title: "Setting Up Your Account",
      description:
        "Learn how to get started with Critter by completing the new customer intake process and creating your account. This video covers the difference between the web-based customer hub and the mobile app, and how to properly link them using the same email address.",
      videoEmbed: `<div style="position: relative; padding-bottom: 64.86486486486486%; height: 0;"><iframe src="https://www.loom.com/embed/f484131c75df496ab126134fd04ee837?sid=679e6a69-7e56-44b6-9422-ba9a5282ac94" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>`,
    },
    {
      title: "Creating New Bookings and Booking Requests",
      description:
        "Discover the two ways to create bookings with your pet professionals: through the online booking experience and directly through the Critter app. Learn about the difference between direct bookings and booking requests, and how to manage your appointments.",
      videoEmbed: `<div style="position: relative; padding-bottom: 64.86486486486486%; height: 0;"><iframe src="https://www.loom.com/embed/c4b2536f682c42cf97feb0883e58cab4?sid=3d2cc996-8833-4681-9541-87be05276909" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>`,
    },
    {
      title: "Updating Pet Information and Care Plan",
      description:
        "Deep dive into managing your pet's profile including general details, health information, medications, and food preferences. Learn how to create comprehensive care plans with feeding schedules, medication instructions, and special care requirements for your pet professionals.",
      videoEmbed: `<div style="position: relative; padding-bottom: 64.86486486486486%; height: 0;"><iframe src="https://www.loom.com/embed/5a6c9112fd6c4bf9af4fdb867ca177b5?sid=d10a37b9-ad9a-411d-8710-474a1bd3744d" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>`,
    },
    {
      title: "Pet Timeline and Paying Invoices",
      description:
        "Explore the timeline feature to see real-time updates and photos from your pet's activities. Learn how to view and pay invoices through the app, manage payment methods, and understand the different invoice statuses and payment options available.",
      videoEmbed: `<div style="position: relative; padding-bottom: 64.86486486486486%; height: 0;"><iframe src="https://www.loom.com/embed/28b6edd7c39a4816a52eab3b7bdaa2fe?sid=92f3a750-ebba-475e-99c5-76e2d8bff04e" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>`,
    },
  ]

  const faqs = [
    {
      question: "How do I link my app account with my customer hub?",
      answer:
        "Use the same email address when creating your app account that you used during your initial onboarding process. The system will automatically link your accounts and sync your information. It's crucial to use the exact same email for both the web-based customer hub and the mobile app.",
    },
    {
      question: "What's the difference between the customer hub and the Critter app?",
      answer:
        "The customer hub is a web-based portal where you can view appointments, invoices, and basic pet information. The Critter app provides full functionality including detailed pet care plans, real-time timeline updates, in-app payments, and booking requests. Both require the same email address to stay linked.",
    },
    {
      question: "Why do I need to download the app if I have the customer hub?",
      answer:
        "While the customer hub provides basic information viewing, the app is required for updating detailed pet care information, creating comprehensive care plans, viewing real-time timeline updates with photos, and paying invoices. Many features are app-only.",
    },
    {
      question: "Can I book appointments through both the web and the app?",
      answer:
        "Yes, but the methods differ. The web booking allows for direct bookings (if your professional enables it), while the app only allows booking requests that require professional confirmation. Your professional will specify which method they prefer.",
    },
    {
      question: "What if I can't see my pet information after creating an account?",
      answer:
        "Make sure you're using the exact same email address for both your customer hub and app account. If you completed intake online first, that information should appear in the app once you sign up with the same email. Contact support if the linking doesn't work automatically.",
    },
    {
      question: "How do I update my pet's care plan and detailed information?",
      answer:
        "Detailed pet information including care plans, medication schedules, feeding instructions, and health records can only be updated through the Critter mobile app. Navigate to your pet's profile in the app to access all these features.",
    },
    {
      question: "Where can I see real-time updates during my pet's service?",
      answer:
        "The timeline feature in the Critter app provides real-time updates, photos, and after-action reports from your pet professionals. You can filter by specific pets and view both past activities and upcoming scheduled services.",
    },
    {
      question: "How do I pay invoices and what payment methods are accepted?",
      answer:
        "Invoice payment is handled through the Critter app only. Navigate to the menu tab and select invoices to view and pay outstanding bills. We accept major credit cards and the payment is processed securely within the app.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#333] mb-4">Customer Help & FAQs</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get started with your Critter account and find answers to common questions about using our platform.
          </p>
        </div>

        {/* Account Setup Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#333] mb-8 text-center">Account Setup & Onboarding</h2>
          <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
            Follow these step-by-step video guides to set up your Critter account and get the most out of our platform.
            Remember to use the same email address you used during your initial onboarding process.
          </p>

          <div className="space-y-8">
            {onboardingSteps.map((step, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-[#333] mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <div dangerouslySetInnerHTML={{ __html: step.videoEmbed }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-3xl font-bold text-[#333] mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-medium text-[#333] pr-4">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>

                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="mt-16 text-center">
          <div className="bg-[#E75837] bg-opacity-10 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-[#333] mb-4">Still Need Help?</h3>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help you get the most out of Critter.
            </p>
            <a
              href="mailto:support@critter.pet"
              className="inline-block bg-[#E75837] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#d64a2f] transition-colors"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
