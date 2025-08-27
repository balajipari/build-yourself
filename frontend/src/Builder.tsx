import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatHistory, SubHeader } from './components/Builder';
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
  const { loading, chatComplete, generateImage } = useApi();
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

  const [showStartOverModal, setShowStartOverModal] = useState(false);
  const [showBackToDashboardModal, setShowBackToDashboardModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [projectTitle, setProjectTitle] = useState<string>('');

  const isNewBuildSession = location.state?.type;
  const projectId = location.state?.projectId || new URLSearchParams(location.search).get('projectId');
  
  const updateMessages = useCallback(async (userContent: string | undefined, aiMessage: string) => {
    let newMessages = [...messages];
    if (userContent) {
      newMessages = [...messages, { role: 'user', content: userContent }, { role: 'assistant', content: aiMessage }];
    } else if (messages.length === 0) {
      newMessages = [{ role: 'assistant', content: aiMessage }];
    }
    
    setMessages(newMessages);
    
    if (projectId) {
      try {
        await projectService.updateConversationHistory(projectId, newMessages);
      } catch (error) {
        // Continue with local state if backend update fails
      }
    }
  }, [messages, setMessages, projectId]);

  const loadProjectData = useCallback(async (projectId: string) => {
    try {
      const project = await projectService.getProject(projectId);
      setProjectTitle(project.name);
      
      if (project.conversation_history && project.conversation_history.length > 0) {
        const messages = project.conversation_history
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => {
            let content = msg.content;
            
            if (msg.role === 'assistant' && typeof content === 'string') {
              let extractedContent = content;
              
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

  const sendMessage = useCallback(async (userContent?: string) => {
    if (!sessionId) {
      console.warn('Session ID is empty, cannot send message');
      return;
    }

    let user_message = userContent || '';
    if (!userContent && messages.length === 0) {
      user_message = '';
    }

    try {
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

  const handleOptionSelect = useCallback((optionText: string) => {
    sendMessage(optionText);
  }, [sendMessage]);

  const handleTitleUpdate = useCallback(async (newTitle: string) => {
    if (projectId) {
      try {
        await projectService.updateProject(projectId, { name: newTitle });
        setProjectTitle(newTitle);
      } catch (error) {
        console.error('Failed to update project title:', error);
        alert('Failed to update project title. Please try again.');
      }
    }
  }, [projectId]);

  const handleCustomSubmit = useCallback(() => {
    if (customInput.trim()) {
      sendMessage(customInput.trim());
      setCustomInput('');
    }
  }, [customInput, sendMessage, setCustomInput]);

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

  const downloadImage = useCallback(() => {
    const link = document.createElement('a');
    link.href = `${API_URLS.IMAGE_DOWNLOAD}/${sessionId}`;
    link.download = `custom_bike_${sessionId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [sessionId]);

  const handleStartOver = useCallback(() => {
    setShowStartOverModal(true);
  }, []);

  const clearSessionAndReset = useCallback(() => {
    setIsResetting(true);
    clearMessages();
    resetAllState();
    resetSession();
    setHasInitialized(false);
    
    setTimeout(() => {
      setIsResetting(false);
    }, 100);
  }, [clearMessages, resetAllState, resetSession]);

  const confirmStartOver = useCallback(() => {
    setShowStartOverModal(false);
    clearSessionAndReset();
  }, [clearSessionAndReset]);

  const handleBackToDashboard = useCallback(() => {
    setShowBackToDashboardModal(true);
  }, []);

  const confirmBackToDashboard = useCallback(async () => {
    setShowBackToDashboardModal(false);
    
    if (projectId) {
      try {
        await projectService.deleteProject(projectId);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
    
    clearSessionAndReset();
    navigate('/dashboard');
  }, [clearSessionAndReset, navigate, projectId]);

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    }
  }, [projectId, loadProjectData]);

  useEffect(() => {
    if (isResetting) return;

    if (isNewBuildSession && !hasInitialized) {
      clearMessages();
      resetAllState();
      setHasInitialized(true);
      return;
    }
    
    if (sessionId && messages.length === 0 && !hasInitialized) {
      setHasInitialized(true);
      sendMessage();
    }
  }, [isNewBuildSession, hasInitialized, isResetting, sessionId, messages.length, sendMessage, clearMessages, resetAllState, projectId]);

  useEffect(() => {
    if (isResetting || !hasInitialized) return;

    if (sessionId && messages.length === 0) {
      setTimeout(() => {
        sendMessage();
      }, 100);
    }
  }, [sessionId, isResetting, hasInitialized, messages.length, sendMessage, projectId]);

  return (
    <div className="min-h-screen">
      <div className="relative">
        <DashboardHeader />
        
        <SubHeader 
          onBackToDashboard={handleBackToDashboard}
          onStartOver={handleStartOver}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
        
        <div className="mt-5 pt-10 px-4 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="w-full">
            <ChatHistory 
              messages={messages}
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
              projectTitle={projectTitle}
              onTitleUpdate={handleTitleUpdate}
            />
          </div>
        </div>
      </div>
      </div>

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
        message={projectId 
          ? "Are you sure you want to leave? This will delete your draft project and all progress will be lost."
          : "Are you sure you want to leave? All your progress will be lost."
        }
        confirmText={projectId ? "Yes, Delete & Leave" : "Yes, Leave"}
        cancelText="Cancel"
        onConfirm={confirmBackToDashboard}
        onCancel={() => setShowBackToDashboardModal(false)}
        type="warning"
      />
    </div>
  );
};

export default withErrorBoundary(Builder);


