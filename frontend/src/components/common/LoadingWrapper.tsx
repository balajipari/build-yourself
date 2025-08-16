import React from 'react';

interface LoadingWrapperProps {
  loading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

// Loading wrapper HOC for managing loading states
export function LoadingWrapper({ 
  loading, 
  children, 
  fallback,
  className = "flex items-center justify-center p-4"
}: LoadingWrapperProps) {
  if (loading) {
    return fallback || (
      <div className={className}>
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Loading...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// HOC wrapper for loading states
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  loadingSelector: (props: P) => boolean,
  fallback?: React.ReactNode
) {
  return function WithLoading(props: P) {
    const isLoading = loadingSelector(props);
    
    return (
      <LoadingWrapper loading={isLoading} fallback={fallback}>
        <Component {...props} />
      </LoadingWrapper>
    );
  };
}
