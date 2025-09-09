import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo.png';
import image1 from '../../assets/image-1.png';
import image2 from '../../assets/image-2.png';

interface CarouselImage {
  id: number;
  src: string;
  alt: string;
  title: string;
  description: string;
}

const ImageCarousel: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselImages: CarouselImage[] = [
    {
      id: 1,
      src: logo, 
      alt: 'Professional motorcycle design interface showing custom bike creation',
      title: 'Transform Your Dream Bike into Reality',
      description: 'Experience the future of motorcycle design with our AI-powered customization platform'
    },
    {
      id: 2,
      src: image2, 
      alt: 'AI-assisted motorcycle customization process demonstration',
      title: 'Expert Design at Your Fingertips',
      description: 'Get professional guidance and instant visualization of your custom motorcycle design'
    },
    {
      id: 3,
      src: image1,
      alt: 'Showcase of various custom motorcycle designs from classic to modern',
      title: 'Your Vision, Our Expertise',
      description: 'Create anything from vintage cruisers to modern sport bikes with precision and ease'
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
    <section className=" py-16" role="region" aria-label="Welcome Carousel">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Centered Image */}
          <div className="relative">
            <picture className="block w-80 h-80">
              <img
                src={carouselImages[currentImageIndex].src} // Use the imported image source directly
                alt={carouselImages[currentImageIndex].alt}
                className="w-full h-full object-contain"
                loading="eager"
                fetchPriority="high"
              />
            </picture>
          </div>
          
          {/* Text Content */}
          <article className="text-center text-black max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              {carouselImages[currentImageIndex].title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xl mx-auto">
              {carouselImages[currentImageIndex].description}
            </p>
          </article>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8">
          <nav 
            className="flex space-x-2"
            aria-label="Carousel Navigation"
          >
            {carouselImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                aria-label={`Go to slide ${index + 1}: ${image.title}`}
                aria-current={index === currentImageIndex ? 'true' : 'false'}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-black' 
                    : 'bg-black bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
};

export default ImageCarousel;