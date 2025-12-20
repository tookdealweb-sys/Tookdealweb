import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import DashboardPage from "@/components/help";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help",
};
export default function page() {
  return (
    <div>
      <section>
        <Header />
      </section>
      <section>
        <main>
          <DashboardPage />
        </main>
      </section>
      <section>
        <Footer />
      </section>
    </div>
  );
}
