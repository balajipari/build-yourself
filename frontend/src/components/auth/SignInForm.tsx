import React, { useState } from 'react';
import { authService } from '../../services/auth';

const SignInForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the Google OAuth URL from our backend
      const authUrl = await authService.getGoogleAuthUrl();
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Google Sign-in error:', error);
      setError('Failed to initiate Google Sign-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#4285F4] via-[#34A853] via-[#FBBC05] to-[#EA4335] rounded-full blur-[1px] opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:animate-spin-slow"></div>
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="cursor-pointer relative bg-white flex items-center justify-center gap-3 px-4 sm:px-5 py-3 sm:py-4 shadow-md rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#4285f4] rounded-full animate-spin"></div>
          ) : (
            <img src="./src/assets/google.svg" alt="Google" className="w-[18px] h-[18px]" />
          )}
          <span className="text-[14px] sm:text-[16px] font-medium text-[#3c4043]">
            {isLoading ? 'Connecting...' : 'Continue with Google'}
          </span>
        </button>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        By continuing, you agree to our{' '}
        <a href="/terms" className="text-[#8c52ff] hover:text-gray-600 underline">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="text-[#8c52ff] hover:text-gray-600 underline">Privacy Policy</a>
      </div>
    </div>
  );
};

export default SignInForm;
