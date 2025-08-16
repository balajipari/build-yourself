import React from 'react';
import ImageCarousel from '../components/auth/ImageCarousel';
import SignInForm from '../components/auth/SignInForm';

const SignIn: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image Carousel */}
      <div className="w-2/3 bg-gray-900">
        <ImageCarousel />
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="w-1/3 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <SignInForm />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
