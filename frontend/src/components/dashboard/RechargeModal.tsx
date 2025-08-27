import React, { useState } from 'react';
import Modal from 'react-modal';
import { BsStars } from 'react-icons/bs';

// Bind modal to your appElement for accessibility
Modal.setAppElement('#root');

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecharge: (amount: number) => void;
}

const CREDIT_OPTIONS = [
  { credits: 50, amount: 499 },
  { credits: 100, amount: 899 },
  { credits: 200, amount: 1499 },
  { credits: 500, amount: 2999 },
];

export const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  onClose,
  onRecharge,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(CREDIT_OPTIONS[0].amount);



  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        onClose();
        setSelectedAmount(CREDIT_OPTIONS[0].amount);
      }}
      className="w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none transition-opacity duration-200"
      overlayClassName="fixed inset-0 bg-black/10 flex items-center justify-center p-4 transition-opacity duration-200"
      closeTimeoutMS={200}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BsStars className="text-orange-500 text-xl" />
        <h3 className="text-lg font-medium text-gray-900">
          Recharge Credits
        </h3>
      </div>

      {/* Credit options */}
      <div className="grid grid-cols-2 gap-4">
        {CREDIT_OPTIONS.map((option) => (
          <button
            key={option.credits}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedAmount === option.amount
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-200'
            }`}
            onClick={() => setSelectedAmount(option.amount)}
          >
            <div className="text-lg font-semibold text-gray-900">
              {option.credits} Credits
            </div>
            <div className="text-sm text-gray-500">
              ₹{option.amount}
            </div>
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          className="flex-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          onClick={() => onRecharge(selectedAmount)}
        >
          Proceed to Pay
        </button>
        <button
          type="button"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          onClick={() => {
            onClose();
            setSelectedAmount(CREDIT_OPTIONS[0].amount);
          }}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};
