import React from 'react';
import ImageCarousel from '../components/auth/ImageCarousel';
import SignInForm from '../components/auth/SignInForm';

const SignIn: React.FC = () => {
  return (
    <div className="h-screen">
      <div className="h-full relative">
        <ImageCarousel />
        <div className="absolute inset-0 flex items-end justify-center pb-25 md:pb-50">
          <SignInForm />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
