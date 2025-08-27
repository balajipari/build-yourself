import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  
  console.log('🔄 GoogleCallback render:', { isProcessing, error, isAuthenticated });

  useEffect(() => {
    const handleCallback = async () => {
      try {
                 // Check for minimal auth data in URL parameters
         const jwtToken = searchParams.get('jwt_token');
         const userEmail = searchParams.get('user_email');
         const userName = searchParams.get('user_name');
         const error = searchParams.get('error');

         if (error) {
           setError('Authentication was cancelled or failed');
           setIsProcessing(false);
           return;
         }

                  if (jwtToken && userEmail) {
           // Store all auth data
           const accessToken = searchParams.get('access_token');
           const refreshToken = searchParams.get('refresh_token');
           const userId = searchParams.get('user_id');
           const isNewUser = searchParams.get('is_new_user') === 'true';

           localStorage.setItem('jwt_token', jwtToken);
           if (accessToken) localStorage.setItem('access_token', accessToken);
           if (refreshToken) localStorage.setItem('refresh_token', refreshToken);

           const userData = {
             id: userId || userEmail,
             email: userEmail,
             name: userName || userEmail,
             picture: '',
             is_gsuite: false,
             domain: ''
           };
           localStorage.setItem('user_info', JSON.stringify(userData));
           
           // Update authentication context
           login(userData);
           
           // Update local state to stop processing
           setIsProcessing(false);
           
           console.log('Authentication successful, auth context updated');
           return;
         }

         // Fallback: check for authorization code (if backend doesn't redirect)
         const code = searchParams.get('code');
         if (code) {
           console.log('Using fallback code exchange...');
           const authData = await authService.handleGoogleCallback(code);
           // Update authentication context
           login(authData.user_info);
           
           // Update local state to stop processing
           setIsProcessing(false);
           
           console.log('Fallback authentication successful, auth context updated');
           return;
         }

        setError('No authentication data received');
        setIsProcessing(false);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError('Failed to complete authentication. Please try again.');
        setIsProcessing(false);
      }
    };

         handleCallback();
   }, [searchParams, navigate, login]);

   // Watch for authentication state changes and redirect automatically
   useEffect(() => {
     if (isAuthenticated && !isProcessing) {
       console.log('🚀 Auth state changed, redirecting to dashboard...');
       navigate('/dashboard', { replace: true });
       
       // Force redirect after 2 seconds as fallback
       const timeoutId = setTimeout(() => {
         console.log('⏰ Force redirect after timeout');
         window.location.href = '/dashboard';
       }, 2000);
       
       return () => clearTimeout(timeoutId);
     }
   }, [isAuthenticated, isProcessing, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-[#8c52ff] to-[#8c52ff]/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In</h2>
          <p className="text-gray-600 mb-6">Please wait while we complete your authentication...</p>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#8c52ff] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/signin')}
            className="px-6 py-3 bg-[#8c52ff] text-white rounded-lg hover:bg-[#8c52ff]/90 transition-colors duration-200 font-medium cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show success state when authentication is complete
  if (!isProcessing && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Successful!</h2>
          <p className="text-gray-600 mb-6">Redirecting to dashboard...</p>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#8c52ff] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;
