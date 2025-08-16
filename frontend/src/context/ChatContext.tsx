import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Message } from '../types/chat';

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (message: Message) => void;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string) => void;
  clearMessages: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const addUserMessage = useCallback((content: string) => {
    addMessage({ role: 'user', content });
  }, [addMessage]);

  const addAssistantMessage = useCallback((content: string) => {
    addMessage({ role: 'assistant', content });
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value: ChatContextType = {
    messages,
    setMessages,
    addMessage,
    addUserMessage,
    addAssistantMessage,
    clearMessages,
    isLoading,
    setIsLoading,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};