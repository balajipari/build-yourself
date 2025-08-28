import React, { useState } from 'react';
import { FaHandHoldingHeart } from 'react-icons/fa';
import FeedbackModal from './FeedbackModal';

const FeedbackButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2 z-50"
      >
        <FaHandHoldingHeart className="w-5 h-5" />
        <span>Support us</span>
      </button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default FeedbackButton;
