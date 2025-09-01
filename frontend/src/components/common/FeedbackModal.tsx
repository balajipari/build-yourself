import React, { useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-hot-toast';
import { feedbackService } from '../../services/feedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTION_TAGS = [
  "I love the platform",
  "I love the bikes",
  "Great user experience",
  "Easy to use",
  "Beautiful designs",
  "Helpful features",
  "Amazing customization",
];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!feedbackText.trim() && selectedTags.length === 0) {
      toast.error('Please provide some feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        feedback_text: feedbackText,
        selected_tags: selectedTags,
      });

      toast.success('Thank you for your feedback!');
      setFeedbackText('');
      setSelectedTags([]);
      onClose();
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="w-full max-w-lg rounded-xl bg-white p-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none"
      overlayClassName="fixed inset-0 bg-black/30 flex items-center justify-center p-4"
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Give us feedback</h2>
        
        <div className="flex flex-wrap gap-2">
          {SUGGESTION_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedTags.includes(tag)
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Tell us what you think..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FeedbackModal;
