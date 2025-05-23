'use client';
import React from 'react';
import { Globe, Clock, Sparkles } from 'lucide-react';

export function DeepResearchSection() {
  return (
    <div className="py-24 w-full" style={{ backgroundColor: '#F4EDE9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-black mb-6" style={{fontFamily: 'var(--font-quincy), serif'}}>
            SI Agent
          </h2>
          <p className="text-xl text-black/80 max-w-3xl mx-auto">
            Access real-time data from across the internet with intelligent agents that keep your AI up-to-date
          </p>
        </div>

        {/* Feature cards with improved design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-black rounded-3xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <div className="h-2 bg-[#000]"></div>
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#F4EDE9] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4" style={{fontFamily: 'var(--font-quincy), serif'}}>
                Real time Web Access
              </h3>
              <p className="text-white/80 text-lg">
                AI can now access the latest information from across the internet, including Twitter/X, news sites, and other real-time data sources to provide the most current insights.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-black rounded-3xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <div className="h-2 bg-[#000]"></div>
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#F4EDE9] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4" style={{fontFamily: 'var(--font-quincy), serif'}}>
                Scheduled AI Agents
              </h3>
              <p className="text-white/80 text-lg">
                Schedule intelligent agents to automatically update your data from specific sources at regular intervals, ensuring your information is always current and relevant.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-black rounded-3xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <div className="h-2 bg-[#000]"></div>
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#F4EDE9] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4" style={{fontFamily: 'var(--font-quincy), serif'}}>
                Enhanced Decision Making
              </h3>
              <p className="text-white/80 text-lg">
                Make better decisions with AI that's informed by the latest data. SI Agent ensures your AI has access to the most current information for accurate, timely responses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
