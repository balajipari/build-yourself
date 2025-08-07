import React from 'react';

interface ImageResultProps {
  imageBase64: string;
}

const ImageResult: React.FC<ImageResultProps> = ({ imageBase64 }) => {
  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Custom Bike is Ready!</h2>
        <p className="text-gray-600">Here's your dream motorcycle, designed just for you</p>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
        <img
          src={`data:image/png;base64,${imageBase64}`}
          alt="Your Custom Bike"
          className="rounded-lg shadow-lg max-w-full h-auto mx-auto"
          style={{ maxHeight: '400px' }}
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>✨ Generated with AI based on your preferences</p>
      </div>
    </div>
  );
};

export default ImageResult;