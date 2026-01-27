import React from 'react';
import { Search, MapPin, Store, Bell, Shield, Zap } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Hero */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Our Services
          </h1>
          <p className="text-xl text-slate-600 dark:text-zinc-400">
            Connecting shoppers and merchants through smart, local solutions
          </p>
          <div className="w-16 h-1 bg-[#00d4ad] mt-4"></div>
        </div>

        {/* Services Grid */}
        <div className="space-y-12">
          
          {/* Service 1 */}
          {/* <div className="border-l-4 border-[#00d4ad] pl-6">
            <div className="flex items-center mb-3">
              <Search className="w-6 h-6 text-[#00d4ad] mr-3" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Real-Time Product Search</h2>
            </div>
            <p className="text-lg text-slate-700 dark:text-zinc-300 leading-relaxed">
              Search for products across local stores instantly. Find exactly what you need, where you need it, before making the trip. Our intelligent search connects you with nearby merchants who have your item in stock.
            </p>
          </div> */}

          {/* Service 2 */}
          <div className="border-l-4 border-purple-600 dark:border-purple-500 pl-6">
            <div className="flex items-center mb-3">
              <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-500 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Location-Based Discovery</h2>
            </div>
            <p className="text-lg text-slate-700 dark:text-zinc-300 leading-relaxed">
              Discover stores and services in your neighborhood. Get accurate directions, store hours, and contact information all in one place. Navigate your city like never before.
            </p>
          </div>

          {/* Service 3 */}
          <div className="border-l-4 border-green-600 dark:border-green-500 pl-6">
            <div className="flex items-center mb-3">
              <Store className="w-6 h-6 text-green-600 dark:text-green-500 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Merchant Listings</h2>
            </div>
            <p className="text-lg text-slate-700 dark:text-zinc-300 leading-relaxed">
              For local businesses, we offer easy-to-manage digital storefronts. List your products, update availability, and reach customers actively searching for what you sell—all without the need for a website.
            </p>
          </div>

          {/* Service 4 */}
          <div className="border-l-4 border-orange-600 dark:border-orange-500 pl-6">
            <div className="flex items-center mb-3">
              <Bell className="w-6 h-6 text-orange-600 dark:text-orange-500 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Availability Alerts</h2>
            </div>
            <p className="text-lg text-slate-700 dark:text-zinc-300 leading-relaxed">
              Never miss out on what you need. Set up notifications for specific products and get alerted when they become available at nearby stores. Stay informed, shop smarter.
            </p>
          </div>

          {/* Service 5 */}
          <div className="border-l-4 border-red-600 dark:border-red-500 pl-6">
            <div className="flex items-center mb-3">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-500 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verified Information</h2>
            </div>
            <p className="text-lg text-slate-700 dark:text-zinc-300 leading-relaxed">
              Trust in accurate, up-to-date information. We work directly with merchants to ensure product availability, pricing, and store details are always current and reliable.
            </p>
          </div>

          {/* Service 6 */}
          <div className="border-l-4 border-indigo-600 dark:border-indigo-500 pl-6">
            <div className="flex items-center mb-3">
              <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-500 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Instant Connect</h2>
            </div>
            <p className="text-lg text-slate-700 dark:text-zinc-300 leading-relaxed">
              Connect with merchants directly through our platform. Call, message, or get directions with a single tap. Make your shopping experience seamless from search to purchase.
            </p>
          </div>

        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-slate-50 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Ready to Transform Your Shopping Experience?
          </h3>
          <p className="text-lg text-slate-600 dark:text-zinc-400">
            Join thousands of shoppers and merchants connecting through Tookdeal
          </p>
        </div>

      </div>
    </div>
  );
}