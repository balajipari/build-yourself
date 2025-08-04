import React from 'react';
import type { Message } from '../context/ChatContext';

interface ChatBoxProps {
  messages: Message[];
  question: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, question }) => {
  return (
    <div className="h-64 overflow-y-auto border rounded p-2 bg-gray-50 mb-4">
      {messages.map((msg, idx) => (
        <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
          <span className={msg.role === 'user' ? 'font-semibold text-blue-700' : 'font-semibold text-gray-700'}>
            {msg.role === 'user' ? 'You' : 'AI'}:
          </span>{' '}
          <span>{msg.content}</span>
        </div>
      ))}
      {question && (
        <div className="text-left mt-2">
          <span className="font-semibold text-gray-700">AI:</span> <span>{question}</span>
        </div>
      )}
    </div>
  );
};

export default ChatBox;