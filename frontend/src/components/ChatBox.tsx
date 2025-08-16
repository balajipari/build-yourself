import React from 'react';
import type { Message } from '../context/ChatContext';

interface ChatBoxProps {
  messages: Message[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages }) => {
  return (
    <div className="h-full overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>Starting your dream bike journey...</p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              <div className="text-xs font-semibold mb-1 opacity-75">
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </div>
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatBox;