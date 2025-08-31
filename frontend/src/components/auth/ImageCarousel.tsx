import React, { useState, useEffect } from 'react';

interface CarouselImage {
  id: number;
  src: string;
  alt: string;
  title: string;
  description: string;
}

const ImageCarousel: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample carousel images - replace with your actual product images
  const carouselImages: CarouselImage[] = [
    {
      id: 1,
      src: '/assets/bike-placeholder.svg',
      alt: 'Custom Bike Design 1',
      title: 'Design Your Dream Bike',
      description: 'Create the perfect motorcycle that matches your style and preferences'
    },
    {
      id: 2,
      src: '/assets/bike-placeholder.svg',
      alt: 'Custom Bike Design 2',
      title: 'AI-Powered Customization',
      description: 'Let artificial intelligence guide you through the perfect bike creation process'
    },
    {
      id: 3,
      src: '/assets/bike-placeholder.svg',
      alt: 'Custom Bike Design 3',
      title: 'Unlimited Possibilities',
      description: 'From classic cruisers to modern sport bikes, the choice is yours'
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="h-full">
      {/* Main Image */}
      <div className="relative w-full h-full">
        <img
          src={carouselImages[currentImageIndex].src}
          alt={carouselImages[currentImageIndex].alt}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay with text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-black px-4 sm:px-8 max-w-[90%] sm:max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              {carouselImages[currentImageIndex].title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-md sm:max-w-xl mx-auto">
              {carouselImages[currentImageIndex].description}
            </p>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentImageIndex 
                ? 'bg-black' 
                : 'bg-black bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
