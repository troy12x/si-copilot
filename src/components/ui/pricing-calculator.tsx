'use client';
import React, { useState, useRef, useEffect } from 'react';
import './range-slider.css'; // We'll create this CSS file next

// Define model data with pricing information
const modelData = [
  { id: 'llama4', name: 'Llama 4', price: 0.24, image: 'https://voideditor.com/meta.svg' },
  { id: 'gpt4o', name: 'GPT-4o', price: 0.24, image: 'https://voideditor.com/openai-logomark.png' },
  { id: 'claude', name: 'Claude', price: 0.24, image: 'https://voideditor.com/claude-icon.png' },
  { id: 'gemini', name: 'Gemini', price: 0.24, image: 'https://voideditor.com/gemini.png' },
  { id: 'deepseek', name: 'Deepseek', price: 0.24, image: 'https://voideditor.com/deepseek.png' },
  { id: 'grok', name: 'Grok', price: 0.24, image: 'https://voideditor.com/grok.png' },
];

export function PricingCalculator() {
  // State for selected models, tokens, and rows
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [tokensPerRequest, setTokensPerRequest] = useState(1000);
  const [rowsPerMonth, setRowsPerMonth] = useState(1000);
  
  // Refs for the range sliders
  const tokensSliderRef = useRef<HTMLInputElement>(null);
  const rowsSliderRef = useRef<HTMLInputElement>(null);
  
  // Refs for drag and drop
  const dragItem = useRef<any>(null);
  const dragOverItem = useRef<any>(null);
  
  // Calculate total price per million tokens
  const totalPricePerMillion = selectedModels.reduce((total, modelId) => {
    const model = modelData.find(m => m.id === modelId);
    return total + (model?.price || 0);
  }, 0);
  
  // Calculate monthly cost
  const monthlyTokens = (tokensPerRequest * rowsPerMonth) / 1000000; // Convert to millions
  const monthlyCost = totalPricePerMillion * monthlyTokens;

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, modelId: string) => {
    dragItem.current = modelId;
    e.dataTransfer.setData('text/plain', modelId);
  };

  // Handle drop in selected area
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const modelId = e.dataTransfer.getData('text/plain');
    
    // Only add if not already selected
    if (!selectedModels.includes(modelId)) {
      setSelectedModels([...selectedModels, modelId]);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle removing a model from selection
  const handleRemoveModel = (modelId: string) => {
    setSelectedModels(selectedModels.filter(id => id !== modelId));
  };

  // Update slider progress bar
  const updateSliderProgress = (slider: HTMLInputElement) => {
    if (!slider) return;
    
    const min = parseInt(slider.min) || 0;
    const max = parseInt(slider.max) || 100;
    const value = parseInt(slider.value) || 0;
    const percentage = ((value - min) / (max - min)) * 100;
    
    // Ensure the gradient transition is sharp for better visual effect
    slider.style.background = `linear-gradient(to right, #000 0%, #000 ${percentage}%, #e5e5e5 ${percentage}%, #e5e5e5 100%)`;
  };
  
  // Handle tokens slider change
  const handleTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setTokensPerRequest(value);
    updateSliderProgress(e.target);
  };
  
  // Handle rows slider change
  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setRowsPerMonth(value);
    updateSliderProgress(e.target);
  };
  
  // Initialize sliders on component mount and when values change
  useEffect(() => {
    if (tokensSliderRef.current) {
      updateSliderProgress(tokensSliderRef.current);
    }
    if (rowsSliderRef.current) {
      updateSliderProgress(rowsSliderRef.current);
    }
  }, [tokensPerRequest, rowsPerMonth]);

  return (
    <div className="py-24 w-full" style={{ backgroundColor: '#F4EDE9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-black mb-6" style={{fontFamily: 'var(--font-quincy), serif'}}>
            Pricing Calculator
          </h2>
          <p className="text-xl text-black/80 max-w-3xl mx-auto">
            Drag and drop models to calculate your usage-based pricing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Model Selection Panel */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-2xl font-semibold text-black mb-4" style={{fontFamily: 'var(--font-quincy), serif'}}>
              Available Models
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {modelData.map((model) => (
                <div 
                  key={model.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, model.id)}
                  className="bg-[#F4EDE9] rounded-xl p-4 cursor-move flex flex-col items-center transition-transform hover:scale-105"
                >
                  <div className="w-16 h-16 flex items-center justify-center mb-2">
                    <img 
                      src={model.image} 
                      alt={model.name} 
                      className="w-12 h-12 object-contain"
                      style={{ filter: 'brightness(0) invert(0.25)' }}
                    />
                  </div>
                  <p className="text-black font-medium text-center">{model.name}</p>
                  <p className="text-black/70 text-sm">${model.price}/1M tokens</p>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Models and Calculator */}
          <div className="lg:col-span-2">
            {/* Selected Models Area */}
            <div 
              className="bg-black rounded-3xl p-6 shadow-lg mb-6 min-h-[200px]"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <h3 className="text-2xl font-semibold text-white mb-4" style={{fontFamily: 'var(--font-quincy), serif'}}>
                Your Selected Models
              </h3>
              
              {selectedModels.length === 0 ? (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-white/30 rounded-xl">
                  <p className="text-white/70">Drag models here to add them to your calculation</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedModels.map((modelId) => {
                    const model = modelData.find(m => m.id === modelId);
                    return model ? (
                      <div key={model.id} className="bg-white/10 rounded-xl p-4 flex flex-col items-center relative">
                        <button 
                          onClick={() => handleRemoveModel(model.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
                        >
                          ×
                        </button>
                        <div className="w-12 h-12 flex items-center justify-center mb-2">
                          <img 
                            src={model.image} 
                            alt={model.name} 
                            className="w-10 h-10 object-contain"
                            style={{ filter: 'brightness(0) invert(1)' }}
                          />
                        </div>
                        <p className="text-white text-sm font-medium text-center">{model.name}</p>
                        <p className="text-white/70 text-xs">${model.price}/1M tokens</p>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Calculator Controls */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h3 className="text-2xl font-semibold text-black mb-4" style={{fontFamily: 'var(--font-quincy), serif'}}>
                Usage Calculator
              </h3>
              
              <div className="space-y-6">
                {/* Tokens per request slider */}
                <div>
                  <label className="block text-black font-medium mb-2">
                    Tokens per request: {tokensPerRequest.toLocaleString()}
                  </label>
                  <input 
                    type="range" 
                    min="100" 
                    max="10000" 
                    step="100"
                    value={tokensPerRequest}
                    onChange={handleTokensChange}
                    ref={tokensSliderRef}
                    className="custom-range-slider w-full h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                {/* Rows per month slider */}
                <div>
                  <label className="block text-black font-medium mb-2">
                    Number of rows: {rowsPerMonth.toLocaleString()}
                  </label>
                  <input 
                    type="range" 
                    min="100" 
                    max="100000" 
                    step="100"
                    value={rowsPerMonth}
                    onChange={handleRowsChange}
                    ref={rowsSliderRef}
                    className="custom-range-slider w-full h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                {/* Results */}
                <div className="bg-[#F4EDE9] rounded-xl p-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-black font-medium">Price per 1M tokens:</span>
                    <span className="text-black font-bold">${totalPricePerMillion.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-black font-medium">Total tokens:</span>
                    <span className="text-black">{(monthlyTokens).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-black font-medium">Estimated cost:</span>
                    <span className="text-black font-bold">${monthlyCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
