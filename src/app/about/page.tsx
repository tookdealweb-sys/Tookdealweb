import React from 'react'
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about tookdeal - your trusted platform for discovering the best local businesses and deals in your area.",
};
export default function page() {
  return (
    <div>
        <Header />
      About page
        <Footer />
    </div>
  )
}
