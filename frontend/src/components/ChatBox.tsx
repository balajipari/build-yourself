import React from 'react';
import type { Message } from '../types/chat';

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
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              {/* Sender label above the message card */}
              <div className="text-xs font-semibold text-gray-600 mb-2 opacity-75">
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </div>
               
              {/* Message card styled like Image 2 - rectangular with slightly rounded corners */}
              <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-[#8c52ff] text-white rounded-tr-none' // Dark blue for user messages
                  : 'bg-white text-black border border-gray-200 rounded-tl-none' // White with black text for AI messages
              }`}>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatBox;