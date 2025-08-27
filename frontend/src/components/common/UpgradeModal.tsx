import React from 'react';
import { Dialog } from '@headlessui/react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Upgrade Required
          </Dialog.Title>
          
          <Dialog.Description className="mt-2 text-sm text-gray-500">
            You've used all your free projects. Upgrade your account to create more amazing designs!
          </Dialog.Description>

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
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UpgradeModal;
