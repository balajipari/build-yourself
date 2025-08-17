import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LeftPanel,
  RightPanel
} from './components/Builder';
import { withErrorBoundary, ConfirmationModal } from './components/common';
import { DashboardHeader } from './components/dashboard';
import { API_URLS } from './config/api';
import { MESSAGES } from './config/constants';
import { useChat } from './context/ChatContext';
import { useApi, useBuilderState, useSession } from './hooks';

const Builder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { messages, setMessages, clearMessages } = useChat();
  const { loading, error, chatComplete, generateImage } = useApi();
  const { sessionId, resetSession } = useSession();
  const {
    isComplete,
    imageBase64,
    questionText,
    options,
    currentStep,
    totalSteps,
    customInput,
    resetQuestionState,
    resetAllState,
    setQuestionState,
    setIsComplete,
    setImageBase64,
    setCustomInput,
  } = useBuilderState();

  // Modal states
  const [showStartOverModal, setShowStartOverModal] = useState(false);
  const [showBackToDashboardModal, setShowBackToDashboardModal] = useState(false);
  
  // Track if this is the initial load or a reset
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Check if this is a new build session from dashboard
  const isNewBuildSession = location.state?.type;

  // Update messages with new content
  const updateMessages = useCallback((userContent: string | undefined, aiMessage: string) => {
    let newMessages = [...messages];
    if (userContent) {
      newMessages = [...messages, { role: 'user', content: userContent }, { role: 'assistant', content: aiMessage }];
    } else if (messages.length === 0) {
      newMessages = [{ role: 'assistant', content: aiMessage }];
    }
    setMessages(newMessages);
  }, [messages, setMessages]);

  // Send message to API
  const sendMessage = useCallback(async (userContent?: string) => {
    // Guard against empty session ID
    if (!sessionId) {
      console.warn('Session ID is empty, cannot send message');
      return;
    }

    let user_message = userContent || '';
    if (!userContent && messages.length === 0) {
      user_message = '';
    }

    try {
      const data = await chatComplete({ session_id: sessionId, user_message });
      
      if (!data) return;

      if (userContent) {
        updateMessages(userContent, data.ai_message);
      } else if (messages.length === 0) {
        updateMessages(undefined, data.ai_message);
      }

      if (data.is_complete) {
        setIsComplete(true);
        resetQuestionState();
        await fetchImage();
      } else {
        setQuestionState(data);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      alert(MESSAGES.ERROR.BACKEND);
    }
  }, [sessionId, messages.length, chatComplete, updateMessages, setIsComplete, resetQuestionState, setQuestionState]);

  // Handle option selection with full text
  const handleOptionSelect = useCallback((optionText: string) => {
    sendMessage(optionText);
  }, [sendMessage]);

  // Handle custom input submission
  const handleCustomSubmit = useCallback(() => {
    if (customInput.trim()) {
      sendMessage(customInput.trim());
      setCustomInput('');
    }
  }, [customInput, sendMessage, setCustomInput]);

  // Fetch generated image
  const fetchImage = useCallback(async () => {
    try {
      const data = await generateImage({ session_id: sessionId });
      if (data) {
        setImageBase64(data.image_base64);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert(MESSAGES.ERROR.IMAGE_GENERATION);
    }
  }, [sessionId, generateImage, setImageBase64]);

  // Download image
  const downloadImage = useCallback(() => {
    const link = document.createElement('a');
    link.href = `${API_URLS.IMAGE_DOWNLOAD}/${sessionId}`;
    link.download = `custom_bike_${sessionId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [sessionId]);

  // Handle start over with confirmation
  const handleStartOver = useCallback(() => {
    setShowStartOverModal(true);
  }, []);

  // Common function to clear session and reset state
  const clearSessionAndReset = useCallback((action: 'start-over' | 'back-to-dashboard') => {
    console.log(`Clearing session and resetting state for: ${action}`);
    
    // Set resetting flag to prevent immediate message sending
    setIsResetting(true);
    
    // Clear all state
    clearMessages();
    resetAllState();
    resetSession();
    
    // Reset the initialization flag
    setHasInitialized(false);
    
    console.log(`State cleared for ${action}, will reset flags in 100ms`);
    
    // Clear resetting flag after a brief delay
    setTimeout(() => {
      console.log(`Resetting flags for ${action}, ready for new session`);
      setIsResetting(false);
    }, 100);
  }, [clearMessages, resetAllState, resetSession]);

  // Confirm start over
  const confirmStartOver = useCallback(() => {
    setShowStartOverModal(false);
    clearSessionAndReset('start-over');
  }, [clearSessionAndReset]);

  // Handle back to dashboard with confirmation
  const handleBackToDashboard = useCallback(() => {
    setShowBackToDashboardModal(true);
  }, []);

  // Confirm back to dashboard
  const confirmBackToDashboard = useCallback(() => {
    setShowBackToDashboardModal(false);
    clearSessionAndReset('back-to-dashboard');
    // Navigate to dashboard after clearing session
    navigate('/dashboard');
  }, [clearSessionAndReset, navigate]);

  // Single, clear initialization effect
  useEffect(() => {
    console.log('Initialization effect:', { isResetting, isNewBuildSession, hasInitialized, sessionId, messagesLength: messages.length });
    
    // Skip if we're currently resetting
    if (isResetting) {
      console.log('Skipping initialization - currently resetting');
      return;
    }

    // Handle new build session from dashboard
    if (isNewBuildSession && !hasInitialized) {
      console.log('New build session detected, clearing state');
      clearMessages();
      resetAllState();
      resetSession();
      setHasInitialized(true);
      return; // Don't send message yet, let the session change effect handle it
    }

    // Send initial message only once when we have a session and no messages
    if (sessionId && messages.length === 0 && !hasInitialized) {
      console.log('Initializing chat with session ID:', sessionId);
      setHasInitialized(true);
      sendMessage();
    }
  }, [isNewBuildSession, hasInitialized, isResetting, sessionId, messages.length, sendMessage, clearMessages, resetAllState, resetSession]);

  // Handle session ID changes (e.g., after reset)
  useEffect(() => {
    console.log('Session change effect:', { isResetting, hasInitialized, sessionId, messagesLength: messages.length });
    
    // Only handle session changes when we're not resetting and have initialized
    if (isResetting || !hasInitialized) {
      console.log('Skipping session change - resetting or not initialized');
      return;
    }

    // If session ID changes and we have no messages, send initial message
    if (sessionId && messages.length === 0) {
      console.log('Session changed, sending initial message:', sessionId);
      sendMessage();
    }
  }, [sessionId, isResetting, hasInitialized, messages.length, sendMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader />
      
      {/* Main content with top margin for navbar */}
      <div className="pt-20 px-4 pb-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          {/* Two-panel layout - Swapped positions */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Panel - Builder Progress (65% on large screens) */}
            <div className="lg:col-span-3">
              <RightPanel
                currentStep={currentStep}
                totalSteps={totalSteps}
                questionText={questionText}
                options={options}
                isComplete={isComplete}
                customInput={customInput}
                loading={loading}
                onOptionSelect={handleOptionSelect}
                onCustomInputChange={setCustomInput}
                onCustomSubmit={handleCustomSubmit}
                imageBase64={imageBase64}
                onDownload={downloadImage}
                onReset={handleStartOver}
              />
            </div>

            {/* Right Panel - Chat History (35% on large screens) */}
            <div className="lg:col-span-2">
              <LeftPanel 
                messages={messages}
                onStartOver={handleStartOver}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showStartOverModal}
        title="Start Over"
        message="Are you sure you want to start over? All your progress and conversation history will be lost."
        confirmText="Yes, Start Over"
        cancelText="Cancel"
        onConfirm={confirmStartOver}
        onCancel={() => setShowStartOverModal(false)}
        type="warning"
      />

      <ConfirmationModal
        isOpen={showBackToDashboardModal}
        title="Leave Builder"
        message="Are you sure you want to leave the builder? All your progress and conversation history will be lost."
        confirmText="Yes, Leave"
        cancelText="Cancel"
        onConfirm={confirmBackToDashboard}
        onCancel={() => setShowBackToDashboardModal(false)}
        type="warning"
      />
    </div>
  );
};

// Export with error boundary wrapper
export default withErrorBoundary(Builder);


