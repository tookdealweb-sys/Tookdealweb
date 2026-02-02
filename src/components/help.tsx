import React from 'react';
import { Phone, Mail } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="bg-white dark:bg-black py-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Hero */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 dark:text-zinc-400">
            Get in touch with our team
          </p>
          <div className="w-16 h-1 bg-[#00d4ad] mt-4"></div>
        </div>

        {/* Email */}
        <div className="mb-12">
          <div className="flex items-center pb-6 border-b border-gray-200 dark:border-zinc-700">
            <div className="w-12 h-12 rounded-full bg-[#00d4ad]/10 dark:bg-[#00d4ad]/20 flex items-center justify-center mr-4 flex-shrink-0">
              <Mail className="w-5 h-5 text-[#00d4ad]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Email</p>
              <a 
                href="mailto:tookdealofficial@gmail.com" 
                className="text-gray-600 dark:text-zinc-400 hover:text-[#00d4ad] dark:hover:text-[#00e4bd] transition-colors break-all"
              >
                tookdealofficial@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          
          <div className="flex items-center pb-6 border-b border-gray-200 dark:border-zinc-700">
            <div className="w-12 h-12 rounded-full bg-[#00d4ad]/10 dark:bg-[#00d4ad]/20 flex items-center justify-center mr-4 flex-shrink-0">
              <Phone className="w-5 h-5 text-[#00d4ad]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Akhil</p>
              <a 
                href="tel:+919048952562" 
                className="text-gray-600 dark:text-zinc-400 hover:text-[#00d4ad] dark:hover:text-[#00e4bd] transition-colors"
              >
                +91 9048952562
              </a>
            </div>
          </div>

          <div className="flex items-center pb-6 border-b border-gray-200 dark:border-zinc-700">
            <div className="w-12 h-12 rounded-full bg-[#00d4ad]/10 dark:bg-[#00d4ad]/20 flex items-center justify-center mr-4 flex-shrink-0">
              <Phone className="w-5 h-5 text-[#00d4ad]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Surabhil</p>
              <a 
                href="tel:+918301831221" 
                className="text-gray-600 dark:text-zinc-400 hover:text-[#00d4ad] dark:hover:text-[#00e4bd] transition-colors"
              >
                +91 8301831221
              </a>
            </div>
          </div>

          <div className="flex items-center pb-6 border-b border-gray-200 dark:border-zinc-700">
            <div className="w-12 h-12 rounded-full bg-[#00d4ad]/10 dark:bg-[#00d4ad]/20 flex items-center justify-center mr-4 flex-shrink-0">
              <Phone className="w-5 h-5 text-[#00d4ad]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Richard</p>
              <a 
                href="tel:+917510827375" 
                className="text-gray-600 dark:text-zinc-400 hover:text-[#00d4ad] dark:hover:text-[#00e4bd] transition-colors"
              >
                +91 7510827375
              </a>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-zinc-700">
          <p className="text-gray-600 dark:text-zinc-400">
            Our team is available to assist you with any questions about Tookdeal's services.
          </p>
        </div>

      </div>
    </div>
  );
}