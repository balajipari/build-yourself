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
      src: '/assets/bike-showcase-1.webp',
      alt: 'Professional motorcycle design interface showing custom bike creation',
      title: 'Transform Your Dream Bike into Reality',
      description: 'Experience the future of motorcycle design with our AI-powered customization platform'
    },
    {
      id: 2,
      src: '/assets/bike-showcase-2.webp',
      alt: 'AI-assisted motorcycle customization process demonstration',
      title: 'Expert Design at Your Fingertips',
      description: 'Get professional guidance and instant visualization of your custom motorcycle design'
    },
    {
      id: 3,
      src: '/assets/bike-showcase-3.webp',
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
    <section className="h-full" role="region" aria-label="Welcome Carousel">
      {/* Main Image */}
      <div className="relative w-full h-full">
        <picture>
          <source
            srcSet={`${carouselImages[currentImageIndex].src.replace('.webp', '.avif')}`}
            type="image/avif"
          />
          <source
            srcSet={carouselImages[currentImageIndex].src}
            type="image/webp"
          />
          <img
            src={carouselImages[currentImageIndex].src.replace('.webp', '.jpg')}
            alt={carouselImages[currentImageIndex].alt}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
        
        {/* Overlay with text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <article className="text-center text-black px-4 sm:px-8 max-w-[90%] sm:max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              {carouselImages[currentImageIndex].title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-md sm:max-w-xl mx-auto">
              {carouselImages[currentImageIndex].description}
            </p>
          </article>
        </div>
      </div>

      {/* Dots Indicator */}
      <nav 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2"
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
    </section>
  );
};

export default ImageCarousel;
