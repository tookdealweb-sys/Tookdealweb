import React from 'react';

export default function AboutPage() {
  return (
    <div className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Hero */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Stop Wandering. Start Connecting.
          </h1>
          <div className="w-16 h-1 bg-blue-600"></div>
        </div>

        {/* Mission */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Mission</h2>
          
          <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
            <p>
              At Tookdeal, we are redefining local commerce by putting your city's directory in the palm of your hand. We aim to eliminate the everyday friction of shopping: the hours lost in gridlock, the stress of finding parking, and the disappointment of arriving at a store only to find the product you need isn't there.
            </p>
            
            <p>
              We replace assumption with certainty. For shoppers, Tookdeal allows you to verify availability before you start your engine—saving you time, fuel, and frustration. For local merchants lacking a digital footprint, we provide the visibility needed to be seen by the neighbors who need them most.
            </p>
            
            <p className="font-medium text-slate-900">
              We bridge the gap so you can navigate your city with confidence.
            </p>
          </div>
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">For Shoppers</h3>
            <ul className="space-y-3 text-slate-700">
              <li>• Verify product availability before you leave</li>
              <li>• Save time, fuel, and frustration</li>
              <li>• Navigate your city with confidence</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">For Merchants</h3>
            <ul className="space-y-3 text-slate-700">
              <li>• Gain digital visibility effortlessly</li>
              <li>• Connect with local customers</li>
              <li>• Be discovered by neighbors who need you</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}