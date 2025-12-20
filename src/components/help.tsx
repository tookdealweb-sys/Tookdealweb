import React from 'react';
import { Phone, Mail } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Hero */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-slate-600">
            Get in touch with our team
          </p>
          <div className="w-16 h-1 bg-blue-600 mt-4"></div>
        </div>

        {/* Email */}
        <div className="mb-12">
          <div className="flex items-center pb-6 border-b border-slate-200">
            <Mail className="w-5 h-5 text-slate-400 mr-4" />
            <div>
              <p className="text-lg font-semibold text-slate-900 mb-1">Email</p>
              <a href="mailto:tookdealofficial@gmail.com" className="text-slate-600 hover:text-blue-600 transition-colors">
                tookdealofficial@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          
          <div className="flex items-center pb-6 border-b border-slate-200">
            <Phone className="w-5 h-5 text-slate-400 mr-4" />
            <div>
              <p className="text-lg font-semibold text-slate-900">Akhil</p>
              <a href="tel:+919048952562" className="text-slate-600 hover:text-blue-600 transition-colors">
                +91 9048952562
              </a>
            </div>
          </div>

          <div className="flex items-center pb-6 border-b border-slate-200">
            <Phone className="w-5 h-5 text-slate-400 mr-4" />
            <div>
              <p className="text-lg font-semibold text-slate-900">Surabhil</p>
              <a href="tel:+918301831221" className="text-slate-600 hover:text-blue-600 transition-colors">
                +91 8301831221
              </a>
            </div>
          </div>

          <div className="flex items-center pb-6 border-b border-slate-200">
            <Phone className="w-5 h-5 text-slate-400 mr-4" />
            <div>
              <p className="text-lg font-semibold text-slate-900">Richard</p>
              <a href="tel:+917510827375" className="text-slate-600 hover:text-blue-600 transition-colors">
                +91 7510827375
              </a>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-600">
            Our team is available to assist you with any questions about Tookdeal's services.
          </p>
        </div>

      </div>
    </div>
  );
}