"use client";

import { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { getUserDatasets, getUserStats, deleteDataset } from '@/lib/supabase';
import { syncUserToSupabase } from '@/lib/sync-user';
import Link from 'next/link';
import { Dataset } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [stats, setStats] = useState({ total_datasets: 0, total_rows: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      if (isLoaded && isSignedIn && user) {
        try {
          setIsLoading(true);
          // Sync the user to Supabase
          console.log('Syncing user to Supabase:', user.id);
          await syncUserToSupabase(user);
          const userDatasets = await getUserDatasets(user.id);
          setDatasets(userDatasets);
          const userStats = await getUserStats(user.id);
          setStats(userStats);
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (isLoaded && !isSignedIn) {
        // If user is not signed in, redirect to home page
        window.location.href = '/';
      }
    }

    loadUserData();
  }, [isLoaded, isSignedIn, user]);

  const handleDeleteDataset = async (id: string) => {
    if (confirm("Are you sure you want to delete this dataset?")) {
      const success = await deleteDataset(id);
      if (success) {
        setDatasets(datasets.filter(dataset => dataset.id !== id));
        setStats(prev => ({
          ...prev,
          total_datasets: prev.total_datasets - 1,
          total_rows: prev.total_rows - (datasets.find(d => d.id === id)?.row_count || 0)
        }));
      }
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center">
          <p className="text-black dark:text-white">Please sign in to access your dashboard</p>
          <Link href="/sign-in" className="mt-4 inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EDE9] dark:bg-black">
      <header className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black dark:text-white"  style={{fontFamily: 'var(--font-quincy), serif'}}>SI Copilot</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700 rounded-full overflow-hidden">
                <AvatarImage src={user?.imageUrl || "https://avatars.githubusercontent.com/u/19948365?s=64&v=4"} alt="Profile" />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0) || user?.username?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-black dark:text-white">{user.firstName || user.username}</span>
            </div>
            <Button variant="outline" size="sm" asChild className="text-black dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <Link href="/sign-out" className="flex items-center gap-2">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-black dark:text-white mb-2"  style={{fontFamily: 'var(--font-quincy), serif'}}>Total Datasets</h2>
            <p className="text-3xl font-bold text-black dark:text-white">{stats.total_datasets}</p>
          </div>
          <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-black dark:text-white mb-2"  style={{fontFamily: 'var(--font-quincy), serif'}}>Total Rows</h2>
            <p className="text-3xl font-bold text-black dark:text-white">{stats.total_rows}</p>
          </div>
          <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-black dark:text-white mb-2"  style={{fontFamily: 'var(--font-quincy), serif'}}>Actions</h2>
            <Link 
              href={(() => {
                // Create a new unique session ID
                const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
                // Store it in sessionStorage
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('dataset_session_id', newSessionId);
                  // Clear any previous direct localStorage values
                  localStorage.removeItem('useCase_direct');
                  localStorage.removeItem('template_direct');
                }
                // Return the URL with the session ID
                return `/generate?session=${newSessionId}`;
              })()}
              className="inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded text-sm hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              Generate New Dataset
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-black dark:text-white"  style={{fontFamily: 'var(--font-quincy), serif'}}>Your Datasets</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">Loading your datasets...</p>
            </div>
          ) : datasets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rows</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black divide-y divide-gray-100 dark:divide-gray-800">
                  {datasets.map((dataset) => (
                    <tr key={dataset.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-white">
                        <Link href={`/datasets/${dataset.id}`} className="hover:underline">
                          {dataset.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {dataset.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {dataset.row_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatBytes(dataset.size_bytes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {new Date(dataset.created_at!).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex space-x-2">
                          <Link href={`/datasets/${dataset.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                            View
                          </Link>
                          <button
                            onClick={() => dataset.id && handleDeleteDataset(dataset.id)}
                            className="text-red-600 dark:text-red-400 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">You haven't created any datasets yet.</p>
              <Link 
                href={(() => {
                  // Create a new unique session ID
                  const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
                  // Store it in sessionStorage
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('dataset_session_id', newSessionId);
                    // Clear any previous direct localStorage values
                    localStorage.removeItem('useCase_direct');
                    localStorage.removeItem('template_direct');
                  }
                  // Return the URL with the session ID
                  return `/generate?session=${newSessionId}`;
                })()}
                className="inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded text-sm hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                Generate Your First Dataset
              </Link>
            </div>
          )}
        </div>
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
