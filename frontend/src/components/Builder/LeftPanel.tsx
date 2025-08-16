import React from 'react';
import ChatBox from '../ChatBox';
import type { Message } from '../../types/chat';

interface LeftPanelProps {
  messages: Message[];
  className?: string;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ messages, className = '' }) => {
  return (
    <div className={`w-full h-[85vh] ${className}`}>
      <div className="h-full flex flex-col">
        <div className="mb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
          <p className="text-sm text-gray-600">Your conversation with the AI assistant</p>
        </div>
        <div className="flex-1 min-h-0">
          <ChatBox messages={messages} />
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
