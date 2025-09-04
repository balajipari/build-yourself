import React from 'react';
import ImageCarousel from '../components/auth/ImageCarousel';
import SignInForm from '../components/auth/SignInForm';

const SignIn: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative">
        {/* Brand Logo and Name */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
          <img 
            src="./assets/logo.png" 
            alt="Build it Yourself Logo" 
            className="w-12 h-12 object-contain"
          />
          <div className="text-black">
            <h1 className="text-xl font-bold leading-tight">
              Build it Yourself
            </h1>
          </div>
        </div>

        {/* Image Carousel */}
        <ImageCarousel />
      </div>

      {/* Sign In Form */}
      <div className="flex justify-center items-center py-8 bg-white">
        <SignInForm />
      </div>
    </div>
  );
};

export default SignIn;
