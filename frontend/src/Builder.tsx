import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChatHistory,
  BuilderProgress,
  SubHeader
} from './components/Builder';
import { withErrorBoundary, ConfirmationModal } from './components/common';
import { DashboardHeader } from './components/dashboard';
import { API_URLS } from './config/api';
import { MESSAGES } from './config/constants';
import { useChat } from './context/ChatContext';
import { useApi, useBuilderState, useSession } from './hooks';
import { projectService } from './services/project';

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
  
  // Get project ID from location state (new project) or URL query (existing project)
  const projectId = location.state?.projectId || new URLSearchParams(location.search).get('projectId');
  
  // Update messages with new content and sync to backend
  const updateMessages = useCallback(async (userContent: string | undefined, aiMessage: string) => {
    let newMessages = [...messages];
    if (userContent) {
      newMessages = [...messages, { role: 'user', content: userContent }, { role: 'assistant', content: aiMessage }];
    } else if (messages.length === 0) {
      newMessages = [{ role: 'assistant', content: aiMessage }];
    }
    
    // Update local state immediately
    setMessages(newMessages);
    
    // If we have a project ID, update the backend conversation history
    if (projectId) {
      try {
        await projectService.updateConversationHistory(projectId, newMessages);
      } catch (error) {
        // Failed to update conversation history, continue with local state
      }
    }
  }, [messages, setMessages, projectId]);

  // Load project data and conversation history
  const loadProjectData = useCallback(async (projectId: string) => {
    try {
      const project = await projectService.getProject(projectId);
      
      if (project.conversation_history && project.conversation_history.length > 0) {
        // Map ConversationMessage to Message format and filter out system messages
        const messages = project.conversation_history
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => {
            let content = msg.content;
            
            // Handle case where AI message content is JSON string (old format)
            if (msg.role === 'assistant' && typeof content === 'string') {
              // First, try to extract content from markdown code blocks
              let extractedContent = content;
              
              // Check if content is wrapped in markdown code blocks
              if (content.includes('```json') && content.includes('```')) {
                try {
                  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
                  if (jsonMatch && jsonMatch[1]) {
                    const jsonContent = jsonMatch[1].trim();
                    const parsed = JSON.parse(jsonContent);
                    if (parsed.message) {
                      extractedContent = parsed.message;
                    }
                  }
                } catch (e) {
                  // Fall back to trying to parse the entire content as JSON
                  try {
                    const parsed = JSON.parse(content);
                    if (parsed.message) {
                      extractedContent = parsed.message;
                    }
                  } catch (e2) {
                    // Use content as-is if parsing fails
                  }
                }
              } else {
                // Try to parse as regular JSON
                try {
                  const parsed = JSON.parse(content);
                  if (parsed.message) {
                    extractedContent = parsed.message;
                  }
                } catch (e) {
                  // Not JSON, use content as-is
                }
              }
              
              content = extractedContent;
            }
            
            return {
              role: msg.role as 'user' | 'assistant',
              content: content
            };
          });
        
        setMessages(messages);
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  }, [setMessages]);

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
      // Validate project ID before sending
      const validProjectId = projectId && typeof projectId === 'string' && projectId.trim() !== '' ? projectId : undefined;
      
      const data = await chatComplete({ 
        session_id: sessionId, 
        user_message,
        project_id: validProjectId
      });
      
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
  }, [sessionId, messages.length, chatComplete, updateMessages, setIsComplete, resetQuestionState, setQuestionState, projectId]);

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
      const data = await generateImage({ 
        session_id: sessionId,
        project_id: projectId 
      });
      if (data) {
        setImageBase64(data.image_base64);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert(MESSAGES.ERROR.IMAGE_GENERATION);
    }
  }, [sessionId, generateImage, setImageBase64, projectId]);

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
    // Set resetting flag to prevent immediate message sending
    setIsResetting(true);
    
    // Clear all state
    clearMessages();
    resetAllState();
    resetSession();
    
    // Reset the initialization flag
    setHasInitialized(false);
    
    // Clear resetting flag after a brief delay
    setTimeout(() => {
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



  // Load project data if projectId is present
  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    }
  }, [projectId, loadProjectData]);

  // Single, clear initialization effect
  useEffect(() => {
    // Skip if we're currently resetting
    if (isResetting) {
      return;
    }

    // Handle new build session from dashboard
    if (isNewBuildSession && !hasInitialized) {
      clearMessages();
      resetAllState();
      setHasInitialized(true);
      return;
    }
    
    // Send initial message when we have a session and no messages
    if (sessionId && messages.length === 0 && !hasInitialized) {
      setHasInitialized(true);
      sendMessage();
    }
  }, [isNewBuildSession, hasInitialized, isResetting, sessionId, messages.length, sendMessage, clearMessages, resetAllState, projectId]);

  // Handle session ID changes (e.g., after reset or new project creation)
  useEffect(() => {
    // Only handle session changes when we're not resetting and have initialized
    if (isResetting || !hasInitialized) {
      return;
    }

    // If session ID changes and we have no messages, send initial message
    // This handles both new projects and session resets
    if (sessionId && messages.length === 0) {
      // Add a small delay to ensure everything is ready
      setTimeout(() => {
        sendMessage();
      }, 100);
    }
  }, [sessionId, isResetting, hasInitialized, messages.length, sendMessage, projectId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />
      
      {/* SubHeader with navigation buttons */}
      <SubHeader 
        onBackToDashboard={handleBackToDashboard}
        onStartOver={handleStartOver}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
      
      {/* Main content with top margin for navbar */}
      <div className="mt-5 pt-10 px-4 pb-4">
        <div className="max-w-7xl mx-auto">
          {/* Two-panel layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Panel - Builder Progress (65% on large screens) */}
            <div className="lg:col-span-3">
              <BuilderProgress
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
                isValidating={false}
              />
            </div>

            {/* Right Panel - Chat History (35% on large screens) */}
            <div className="lg:col-span-2">
              <ChatHistory 
                messages={messages}
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


