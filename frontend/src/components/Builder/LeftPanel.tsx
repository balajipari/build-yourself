import React from 'react';
import ChatBox from '../ChatBox';
import type { Message } from '../../types/chat';

interface LeftPanelProps {
  messages: Message[];
  className?: string;
  onStartOver: () => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ messages, className = '', onStartOver }) => {
  return (
    <div className={`w-full h-[85vh] ${className}`}>
      <div className="h-full flex flex-col">
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
            <button
              onClick={onStartOver}
              className="px-4 py-2 bg-[#8c52ff] text-white rounded-lg hover:bg-[#8c52ff]/90 transition-colors duration-200 text-sm font-medium cursor-pointer"
            >
              Start Over
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ChatBox messages={messages} />
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
