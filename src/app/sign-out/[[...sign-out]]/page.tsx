"use client";

import { SignOutButton, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();
  const { signOut } = useClerk();

  // Immediately sign out when the page loads
  useEffect(() => {
    const performSignOut = async () => {
      try {
        // Sign out and redirect to home page
        await signOut();
        // Clear any local storage or cookies
        localStorage.clear();
        // Force a hard refresh to clear any cached state
        window.location.href = '/';
      } catch (error) {
        console.error('Error signing out:', error);
        // Fallback to simple redirect
        router.push('/');
      }
    };

    performSignOut();
  }, [signOut, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white">Signing you out...</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we clear your session.</p>
        </div>
        
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
