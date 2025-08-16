import React from 'react';

const SignInForm: React.FC = () => {
  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign-in
    console.log('Google Sign-in clicked');
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo/Brand */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-[#8c52ff] to-[#8c52ff]/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Dream Bike Builder</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          Sign in to start creating your perfect motorcycle with AI-powered customization
        </p>
      </div>

      {/* Sign In Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Get Started</h2>
          <p className="text-gray-500 text-sm">Choose your preferred sign-in method</p>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-2xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#8c52ff]/20 focus:border-[#8c52ff] group cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-medium">Continue with Google</span>
        </button>

        {/* Terms - Right below the Google button */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#8c52ff] hover:text-[#8c52ff]/80 underline cursor-pointer">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-[#8c52ff] hover:text-[#8c52ff]/80 underline cursor-pointer">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Benefits Section - Inside the card */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4 text-center">Why choose us?</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#8c52ff] rounded-full"></div>
              <span className="text-sm text-gray-600">AI-powered customization</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#8c52ff] rounded-full"></div>
              <span className="text-sm text-gray-600">Professional quality results</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#8c52ff] rounded-full"></div>
              <span className="text-sm text-gray-600">Fast and efficient process</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          Need help?{' '}
          <a href="#" className="text-[#8c52ff] hover:text-[#8c52ff]/80 font-medium cursor-pointer">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
