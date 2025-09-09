import React, { useState, useEffect } from 'react';
import { FaHandHoldingHeart } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import FeedbackModal from './FeedbackModal';

const FeedbackButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Optional: Show button again after some time
  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 1800000); // 30 minutes
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 flex items-center gap-2 z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer bg-[#8c52ff] text-sm font-semibold text-white px-3 py-2 rounded-full shadow-lg hover:bg-[#7440e0] transition-colors duration-200 flex items-center gap-2"
        >
          <FaHandHoldingHeart className="w-4 h-4" />
          <span>Send us feedback</span>
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="bg-[#8c52ff] text-white p-1.5 rounded-full shadow-lg hover:bg-[#7440e0] transition-colors duration-200"
          aria-label="Close feedback button"
        >
          <IoMdClose className="w-4 h-4" />
        </button>
      </div>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default FeedbackButton;
