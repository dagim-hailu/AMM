"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LoginForm } from '@amm/auth-ui';

export default function LoginPage() {
  const router = useRouter();
  const { login, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Ministry of Agriculture Appointment System
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Secure access for authorized personnel
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-green-100">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900">Sign in to your account</h3>
            <p className="text-sm text-gray-600 mt-1">
              Enter your credentials to access the admin dashboard
            </p>
          </div>
          
          <LoginForm 
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error || undefined}
          />

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p className="font-medium">Ministry of Agriculture Security Notice</p>
              <p className="mt-1 text-xs">
                This system contains confidential information. Unauthorized access is prohibited.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need access? Contact the system administrator at{' '}
            <a href="mailto:admin@agriculture.gov.et" className="font-medium text-green-600 hover:text-green-500">
              admin@agriculture.gov.et
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}