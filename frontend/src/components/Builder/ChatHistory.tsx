import React from 'react';
import ChatBox from '../ChatBox';
import type { Message } from '../../types/chat';

interface ChatHistoryProps {
  messages: Message[];
  className?: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, className = '' }) => {
  return (
    <div className={`w-full h-[75vh] ${className}`}>
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-0">
          <ChatBox messages={messages} />
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
