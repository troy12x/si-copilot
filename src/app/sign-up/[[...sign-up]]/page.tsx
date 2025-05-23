"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="w-full max-w-md p-8">
        <h1 className="mb-6 text-2xl font-bold text-center text-black dark:text-white">
          Create your SI Copilot account
        </h1>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200',
              card: 'bg-white dark:bg-black border border-gray-100 dark:border-gray-800',
              headerTitle: 'text-black dark:text-white',
              headerSubtitle: 'text-gray-600 dark:text-gray-400',
              formFieldLabel: 'text-black dark:text-white',
              formFieldInput: 'bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-black dark:text-white',
              footerActionLink: 'text-black dark:text-white hover:text-gray-800 dark:hover:text-gray-200'
            }
          }}
          routing="path"
          path="/sign-up"
        />
      </div>
    </div>
  );
}
