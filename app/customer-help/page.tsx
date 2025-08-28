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
      title: "Step 1: Download the Critter App",
      description:
        "Get started by downloading the Critter app from the App Store or Google Play Store. Make sure to use the same email address you used during your initial onboarding process.",
      videoUrl: "https://www.youtube.com/embed/placeholder1", // Replace with actual video URL
    },
    {
      title: "Step 2: Create Your Account",
      description:
        "Sign up for your Critter account using the same email address from your onboarding. This will automatically link your account with your customer hub information.",
      videoUrl: "https://www.youtube.com/embed/placeholder2", // Replace with actual video URL
    },
    {
      title: "Step 3: Complete Your Profile",
      description:
        "Add your pet information, preferences, and any special instructions to help your pet care professionals provide the best service.",
      videoUrl: "https://www.youtube.com/embed/placeholder3", // Replace with actual video URL
    },
    {
      title: "Step 4: Book Your First Service",
      description:
        "Learn how to browse available services, select your preferred professional, and book your first appointment through the app.",
      videoUrl: "https://www.youtube.com/embed/placeholder4", // Replace with actual video URL
    },
    {
      title: "Step 5: Manage Your Bookings",
      description:
        "Discover how to view upcoming appointments, reschedule services, communicate with your pet care professional, and track your service history.",
      videoUrl: "https://www.youtube.com/embed/placeholder5", // Replace with actual video URL
    },
  ]

  const faqs = [
    {
      question: "How do I link my app account with my customer hub?",
      answer:
        "Simply use the same email address when creating your app account that you used during your initial onboarding process. The system will automatically link your accounts and sync your information.",
    },
    {
      question: "What if I can't remember the email I used for onboarding?",
      answer:
        "Contact our support team and we'll help you identify the correct email address associated with your customer hub account.",
    },
    {
      question: "Can I change my email address after linking accounts?",
      answer:
        "Yes, you can update your email address in the app settings. However, please contact support to ensure your customer hub remains properly linked.",
    },
    {
      question: "Why isn't my customer hub information showing in the app?",
      answer:
        "Make sure you're using the exact same email address for both accounts. If the issue persists, try logging out and back in, or contact our support team.",
    },
    {
      question: "How do I book my first service?",
      answer:
        "After setting up your account and profile, navigate to the 'Book Service' section, select your desired service type, choose a professional, and pick an available time slot.",
    },
    {
      question: "Can I reschedule or cancel appointments through the app?",
      answer:
        "Yes, you can reschedule or cancel appointments directly through the app up to 24 hours before your scheduled service time.",
    },
    {
      question: "How do I communicate with my pet care professional?",
      answer:
        "The app includes a built-in messaging feature that allows you to communicate directly with your assigned professional before, during, and after services.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept all major credit cards, debit cards, and digital payment methods like Apple Pay and Google Pay through the app.",
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
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    {/* Replace with actual embedded video */}
                    <iframe
                      src={step.videoUrl}
                      title={step.title}
                      className="w-full h-full rounded-lg"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
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
