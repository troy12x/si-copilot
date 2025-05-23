"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AVAILABLE_MODELS, DatasetSplit } from "@/lib/api-clients";
import DatasetConfig from "@/components/DatasetConfig";
import DatasetViewer from "@/components/DatasetViewer";
import { CustomersSectionDemo } from "@/components/ui/simplified-customers-demo";
import { Footer } from "@/components/ui/fixed-footer";
import { DeepResearchSection } from "@/components/ui/deep-research-section";
import { PricingCalculator } from "@/components/ui/pricing-calculator";
import { HowItWorksSection } from "@/components/ui/how-it-works-section";

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Force a hard redirect to dashboard to ensure proper authentication
      window.location.href = "/dashboard";
    }
  }, [isLoaded, isSignedIn, user, router]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [dataset, setDataset] = useState<{[key: string]: any[]}>({});
  const [error, setError] = useState("");

  const generateDataset = async (config: any) => {
    try {
      setIsGenerating(true);
      setError("");
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate dataset");
      }
      
      setDataset(data.dataset);
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the dataset");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDataset = (splitName?: string) => {
    if (!dataset || Object.keys(dataset).length === 0) return;
    
    let dataToDownload;
    let fileName;
    
    if (splitName) {
      // Download specific split
      dataToDownload = dataset[splitName];
      fileName = `synthetic_dataset_${splitName}.json`;
    } else {
      // Download all splits
      dataToDownload = dataset;
      fileName = "synthetic_dataset_all.json";
    }
    
    if (!dataToDownload) return;
    
    const dataStr = JSON.stringify(dataToDownload, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#F4EDE9'}}>
      {/* Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold" style={{fontFamily: 'var(--font-quincy), serif'}}>
            SI Copilot
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#platform" className="text-black hover:text-gray-700">Platform</a>
            <a href="#solutions" className="text-black hover:text-gray-700">Solutions</a>
            <a href="#research" className="text-black hover:text-gray-700">Research</a>
            <a href="#resources" className="text-black hover:text-gray-700">Resources</a>
          </div>
          <div className="flex space-x-4 items-center">
            <Link
              href="/sign-in"
              className="text-black hover:text-gray-700 px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-8 leading-tight" style={{fontFamily: 'var(--font-quincy), serif'}}>
            The all in one platform for synthetic data
          </h1>
          <p className="text-xl md:text-2xl text-black mb-12 max-w-3xl mx-auto leading-relaxed">
            SI Copilot brings you cutting-edge AI models to generate high-quality synthetic datasets for AI training — all within a single, secure platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/sign-up"
              className="inline-block bg-black text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-gray-800"
            >
              Request a Demo
            </Link>
            <Link
              href="/playground"
              className="inline-block bg-transparent text-black px-8 py-4 rounded-md text-lg font-medium border border-black hover:bg-white/20"
            >
              Try the Playground
            </Link>
          </div>
        </div>
      </div>

      {/* Customers Section */}
      <div className="py-0 -mt-12">
        <CustomersSectionDemo />
      </div>

      {/* Models Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 rounded-xl my-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4" style={{fontFamily: 'var(--font-quincy), serif'}}>
            Purpose built for LLMs
          </h2>
          <p className="text-xl text-black/80 max-w-3xl mx-auto">
            Why use one when you can use your entire army of models?
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto py-8">
          {/* Simple hexagon layout */}
          <div className="relative h-[400px] w-[400px] mx-auto">
            {/* Outer circle */}
            <div className="outer-circle"></div>
            
            {/* Connecting circle */}
            <div className="connecting-circle"></div>
            
            {/* Central black square */}
            <div className="absolute z-10 w-[70px] h-[70px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <img src="https://voideditor.com/openai-logomark.png" alt="OpenAI" className="object-contain" />
              </div>
            </div>
            
            {/* Top hexagon - DeepSeek */}
            <div className="hexagon-orbit orbit-1 ">
              <div className="w-full h-full bg-[#F4EDE9] flex items-center justify-center " 
                style={{
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
                }}>
                <img src="https://voideditor.com/deepseek.png" alt="DeepSeek" className="w-16 h-16 object-contain" style={{ filter: 'brightness(0) invert(0.25)' }} />
              </div>
            </div>
            
            {/* Right hexagon - Meta */}
            <div className="hexagon-orbit orbit-2">
              <div className="w-full h-full bg-[#F4EDE9] flex items-center justify-center" 
                style={{
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
                }}>
                <img src="https://voideditor.com/meta.svg" alt="Meta" className="w-16 h-16 object-contain" style={{ filter: 'brightness(0) invert(0.25)' }} />
              </div>
            </div>
            
            {/* Bottom hexagon - Qwen */}
            <div className="hexagon-orbit orbit-3">
              <div className="w-full h-full bg-[#F4EDE9] flex items-center justify-center" 
                style={{
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
                }}>
                <img src="https://voideditor.com/qwen.png" alt="Qwen" className="w-16 h-16 object-contain" style={{ filter: 'brightness(0) invert(0.25)' }} />
              </div>
            </div>
            
            {/* Left hexagon - Ollama */}
            <div className="hexagon-orbit orbit-4">
              <div className="w-full h-full bg-[#F4EDE9] flex items-center justify-center" 
                style={{
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
                }}>
                <img src="https://voideditor.com/ollama.png" alt="Mistral" className="w-16 h-16 object-contain" style={{ filter: 'brightness(0) invert(0.25)' }} />
              </div>
            </div>
            
            {/* Outer hexagons */}
            {/* Top outer hexagon - Claude */}
            <div className="outer-hexagon outer-orbit-1">
              <div className="w-full h-full bg-[#F4EDE9] flex items-center justify-center" 
                style={{
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
                }}>
                <img src="https://voideditor.com/claude-icon.png" alt="Claude" className="w-16 h-16 object-contain" style={{ filter: 'brightness(0) invert(0.25)' }} />
              </div>
            </div>
            
            {/* Right outer hexagon - Gemini */}
            <div className="outer-hexagon outer-orbit-2">
              <div className="w-full h-full bg-[#F4EDE9] flex items-center justify-center" 
                style={{
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
                }}>
                <img src="https://voideditor.com/gemini.png" alt="Gemini" className="w-16 h-16 object-contain" style={{ filter: 'brightness(0) invert(0.25)' }} />
              </div>
            </div>
            
            {/* Bottom outer hexagon - mistral */}
            <div className="outer-hexagon outer-orbit-3">
              <div className="w-full h-full bg-[#F4EDE9] flex items-center justify-center" 
                style={{
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
                }}>
                <img src="https://voideditor.com/gemma3.png" alt="Cohere" className="w-16 h-16 object-contain" style={{ filter: 'brightness(0) invert(0.25)' }} />
              </div>
            </div>
            
            {/* Left outer hexagon - grok */}
            <div className="outer-hexagon outer-orbit-4">
              <div className="w-full h-full bg-[#F4EDE9] flex items-center justify-center" 
                style={{
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
                }}>
                <img src="https://voideditor.com/grok.png" alt="Llama" className="w-16 h-16 object-contain" style={{ filter: 'brightness(0) invert(0.25)' }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <p className="text-lg text-black/80">
            Language models with reasoning capabilities for effective responses to complex queries. Connect to all major providers through a single API.
          </p>
        </div>
      </div>
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* DeepResearch Section */}
      <DeepResearchSection />
      
      {/* Pricing Calculator Section */}
      <PricingCalculator />
        

     
        
        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-black text-white rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-6" style={{fontFamily: 'var(--font-quincy), serif'}}>
              Ready to transform your AI training data?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Get started with SI Copilot today and see the difference high-quality synthetic data can make.
            </p>
            <Link
              href="/sign-up"
              className="inline-block bg-white text-black px-8 py-4 rounded-md text-lg font-medium hover:bg-gray-100"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      
      {/* Footer Section */}
      <Footer />
      </div>

  );
}
