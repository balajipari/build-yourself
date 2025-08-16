import React from 'react';
import ChatBox from '../ChatBox';
import type { Message } from '../../types/chat';

interface LeftPanelProps {
  messages: Message[];
  className?: string;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ messages, className = '' }) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
          <p className="text-sm text-gray-600">Your conversation with the AI assistant</p>
        </div>
        <ChatBox messages={messages} />
      </div>
    </div>
  );
};

export default LeftPanel;
