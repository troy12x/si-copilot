"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getDatasetById } from "@/lib/supabase";
import Link from "next/link";
import { Dataset } from "@/lib/supabase";
import DatasetViewer from "@/components/DatasetViewer";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DatasetDetailPage({ params }: { params: { id: string } }) {
  // Unwrap the params Promise using React.use()
  // Cast params to the correct type for use()
  const unwrappedParams = use(params as any) as { id: string };
  const datasetId = unwrappedParams.id;
  
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDataset() {
      if (isLoaded && isSignedIn && user) {
        setIsLoading(true);
        const datasetData = await getDatasetById(datasetId);
        setDataset(datasetData);
        setIsLoading(false);
      }
    }

    loadDataset();
  }, [isLoaded, isSignedIn, user, datasetId]);

  // Function to handle editing the dataset
  const handleEditDataset = () => {
    if (!dataset) return;
    
    // Navigate to the generate page with the dataset ID as a query parameter
    router.push(`/generate?edit=${dataset.id}`);
  };

  const downloadDataset = (splitName?: string) => {
    if (!dataset || !dataset.data) return;
    
    let dataToDownload;
    let fileName;
    
    if (splitName && dataset.data[splitName]) {
      // Download specific split
      dataToDownload = dataset.data[splitName];
      fileName = `${dataset.name}_${splitName}.json`;
    } else {
      // Download all splits
      dataToDownload = dataset.data;
      fileName = `${dataset.name}_all.json`;
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

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center">
          <p className="text-black dark:text-white">Please sign in to view this dataset</p>
          <Link href="/sign-in" className="mt-4 inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black dark:text-white">SI Copilot</h1>
          <div className="flex items-center space-x-4">
            <span className="text-black dark:text-white">{user.firstName || user.username}</span>
            <Link href="/api/auth/signout" className="text-sm bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            {dataset && (
              <h1 className="text-2xl font-bold text-black dark:text-white mt-2">{dataset.name}</h1>
            )}
          </div>
          
          {dataset && (
            <Button 
              onClick={handleEditDataset}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Edit Dataset
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg p-6 shadow-sm text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading dataset...</p>
          </div>
        ) : dataset ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Dataset Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-black dark:text-white">{dataset.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-black dark:text-white">{new Date(dataset.created_at!).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rows</p>
                  <p className="text-black dark:text-white">{dataset.row_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Size</p>
                  <p className="text-black dark:text-white">{formatBytes(dataset.size_bytes)}</p>
                </div>
              </div>
            </div>

            <DatasetViewer dataset={dataset.data} onDownload={downloadDataset} />
          </div>
        ) : (
          <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg p-6 shadow-sm text-center">
            <p className="text-gray-500 dark:text-gray-400">Dataset not found or you don't have permission to view it.</p>
            <Link href="/dashboard" className="mt-4 inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded text-sm hover:bg-gray-800 dark:hover:bg-gray-200">
              Return to Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
