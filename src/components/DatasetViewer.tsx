"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Add animation styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;

interface DatasetViewerProps {
  dataset: {[key: string]: any[]};
  onDownload: (splitName?: string) => void;
  isGenerating?: boolean;
  generationProgress?: {
    current: number;
    total: number;
    split?: string;
  } | null;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
  costCalculation?: {
    promptCost: number;
    completionCost: number;
    totalCost: number;
  } | null;
}

export default function DatasetViewer({ dataset, onDownload, isGenerating = false, generationProgress, tokenUsage, costCalculation }: DatasetViewerProps) {
  // Find the "train" split or default to the first split
  const getDefaultSplit = () => {
    if (Object.keys(dataset).length === 0) return "";
    return Object.keys(dataset).includes("train") ? "train" : Object.keys(dataset)[0];
  };
  
  const [activeSplit, setActiveSplit] = useState<string>(getDefaultSplit());
  
  // State to track which cells are expanded
  const [expandedCells, setExpandedCells] = useState<{[key: string]: boolean}>({});
  
  // Function to toggle cell expansion
  const toggleCellExpansion = (cellId: string) => {
    setExpandedCells(prev => ({
      ...prev,
      [cellId]: !prev[cellId]
    }));
  };
  
  // Update active split when dataset changes
  useEffect(() => {
    setActiveSplit(getDefaultSplit());
    // Reset expanded cells when dataset changes
    setExpandedCells({});
  }, [dataset]);

  // Add the animation styles to the document
  useEffect(() => {
    // Create style element
    const styleEl = document.createElement('style');
    styleEl.id = 'dataset-viewer-animations';
    styleEl.textContent = animationStyles;
    document.head.appendChild(styleEl);
    
    // Cleanup on unmount
    return () => {
      const existingStyle = document.getElementById('dataset-viewer-animations');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
  
  // If no dataset, show empty state
  if (Object.keys(dataset).length === 0) {
    return (
      <Card className="border border-gray-800 bg-black text-white shadow-md">
        <CardHeader>
          <CardTitle>Dataset Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
            <p className="mb-4">No dataset generated yet</p>
            <p className="text-sm text-center max-w-md">
              Configure your dataset parameters and click "Generate Dataset" to create a synthetic dataset.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-800 bg-black text-white shadow-md">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle>Dataset Viewer</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDownload(activeSplit)}
              className="text-black bg-white border border-gray-300 hover:bg-black hover:text-white"
            >
              Download {activeSplit}
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => onDownload()}
              className="bg-white text-black hover:bg-gray-200 border border-gray-300"
            >
              Download All
            </Button>
          </div>
        </div>
        
        <Tabs value={activeSplit} onValueChange={setActiveSplit} className="mt-4">
          <TabsList className="bg-gray-900 border border-gray-800 ">
            {Object.keys(dataset).map(splitName => (
              <TabsTrigger 
                key={splitName} 
                value={splitName}
                className="data-[state=active]:bg-gray-800"
              >
                {splitName} ({dataset[splitName].length})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="pt-4">
        {dataset[activeSplit] && dataset[activeSplit].length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      #
                    </th>
                    {Object.keys(dataset[activeSplit][0] || {}).map((key) => (
                      <th 
                        key={key} 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-black divide-y divide-gray-800">
                  {dataset[activeSplit].slice(0, 10).map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-950' : 'bg-black'}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-400">
                        {idx + 1}
                      </td>
                      {Object.keys(dataset[activeSplit][0] || {}).map((key) => {
                        const cellId = `${idx}-${key}`;
                        const isExpanded = expandedCells[cellId] || false;
                        
                        // Special handling for formatted data (from custom JSON format)
                        if (key === 'data' && item['formatted'] === true) {
                          const formattedData = JSON.stringify(item[key], null, 2);
                          const isLongContent = formattedData.length > 100;
                          
                          return (
                            <td key={cellId} className="px-4 py-2 text-sm text-white">
                              <div className="flex flex-col">
                                <div className="text-xs text-green-400 mb-1">Custom Formatted Data:</div>
                                <div className={`${isExpanded ? '' : 'max-h-24'} overflow-y-auto transition-all duration-200 ease-in-out font-mono bg-gray-900 p-2 rounded`}>
                                  {isExpanded 
                                    ? formattedData 
                                    : formattedData.substring(0, 300) + (isLongContent ? '...' : '')
                                  }
                                </div>
                                {isLongContent && (
                                  <Button 
                                    onClick={() => toggleCellExpansion(cellId)}
                                    variant="link"
                                    size="sm"
                                    className="mt-1 p-0 h-auto text-xs text-blue-400 hover:text-blue-300"
                                  >
                                    {isExpanded ? 'Show less' : 'Show more'}
                                  </Button>
                                )}
                              </div>
                            </td>
                          );
                        }
                        
                        // Skip internal properties for formatted items
                        if (item['formatted'] === true && (key === 'formatted' || key === 'id')) {
                          return null;
                        }
                        
                        // Get the content as string, handling undefined values
                        let content = "";
                        if (item[key] === undefined) {
                          content = "Generating...";
                        } else if (typeof item[key] === 'object') {
                          content = JSON.stringify(item[key]);
                        } else {
                          content = String(item[key]);
                        }
                        
                        // Check if content is long enough to need expansion
                        const isLongContent = content.length > 100;
                        
                        // Check if this is a generating placeholder
                        const isGenerating = content === "Generating..." || item[key] === undefined;
                        
                        return (
                          <td key={cellId} className="px-4 py-2 text-sm text-white">
                            {isGenerating ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-blue-400 italic">Generating...</span>
                              </div>
                            ) : (
                              <>
                                <div className={`${isExpanded ? '' : 'max-h-24'} overflow-y-auto transition-all duration-200 ease-in-out`}>
                                  {isExpanded 
                                    ? content 
                                    : content.substring(0, 300) + (isLongContent ? '...' : '')}
                                </div>
                                {isLongContent && (
                                  <Button 
                                    onClick={() => toggleCellExpansion(cellId)}
                                    variant="link"
                                    size="sm"
                                    className="mt-1 p-0 h-auto text-xs text-blue-400 hover:text-blue-300"
                                  >
                                    {isExpanded ? 'Show less' : 'Show more'}
                                  </Button>
                                )}
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {dataset[activeSplit].length > 10 && (
              <div className="p-3 bg-gray-900 border-t border-gray-800 text-center text-sm text-gray-400">
                Showing 10 of {dataset[activeSplit].length} items
              </div>
            )}
            
            <div className="mt-4">
              {isGenerating ? (
                <div className="p-4 bg-gray-900 rounded-md border border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-medium text-white">Generating Dataset</h3>
                    {generationProgress && (
                      <span className="text-sm text-gray-400">
                        {generationProgress.current} of {generationProgress.total} items
                        {generationProgress.split && ` (${generationProgress.split})`}
                      </span>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300 ease-in-out" 
                      style={{ 
                        width: generationProgress ? 
                          `${Math.min(100, (generationProgress.current / generationProgress.total) * 100)}%` : 
                          '5%' 
                      }}
                    ></div>
                  </div>
                  
                  {/* Live update of items being generated */}
                  <div className="text-sm text-gray-300 mb-2">
                    {generationProgress?.split && (
                      <span className="font-medium">Current split: {generationProgress.split}</span>
                    )}
                  </div>
                  
                  {/* Live Token Usage and Cost Stats */}
                  {(tokenUsage || costCalculation) && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-md border border-gray-700">
                      <h4 className="text-sm font-medium text-white mb-2">Live Generation Statistics</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {/* Token Usage */}
                        <div className="bg-gray-900 p-2 rounded-md">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-blue-400 font-medium">Tokens</span>
                            <span className="text-white font-mono">{tokenUsage?.totalTokens.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Input: {tokenUsage?.promptTokens.toLocaleString() || 0}</span>
                            <span>Output: {tokenUsage?.completionTokens.toLocaleString() || 0}</span>
                          </div>
                        </div>
                        
                        {/* Cost */}
                        <div className="bg-gray-900 p-2 rounded-md">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-green-400 font-medium">Cost</span>
                            <span className="text-white font-mono">${costCalculation?.totalCost.toFixed(6) || '0.000000'}</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Per Row: ${costCalculation && generationProgress && generationProgress.current > 0 ? (costCalculation.totalCost / generationProgress.current).toFixed(6) : '0.000000'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
 
                  
                  {/* Recent items */}
                  {dataset[activeSplit] && dataset[activeSplit].length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Recent items:</h4>
                      <div className="max-h-[200px] overflow-y-auto space-y-2">
                        {dataset[activeSplit].slice(-5).map((item, idx) => (
                          <div key={idx} className="text-xs p-2 bg-gray-800 rounded border border-gray-700 animate-fadeIn">
                            <table className="w-full text-left">
                              <tbody>
                                {/* Special handling for formatted data */}
                                {item.formatted === true && item.data ? (
                                  <tr className="border-b border-gray-700 last:border-0">
                                    <td className="py-1 pr-2 text-gray-400 font-medium">formatted data</td>
                                    <td className="py-1 text-white">
                                      <div className="bg-gray-800 p-1 rounded text-green-400 font-mono">
                                        {JSON.stringify(item.data).length > 200
                                          ? JSON.stringify(item.data).substring(0, 200) + '...'
                                          : JSON.stringify(item.data)
                                        }
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  // Regular item display
                                  Object.entries(item).filter(([key]) => key !== 'id').map(([key, value]) => (
                                    <tr key={key} className="border-b border-gray-700 last:border-0">
                                      <td className="py-1 pr-2 text-gray-400 font-medium">{key}</td>
                                      <td className="py-1 text-white">
                                        {typeof value === 'string' 
                                          ? value.length > 200 ? value.substring(0, 200) + '...' : value
                                          : JSON.stringify(value).length > 200 
                                            ? JSON.stringify(value).substring(0, 200) + '...'
                                            : JSON.stringify(value)
                                        }
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Full Statistics Dashboard - After generation is complete */}
                  {(tokenUsage || costCalculation) && (
                    <div className="mb-6 p-4 bg-[#030712] rounded-md border border-gray-700">
                      <h3 className="text-md font-medium mb-3 text-white">Generation Statistics</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Token Usage */}
                        {tokenUsage && (
                          <div className="p-3 bg-gray-800 rounded-md">
                            <h4 className="text-sm font-medium text-white mb-2">Token Usage 📊</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Input Tokens:</span>
                                <span className="text-white font-mono">{tokenUsage.promptTokens.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Output Tokens:</span>
                                <span className="text-white font-mono">{tokenUsage.completionTokens.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span className="text-gray-300">Total Tokens:</span>
                                <span className="text-white font-mono">{tokenUsage.totalTokens.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Cost Calculation */}
                        {costCalculation && (
                          <div className="p-3 bg-gray-800 rounded-md">
                            <h4 className="text-sm font-medium text-white mb-2">Cost Calculation 💸</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Input Cost:</span>
                                <span className="text-[#2DE070] font-mono">${costCalculation.promptCost.toFixed(6)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Output Cost:</span>
                                <span className="text-[#2DE070] font-mono">${costCalculation.completionCost.toFixed(6)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span className="text-gray-300">Total Cost:</span>
                                <span className="text-[#2BB062] font-mono">${costCalculation.totalCost.toFixed(6)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Dataset Size Information */}
                      <div className="p-3 bg-gray-800 rounded-md">
                        <h4 className="text-sm font-medium text-white mb-2">Dataset Information ✨</h4>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div className="flex flex-col items-center p-2 bg-[#030712] rounded-md">
                            <span className="text-gray-400 mb-1">Total Rows</span>
                            <span className="text-white font-mono text-lg">
                              {Object.values(dataset).reduce((sum, items) => sum + items.length, 0)}
                            </span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-[#030712] rounded-md">
                            <span className="text-gray-400 mb-1">Splits</span>
                            <span className="text-white font-mono text-lg">{Object.keys(dataset).length}</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-[#030712] rounded-md">
                            <span className="text-gray-400 mb-1">Cost per Row</span>
                            <span className="text-white font-mono text-lg">
                              ${costCalculation && Object.values(dataset).reduce((sum, items) => sum + items.length, 0) > 0 ? (costCalculation.totalCost / Object.values(dataset).reduce((sum, items) => sum + items.length, 0)).toFixed(6) : '0.000000'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-md font-medium mb-2 text-white">Raw JSON</h3>
                  <pre className="text-xs p-4 bg-gray-900 rounded-md overflow-x-auto max-h-[300px] overflow-y-auto border border-gray-800">
                    {JSON.stringify(
                      // Transform the dataset to show formatted data properly
                      dataset[activeSplit].map(item => {
                        // If this is a formatted item, extract and return the formatted data
                        if (item.formatted === true && item.data) {
                          return item.data;
                        }
                        // Otherwise return the original item
                        return item;
                      }), 
                      null, 2
                    )}
                  </pre>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
            <p>No data in this split</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
