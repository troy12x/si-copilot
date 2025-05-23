'use client';
import React, { useState, useEffect } from 'react';

// Animation sequence for the typing effect
const TYPING_SEQUENCE = [
  { text: "Generate a dataset of foundational math problems including algebra, geometry, and basic calculus with solutions", delay: 600 },
  { text: "Create a dataset of reusable React.js component patterns for dashboards, forms, and modals with props and state examples", delay: 600 },
  { text: "Generate Python code snippets and explanations for common tasks like file handling, data structures, and API calls", delay: 2600 },
];

export function HowItWorksSection() {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const startNextSequence = () => {
      setIsDeleting(false);
      setIsTyping(true);
      setCharIndex(0);
      setSequenceIndex((sequenceIndex + 1) % TYPING_SEQUENCE.length);
    };

    // Handle typing animation
    if (isTyping && !isDeleting) {
      if (charIndex < TYPING_SEQUENCE[sequenceIndex].text.length) {
        timeout = setTimeout(() => {
          setDisplayText(prev => prev + TYPING_SEQUENCE[sequenceIndex].text.charAt(charIndex));
          setCharIndex(charIndex + 1);
        }, 80); // Slightly faster typing speed
      } else {
        // Finished typing current sequence
        timeout = setTimeout(() => {
          setIsTyping(false);
          setIsDeleting(true);
        }, TYPING_SEQUENCE[sequenceIndex].delay);
      }
    }

    // Handle deleting animation
    if (isDeleting) {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
        }, 40); // Even faster deleting speed
      } else {
        // Add a small pause before starting to type the next sequence
        timeout = setTimeout(() => {
          startNextSequence();
        }, 400);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, displayText, isDeleting, isTyping, sequenceIndex]);

  return (
    <div className="py-24 w-full" style={{ backgroundColor: '#F4EDE9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-black mb-6" style={{fontFamily: 'var(--font-quincy), serif'}}>
            How It Works
          </h2>
          <p className="text-xl text-black/80 max-w-3xl mx-auto">
            Generate custom datasets with a simple prompt and get high-quality AI-generated data in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side: Chat UI with typing animation */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-black p-4 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-white text-sm font-medium ml-4">SI Copilot</div>
            </div>
            
            <div className="p-6 h-80 flex flex-col">
              <div className="flex-grow flex flex-col justify-end">
                <div className="bg-[#F4EDE9] rounded-2xl p-4 mb-4 max-w-[80%] self-start">
                  <p className="text-black">What kind of dataset would you like to generate?</p>
                </div>
                
                <div className="bg-black rounded-2xl p-4 max-w-[80%] self-end">
                  <p className="text-white font-medium">
                    {displayText}
                    <span className={`inline-block w-[2px] h-5 bg-white ml-[1px] ${isDeleting ? 'animate-pulse' : 'animate-blink'}`}></span>
                  </p>
                </div>
              </div>
              
              <div className="mt-4 relative">
                <input 
                  type="text" 
                  className="w-full bg-[#F4EDE9] border-none rounded-full py-3 px-6 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Type your prompt here..."
                  disabled
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Right side: Steps */}
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold mr-4 flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-2" style={{fontFamily: 'var(--font-quincy), serif'}}>
                  Describe Your Dataset
                </h3>
                <p className="text-black/80">
                  Simply describe the type of dataset you need in natural language. Our AI understands your requirements and generates a suitable structure.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold mr-4 flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-2" style={{fontFamily: 'var(--font-quincy), serif'}}>
                  Customize And  Refine
                </h3>
                <p className="text-black/80">
                  Review the suggested structure and make adjustments if needed. Add specific fields, constraints, or examples to guide the generation process.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold mr-4 flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-2" style={{fontFamily: 'var(--font-quincy), serif'}}>
                  Generate And Download
                </h3>
                <p className="text-black/80">
                  Our AI generates high-quality, diverse data based on your specifications. Download your dataset in JSON format or integrate directly with your application.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
