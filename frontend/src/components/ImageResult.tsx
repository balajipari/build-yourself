import React from 'react';

interface ImageResultProps {
  imageBase64: string;
}

const ImageResult: React.FC<ImageResultProps> = ({ imageBase64 }) => {
  return (
    <div className="mt-6 flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2">Your Custom Bike</h2>
      <img
        src={`data:image/png;base64,${imageBase64}`}
        alt="Custom Bike"
        className="rounded shadow max-w-full h-auto"
      />
    </div>
  );
};

export default ImageResult;