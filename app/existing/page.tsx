"use client"
import { useRouter } from "next/navigation"
import BookingPage from "../../components/booking-page"
import Header from "../../components/header"


// This tells Next.js not to statically optimize this page
export const dynamic = "force-dynamic"


  // Create a default empty userInfo object to prevent build-time errors
  const defaultUserInfo = {
    firstName: "",
    lastName: "",
    email: ""
  }
            <BookingPage userInfo={defaultUserInfo} />
