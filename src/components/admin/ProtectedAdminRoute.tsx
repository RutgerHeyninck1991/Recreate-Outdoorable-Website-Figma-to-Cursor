import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../utils/auth/useAdmin';
import { Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { isAdmin, loading, user } = useAdmin();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-stone-400 mx-auto" />
          <p className="text-stone-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not admin - show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl text-zinc-100">Access Denied</h1>
          <p className="text-zinc-400">
            You don't have permission to access this area. This section is only available to administrators.
          </p>
          <a 
            href="/" 
            className="inline-block mt-4 px-6 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg transition-colors"
          >
            Back to Homepage
          </a>
        </div>
      </div>
    );
  }

  // User is admin - render children
  return <>{children}</>;
}
