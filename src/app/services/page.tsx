import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import DashboardPage from "@/components/service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
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
