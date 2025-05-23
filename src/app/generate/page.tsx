"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createDataset, updateDataset } from "@/lib/supabase";
import { getUserSession, getLocalSessionKey } from "@/lib/session-manager";
import Link from "next/link";
import DatasetConfig from "@/components/DatasetConfig";
import DatasetViewer from "@/components/DatasetViewer";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GeneratePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dataset, setDataset] = useState<{[key: string]: any[]}>({});
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [datasetName, setDatasetName] = useState("");
  const [datasetDescription, setDatasetDescription] = useState("");
  
  // State for tracking token usage and cost
  const [tokenUsage, setTokenUsage] = useState<{
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null>(null);
  
  const [costCalculation, setCostCalculation] = useState<{
    promptCost: number;
    completionCost: number;
    totalCost: number;
  } | null>(null);
  
  // State for tracking generation progress
  const [generationProgress, setGenerationProgress] = useState<{
    current: number;
    total: number;
    split?: string;
  } | null>(null);
  
  // State for editing existing datasets
  const [isEditing, setIsEditing] = useState(false);
  const [editingDatasetId, setEditingDatasetId] = useState<string | undefined>();
  const [initialConfig, setInitialConfig] = useState<any>(null);
  
  // Flag to track if we're loading from localStorage
  const [isLoadingFromTemp, setIsLoadingFromTemp] = useState(false);
  
  // Load existing dataset data if we're editing or from localStorage with session ID
  useEffect(() => {
    const loadEditingDataset = async () => {
      // Only proceed if the user is signed in
      if (!isLoaded || !isSignedIn || !user) return;
      
      try {
        // Check if we have parameters in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const editDatasetId = urlParams.get('edit');
        const urlSessionId = urlParams.get('session');
        
        // If session ID is in URL but not in sessionStorage, store it
        if (urlSessionId && typeof window !== 'undefined' && !sessionStorage.getItem('dataset_session_id')) {
          sessionStorage.setItem('dataset_session_id', urlSessionId);
          console.log('Stored session ID from URL:', urlSessionId);
        }
        
        // Use URL session ID first, then fallback to sessionStorage
        const sessionId = urlSessionId || (typeof window !== 'undefined' ? sessionStorage.getItem('dataset_session_id') : null);
        
        // First check for temporary dataset in localStorage using session ID if available
        const tempDatasetKey = sessionId ? `temp_dataset_${sessionId}` : `temp_dataset_${user.id}`;
        const tempDatasetJson = localStorage.getItem(tempDatasetKey);
        
        if (tempDatasetJson && !editDatasetId) {
          try {
            setIsLoadingFromTemp(true);
            const tempData = JSON.parse(tempDatasetJson);
            
            // Set the dataset data
            if (tempData.dataset) {
              setDataset(tempData.dataset);
            }
            
            // Set the dataset name and description
            if (tempData.name) {
              setDatasetName(tempData.name);
            }
            
            if (tempData.description) {
              setDatasetDescription(tempData.description);
            }
            
            // Set the dataset config
            if (tempData.config) {
              setInitialConfig(tempData.config);
            }
            
            // Set token usage and cost calculation
            if (tempData.tokenUsage) {
              setTokenUsage(tempData.tokenUsage);
            }
            
            if (tempData.costCalculation) {
              setCostCalculation(tempData.costCalculation);
            }
            
            console.log('Loaded temporary dataset from localStorage');
          } catch (parseErr) {
            console.error('Error parsing temporary dataset:', parseErr);
            // Clear invalid data
            localStorage.removeItem(tempDatasetKey);
          } finally {
            setIsLoadingFromTemp(false);
          }
        } else if (editDatasetId) {
          // Load the dataset directly from Supabase
          const { getDatasetById } = await import('@/lib/supabase');
          const editingDataset = await getDatasetById(editDatasetId);
          
          if (editingDataset) {
            // Set the dataset data
            if (editingDataset.data) {
              setDataset(editingDataset.data);
            }
            
            // Set the dataset name and description
            if (editingDataset.name) {
              setDatasetName(editingDataset.name);
            }
            
            if (editingDataset.description) {
              setDatasetDescription(editingDataset.description);
            }
            
            // Set the dataset config for the DatasetConfig component
            if (editingDataset.config) {
              setInitialConfig(editingDataset.config);
            }
            
            // Set editing state
            setIsEditing(true);
            setEditingDatasetId(editingDataset.id);
          }
        }
      } catch (err) {
        console.error('Error loading dataset:', err);
        setError('Failed to load dataset');
      }
    };
    
    // Load when the component mounts and user is authenticated
    loadEditingDataset();
  }, [isLoaded, isSignedIn, user]);

  // Helper function to generate simulated items for visual feedback
  const generateSimulatedItem = (config: any) => {
    const item: any = {};
    
    // Generate a field for each column in the config
    if (config.columns && Array.isArray(config.columns)) {
      config.columns.forEach((col: any) => {
        if (col.name) {
          switch (col.type) {
            case 'number':
              item[col.name] = Math.floor(Math.random() * 1000);
              break;
            case 'boolean':
              item[col.name] = Math.random() > 0.5;
              break;
            case 'array':
              item[col.name] = Array(Math.floor(Math.random() * 5) + 1)
                .fill(0)
                .map(() => Math.random().toString(36).substring(2, 8));
              break;
            case 'object':
              item[col.name] = { key: Math.random().toString(36).substring(2, 8) };
              break;
            case 'string':
            default:
              item[col.name] = `Sample ${col.name} ${Math.random().toString(36).substring(2, 10)}`;
          }
        }
      });
    }
    
    return item;
  };

  const generateDataset = async (config: any) => {
    try {
      setIsGenerating(true);
      setError("");
      
      // Reset dataset, token usage, and cost calculation
      if (!isEditing) {
        setDataset({});
      }
      
      // Always reset token usage and cost for new generation
      setTokenUsage(null);
      setCostCalculation(null);
      
      // Initialize progress tracking
      const totalSamples = config.numSamples;
      const splits = config.splits || [{ name: 'train', percentage: 100 }];
      
      // Initialize the dataset structure with empty arrays for each split
      const initialDataset: {[key: string]: any[]} = {};
      for (const split of splits) {
        initialDataset[split.name] = [];
      }
      
      // If we're not editing, set the initial empty dataset structure
      if (!isEditing) {
        setDataset(initialDataset);
      }
      
      // Determine batch size based on total samples
      // For small datasets (≤10), use a single API call
      // For larger datasets, use batches of 5 items for better UI feedback
      const SMALL_DATASET_THRESHOLD = 10;
      const BATCH_SIZE = 5; // Fixed batch size of 5 items per batch for larger datasets
      
      // Process each split
      for (const split of splits) {
        const splitItemCount = Math.max(1, Math.floor((split.percentage / 100) * totalSamples));
        
        // Set initial progress for this split
        setGenerationProgress({
          current: 0,
          total: splitItemCount,
          split: split.name
        });
        
        // Create placeholder items for the entire split
        const placeholders: any[] = [];
        
        // Create placeholders for all items in this split
        for (let i = 0; i < splitItemCount; i++) {
          let placeholderItem: any = { 
            id: `${split.name}-${i}`, 
            status: "Generating..."
            };
            
            // Check if this is a Q&A type dataset
            if (config.useCase && config.useCase.toLowerCase().includes("qa") || 
                config.columns && config.columns.some((col: any) => 
                  col.name === "input" || col.name === "output" || 
                  col.name === "question" || col.name === "answer")) {
              // For Q&A datasets, use these standard fields
              placeholderItem = {
                id: `${split.name}-${i}`,
                status: "Generating...",
                input: "Generating...",
                output: "Generating..."
              };
            } else {
              // For other dataset types, add "Generating..." for each column defined in the config
              if (config.columns && Array.isArray(config.columns)) {
                config.columns.forEach((col: any) => {
                  if (col.name) {
                    placeholderItem[col.name] = "Generating...";
                  }
                });
              }
            }
            
            placeholders.push(placeholderItem);
          }
          
          // Add all placeholders to the dataset
          setDataset(prev => {
            const updated = { ...prev };
            if (!updated[split.name]) {
              updated[split.name] = [];
            }
            updated[split.name] = [...updated[split.name], ...placeholders];
            return updated;
          });
          
          // Determine if we should use a single API call or batched calls
          const useSingleCall = splitItemCount <= SMALL_DATASET_THRESHOLD;
          
          if (useSingleCall) {
            // SINGLE API CALL APPROACH FOR SMALL DATASETS
            // Create a configuration for generating all samples in this split at once
            const batchConfig = {
              ...config,
              numSamples: splitItemCount,
              splits: [{ name: split.name, percentage: 100 }]
            };
            
            // Make a single API call to generate all items for this split
            const response = await fetch("/api/generate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(batchConfig),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
              throw new Error(data.error || "Failed to generate items");
            }
            
            // Update token usage and cost calculation if available
            if (data.dataset.tokenUsage) {
              setTokenUsage(prevTokens => {
                if (!prevTokens) return data.dataset.tokenUsage;
                return {
                  promptTokens: prevTokens.promptTokens + data.dataset.tokenUsage.promptTokens,
                  completionTokens: prevTokens.completionTokens + data.dataset.tokenUsage.completionTokens,
                  totalTokens: prevTokens.totalTokens + data.dataset.tokenUsage.totalTokens
                };
              });
            }
            
            if (data.dataset.costCalculation) {
              setCostCalculation(prevCost => {
                if (!prevCost) return data.dataset.costCalculation;
                return {
                  promptCost: prevCost.promptCost + data.dataset.costCalculation.promptCost,
                  completionCost: prevCost.completionCost + data.dataset.costCalculation.completionCost,
                  totalCost: prevCost.totalCost + data.dataset.costCalculation.totalCost
                };
              });
            }
            
            // Get the real items from the response
            const realItems = data.dataset[split.name] || [];
            
            // Replace the placeholders with real items
            setDataset(prev => {
              const updated = { ...prev };
              const items = [...updated[split.name]];
              
              // Replace each placeholder with its corresponding real item
              for (let i = 0; i < Math.min(realItems.length, splitItemCount); i++) {
                items[i] = { id: `${split.name}-${i}`, ...realItems[i] };
              }
              
              updated[split.name] = items;
              return updated;
            });
            
            // Update progress to show all items are complete
            setGenerationProgress({
              current: splitItemCount,
              total: splitItemCount,
              split: split.name
            });
          } else {
            // BATCHED APPROACH FOR LARGER DATASETS
            // For datasets larger than the threshold, process in fixed-size batches
            let remainingItems = splitItemCount;
            let startIndex = 0;
            
            // Set up retry parameters
            const MAX_RETRIES = 3; // Maximum number of retry attempts per batch
            const INITIAL_BACKOFF = 1000; // Initial backoff in milliseconds (1 second)
            
            // Variable to track the current batch size, defined outside loops for wider scope
            let currentBatchSize = 0;
            
            // Process each batch until we've generated all items
            while (remainingItems > 0) {
              // Determine the size of this batch (always BATCH_SIZE except for the last batch)
              currentBatchSize = Math.min(BATCH_SIZE, remainingItems);
              
              try {
                // Create a configuration for this batch
                const batchConfig = {
                  ...config,
                  numSamples: currentBatchSize,
                  splits: [{ name: split.name, percentage: 100 }]
                };
              
                // Update progress to show which batch we're working on
                setGenerationProgress({
                  current: splitItemCount - remainingItems,
                  total: splitItemCount,
                  split: split.name
                });
              
                // Initialize retry variables
                let retryCount = 0;
                let success = false;
                let data: any = null;
                let rateLimited = false;
                
                // Try to generate this batch with retries and exponential backoff
                while (retryCount <= MAX_RETRIES && !success) {
                try {
                  // If this is a retry and we were rate limited, wait with exponential backoff
                  if (retryCount > 0) {
                    const backoffTime = INITIAL_BACKOFF * Math.pow(2, retryCount - 1);
                    console.log(`Retry ${retryCount}/${MAX_RETRIES} for batch. Waiting ${backoffTime}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                  }
                  
                  // Make an API call to generate this batch
                  const response = await fetch("/api/generate", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(batchConfig),
                  });
                  
                  data = await response.json();
                  
                  if (!response.ok) {
                    // Check if this is a rate limit error
                    if (response.status === 429 || (data.error && data.error.toLowerCase().includes('rate'))) {
                      rateLimited = true;
                      throw new Error("Rate limited by API");
                    }
                    throw new Error(data.error || "Failed to generate items");
                  }
                  
                  // If we get here, the request was successful
                  success = true;
                } catch (retryError: any) {
                  console.warn(`Batch generation attempt ${retryCount + 1} failed:`, retryError.message);
                  retryCount++;
                  
                  // If we've exhausted all retries, rethrow the error
                  if (retryCount > MAX_RETRIES) {
                    throw retryError;
                  }
                }
              }
              
              // If we've tried MAX_RETRIES times and still failed, continue with the next batch
              if (!success) {
                console.error(`Failed to generate batch after ${MAX_RETRIES} retries. Skipping this batch.`);
                remainingItems -= currentBatchSize;
                startIndex += currentBatchSize;
                continue;
              }
                
              // Update token usage and cost calculation if available
              if (data.dataset.tokenUsage) {
                setTokenUsage(prevTokens => {
                  if (!prevTokens) return data.dataset.tokenUsage;
                  return {
                    promptTokens: prevTokens.promptTokens + data.dataset.tokenUsage.promptTokens,
                    completionTokens: prevTokens.completionTokens + data.dataset.tokenUsage.completionTokens,
                    totalTokens: prevTokens.totalTokens + data.dataset.tokenUsage.totalTokens
                  };
                });
              }
              
              if (data.dataset.costCalculation) {
                setCostCalculation(prevCost => {
                  if (!prevCost) return data.dataset.costCalculation;
                  return {
                    promptCost: prevCost.promptCost + data.dataset.costCalculation.promptCost,
                    completionCost: prevCost.completionCost + data.dataset.costCalculation.completionCost,
                    totalCost: prevCost.totalCost + data.dataset.costCalculation.totalCost
                  };
                });
              }
                
              // Get the real items from the response
              const realItems = data.dataset[split.name] || [];
              
              // Replace the placeholders with real items for this batch
              setDataset(prev => {
                const updated = { ...prev };
                const items = [...updated[split.name]];
                
                // Replace each placeholder with its corresponding real item
                for (let i = 0; i < Math.min(realItems.length, currentBatchSize); i++) {
                  const globalIndex = startIndex + i;
                  items[globalIndex] = { id: `${split.name}-${globalIndex}`, ...realItems[i] };
                }
                
                // If we got fewer items than expected, fill in the missing ones with defaults
                if (realItems.length < currentBatchSize) {
                  for (let i = realItems.length; i < currentBatchSize; i++) {
                    const globalIndex = startIndex + i;
                    const placeholderItem = items[globalIndex];
                    const defaultItem: any = { id: placeholderItem.id };
                    
                    // Add default values for each field based on the item's structure
                    Object.keys(placeholderItem).forEach(key => {
                      if (key !== 'id' && key !== 'status') {
                        if (placeholderItem[key] === "Generating...") {
                          if (key === 'input') {
                            defaultItem[key] = `Sample ${placeholderItem.id}`;
                          } else if (key === 'output') {
                            defaultItem[key] = `Generated content for ${placeholderItem.id}`;
                          } else {
                            defaultItem[key] = `Generated ${key} for ${placeholderItem.id}`;
                          }
                        } else {
                          defaultItem[key] = placeholderItem[key];
                        }
                      }
                    });
                    
                    items[globalIndex] = defaultItem;
                  }
                }
                
                updated[split.name] = items;
                return updated;
              });
              
              // Update progress after this batch is complete
              setGenerationProgress({
                current: splitItemCount - remainingItems + currentBatchSize,
                total: splitItemCount,
                split: split.name
              });
              
              // Update for next iteration
              remainingItems -= currentBatchSize;
              startIndex += currentBatchSize;
              
              // Small delay between batches to allow UI updates
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (batchError: any) {
              console.error(`Error generating batch for ${split.name}:`, batchError);
              // Continue with the next batch rather than failing the entire process
              remainingItems -= currentBatchSize;
              startIndex += currentBatchSize;
            }
          
          }
        } 
          
          // Save to localStorage after all items in this split are generated
          if (user) {
            try {
              // Get the session ID from URL parameter first, then fallback to sessionStorage
              const urlParams = new URLSearchParams(window.location.search);
              const urlSessionId = urlParams.get('session');
              const sessionId = urlSessionId || (typeof window !== 'undefined' ? sessionStorage.getItem('dataset_session_id') : null);
              
              // Use session ID if available, otherwise fall back to user ID
              const tempDatasetKey = sessionId ? `temp_dataset_${sessionId}` : `temp_dataset_${user.id}`;
              
              setDataset(prev => {
                const tempData = {
                  dataset: prev,
                  config,
                  name: datasetName || config.useCase?.split(' ').slice(0, 5).join(' ') || 'Untitled Dataset',
                  description: datasetDescription || config.useCase || '',
                  tokenUsage: tokenUsage,
                  costCalculation: costCalculation
                };
                localStorage.setItem(tempDatasetKey, JSON.stringify(tempData));
                console.log('Saved temporary dataset with key:', tempDatasetKey);
                return prev;
              });
            } catch (storageErr) {
              console.error('Error saving to localStorage:', storageErr);
            }
          }
          
       
      }
      
      // Remove the "status" field from all items now that generation is complete
      setDataset(prev => {
        const finalDataset = { ...prev };
        Object.keys(finalDataset).forEach(splitName => {
          finalDataset[splitName] = finalDataset[splitName].map((item: any) => {
            const { status, ...rest } = item;
            return rest;
          });
        });
        return finalDataset;
      });
      
      // Set default name and description based on use case
      if (!datasetName && config.useCase) {
        setDatasetName(config.useCase.split(' ').slice(0, 5).join(' '));
      }
      
      if (!datasetDescription && config.useCase) {
        setDatasetDescription(config.useCase);
      }
      
      setIsGenerating(false);
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the dataset");
      setIsGenerating(false);
    }
  };

  const saveDataset = async () => {
    if (!user || !isSignedIn) return;
    
    if (!datasetName.trim()) {
      setError("Please provide a name for your dataset");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Calculate total rows across all splits
      const totalRows = Object.values(dataset).reduce((sum, split) => sum + split.length, 0);
      
      // Calculate approximate size in bytes (rough estimate)
      const datasetStr = JSON.stringify(dataset);
      const sizeBytes = new Blob([datasetStr]).size;
      
      const datasetData = {
        user_id: user.id,
        name: datasetName,
        description: datasetDescription,
        config: initialConfig || {}, // Save the configuration used to generate the dataset
        data: dataset,
        row_count: totalRows,
        size_bytes: sizeBytes
      };
      
      let savedDataset;
      
      if (isEditing && editingDatasetId) {
        // Update existing dataset
        savedDataset = await updateDataset(editingDatasetId, datasetData);
      } else {
        // Create new dataset
        savedDataset = await createDataset(datasetData);
      }
      
      if (savedDataset && savedDataset.id) {
        // Get the session ID from URL parameter first, then fallback to sessionStorage
        const urlParams = new URLSearchParams(window.location.search);
        const urlSessionId = urlParams.get('session');
        const sessionId = urlSessionId || (typeof window !== 'undefined' ? sessionStorage.getItem('dataset_session_id') : null);
        
        // Clear the temporary dataset from localStorage after successful save
        // Use session ID if available, otherwise fall back to user ID
        const tempDatasetKey = sessionId ? `temp_dataset_${sessionId}` : `temp_dataset_${user.id}`;
        localStorage.removeItem(tempDatasetKey);
        
        // Also clear direct template and useCase values
        localStorage.removeItem('useCase_direct');
        localStorage.removeItem('template_direct');
        
        console.log('Cleared temporary dataset with key:', tempDatasetKey);
        
        router.push(`/datasets/${savedDataset.id}`);
      } else {
        throw new Error("Failed to save dataset");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the dataset");
    } finally {
      setIsSaving(false);
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

  // Show a loading state instead of the sign-in message while authentication is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4EDE9]">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-black rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Only show the sign-in message if we're sure the user isn't authenticated
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4EDE9] text-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="mb-6 text-gray-600">You need to be signed in to generate datasets.</p>
          <Button asChild className="bg-black text-white hover:bg-gray-800">
            <Link href="/">Go to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EDE9] text-black">
      <header className="border-b border-gray-300">
        <div className="max-w-full px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-black" style={{fontFamily: 'var(--font-quincy), serif'}}>SI Copilot</h1>
            <div className="flex items-center ml-3 text-base text-gray-700">
              <span style={{fontFamily: 'var(--font-quincy), serif'}}>Powered by</span>
              <a 
                href="https://venice.ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center mx-1 hover:text-blue-600 transition-colors duration-200"
                title="Visit Venice AI"
              >
                <span className="font-medium" style={{fontFamily: 'var(--font-quincy), serif'}}>Venice AI</span>
                <img 
                  src="https://assets.basehub.com/7ff2dc8c/1d469bb1eed4dffde6e90e57c4286a64/venice.png?width=384&quality=90&format=auto" 
                  alt="Venice Logo" 
                  className="h-7 w-7 object-contain ml-1" 
                />
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild className="text-black border-gray-400 hover:bg-gray-200 hover:text-black rounded-full">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 border border-gray-400 rounded-full overflow-hidden">
                <AvatarImage src={user?.imageUrl || "https://avatars.githubusercontent.com/u/19948365?s=64&v=4"} alt="Profile" />
                <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0) || user?.username?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-black">{user?.firstName || user?.username}</span>

            </div>
            <Button variant="outline" size="sm" asChild className="text-white border-gray-700 hover:bg-gray-800 hover:text-white rounded-full text-black">
              <Link href="/api/auth/signout" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-72px)]">
        {/* Main Content Area for Dataset Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="preview" className="w-full">
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-300 ">
                <TabsTrigger value="preview">Dataset Preview</TabsTrigger>
                <TabsTrigger value="save">Save Dataset</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="preview" className="mt-0">
              <Card className="border border-gray-300 bg-black text-white shadow-md">
                <CardContent className="p-0">
                  <DatasetViewer 
                    dataset={dataset}
                    onDownload={downloadDataset}
                    isGenerating={isGenerating}
                    generationProgress={generationProgress}
                    tokenUsage={tokenUsage}
                    costCalculation={costCalculation}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="save" className="mt-0">
              <Card className="border border-gray-300 bg-black text-white shadow-md">
                <CardHeader>
                  <CardTitle>Save Dataset</CardTitle>
                  <CardDescription>
                    Save your generated dataset to your account for future use.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 flex items-center gap-2 p-3 bg-red-950/20 border border-red-800 text-red-400 rounded-md text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="dataset-name" className="text-sm font-medium">
                        Dataset Name
                      </Label>
                      <Input
                        id="dataset-name"
                        value={datasetName}
                        onChange={(e) => setDatasetName(e.target.value)}
                        placeholder="Enter a name for your dataset"
                        className="border-gray-700 bg-gray-900 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataset-description" className="text-sm font-medium">
                        Description (optional)
                      </Label>
                      <div className="relative">
                        <textarea
                          id="dataset-description"
                          value={datasetDescription}
                          onChange={(e) => setDatasetDescription(e.target.value)}
                          rows={4}
                          className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
                          placeholder="Enter a description for your dataset"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                          {datasetDescription.length} characters
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t border-gray-800 pt-6">
                  <div className="text-sm text-gray-400">
                    {Object.keys(dataset).length > 0 ? 
                      `${Object.values(dataset).flat().length} total records across ${Object.keys(dataset).length} splits` : 
                      "No data to save yet"}
                  </div>
                  <Button 
                    onClick={saveDataset} 
                    disabled={isSaving || Object.keys(dataset).length === 0}
                    variant={isEditing ? "default" : "secondary"}
                    size="lg"
                    className="min-w-[150px] transition-all duration-200 ease-in-out hover:bg-white hover:text-black active:scale-95 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none group cursor-pointer hover:cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 group-hover:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        {isEditing ? (
                          <>
                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Update Dataset
                          </>
                        ) : (
                          <>
                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Dataset
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Sidebar for Dataset Configuration */}
        <div className="w-[450px] border-l border-gray-300 p-6 overflow-y-auto bg-[#F4EDE9] text-white">
          <div className="sticky top-0">
            
            <div className="space-y-6">
              <DatasetConfig 
                onGenerate={generateDataset}
                isGenerating={isGenerating}
                error={error}
                initialConfig={initialConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
