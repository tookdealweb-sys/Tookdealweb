"use client";

import React from "react";
import Link from "next/link";
import { Globe, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Support Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Support</h3>
            <ul className="space-y-4">
              {[
                "Help Centre",
                "How to Search",
                "Account Issues",
                "Listing Guidelines",
                "Reporting Fake Listings",
                "Report Issues",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Businesses Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              For Businesses
            </h3>
            <ul className="space-y-4">
              {[
                "Add Your Shop",
                "Business Dashboard",
                "Ads & Promotions",
                "Verification Help",
                "Shop Management Tips",
                "Join a Free Hosting Class",
                "Business Community Forum",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Company</h3>
            <ul className="space-y-4">
              {[
                "About TookDeal",
                "Investor Relations",
                "Careers",
                "CSR Initiatives",
                "TookDeal Foundation",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
              <span>© 2025 TookDeal Pvt. Ltd</span>
              <div className="flex flex-wrap items-center space-x-6">
                {["Privacy", "Terms", "Sitemap", "Company Info"].map((link) => (
                  <Link
                    key={link}
                    href="#"
                    className="hover:text-gray-900 transition-colors duration-200"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact and Social */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 mt-6 lg:mt-0">
              {/* Support */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span>24×7 Support:</span>
                <a
                  href="tel:+919876543210"
                  className="text-gray-900 font-medium hover:text-blue-600 transition-colors duration-200"
                >
                  +91 98765 43210
                </a>
              </div>

              {/* Social Icons */}
              <div className="flex items-center space-x-3">
                <Link
                  href="#"
                  aria-label="Facebook"
                  className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  aria-label="Twitter"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  aria-label="Instagram"
                  className="text-gray-400 hover:text-pink-600 transition-colors duration-200"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
