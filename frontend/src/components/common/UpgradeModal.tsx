import React from 'react';
import Modal from 'react-modal';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none transition-opacity duration-200"
      overlayClassName="fixed inset-0 bg-black/30 flex items-center justify-center p-4 transition-opacity duration-200"
      closeTimeoutMS={200}
    >
      <h2 className="text-lg font-semibold text-gray-900">
        Upgrade Required
      </h2>
      
      <p className="mt-2 text-sm text-gray-500">
        You've used all your free projects. Upgrade your account to create more amazing designs!
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="bg-gradient-to-r from-[#8c52ff] to-[#a855f7] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          onClick={onClose}
        >
          Upgrade Now
        </button>
      </div>
    </Modal>
  );
};

export default UpgradeModal;
