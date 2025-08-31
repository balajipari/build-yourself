import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatHistory, SubHeader } from './components/Builder';
import { withErrorBoundary, ConfirmationModal } from './components/common';
import { DashboardHeader } from './components/dashboard';
import { API_URLS } from './config/api';
import { MESSAGES } from './config/constants';
import { useChat } from './context/ChatContext';
import { useAuth } from './context/AuthContext';
import { useApi, useBuilderState } from './hooks';
import { projectService } from './services/project';
import toast from 'react-hot-toast';

const Builder: React.FC = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { messages, setMessages, clearMessages } = useChat();
  const { loading, chatComplete, generateImage } = useApi();
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
    if (!projectId) {
      console.warn('Project ID is empty, cannot send message');
      return;
    }

    let user_message = userContent || '';
    if (!userContent && messages.length === 0) {
      user_message = '';
    }

    try {
      const data = await chatComplete({ 
        project_id: projectId,
        user_message
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
        // Start image generation but don't wait for it
        generateImage({ 
          project_id: projectId 
        }).catch(error => {
          console.error('Error in image generation:', error);
        });
        
        await checkAuth();
        toast.success('Your bike is being created in the background! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500); // Give time to see the success message
      } else {
        setQuestionState(data);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error(MESSAGES.ERROR.BACKEND);
    }
  }, [messages.length, chatComplete, updateMessages, setIsComplete, resetQuestionState, setQuestionState, projectId]);

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
        toast.error('Failed to update project title. Please try again.');
      }
    }
  }, [projectId]);

  const handleCustomSubmit = useCallback(() => {
    if (customInput.trim()) {
      sendMessage(customInput.trim());
      setCustomInput('');
    }
  }, [customInput, sendMessage, setCustomInput]);


  const downloadImage = useCallback(() => {
    const link = document.createElement('a');
    link.href = `${API_URLS.IMAGE_DOWNLOAD}/project/${projectId}`;
    link.download = `custom_bike_${projectId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [projectId]);

  const handleStartOver = useCallback(() => {
    setShowStartOverModal(true);
  }, []);

  const clearSessionAndReset = useCallback(() => {
    setIsResetting(true);
    clearMessages();
    resetAllState();
    setHasInitialized(false);
    
    setTimeout(() => {
      setIsResetting(false);
    }, 100);
  }, [clearMessages, resetAllState]);

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
        await projectService.deleteProject(projectId, true, true); // Mark as abandoned
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
    
    clearSessionAndReset();
    await checkAuth(); // Refresh user data
    navigate('/dashboard');
  }, [clearSessionAndReset, navigate, projectId, checkAuth]);

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
    
    if (projectId && messages.length === 0 && !hasInitialized) {
      setHasInitialized(true);
      sendMessage();
    }
  }, [isNewBuildSession, hasInitialized, isResetting, projectId, messages.length, sendMessage, clearMessages, resetAllState]);

  useEffect(() => {
    if (isResetting || !hasInitialized) return;

    if (projectId && messages.length === 0) {
      setTimeout(() => {
        sendMessage();
      }, 100);
    }
  }, [projectId, isResetting, hasInitialized, messages.length, sendMessage]);

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />
        
        <SubHeader 
          onBackToDashboard={handleBackToDashboard}
          onStartOver={handleStartOver}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
        
        <main className="flex-1 px-4 pb-4" role="main" aria-label="Motorcycle Design Builder">
          <h1 className="sr-only">Custom Motorcycle Design Builder</h1>
          <div className="max-w-7xl mx-auto">
            <section className="w-full" aria-label="Design Conversation">
              <h2 className="sr-only">Design Conversation History</h2>
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
            </section>
          </div>
        </main>
      </div>

      {/* Modals */}
      <div aria-live="polite">
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
            ? `Are you sure you want to leave? This will count towards your project quota and all progress will be lost.`
            : "Are you sure you want to leave? All your progress will be lost."
          }
          confirmText={projectId ? "Yes, Leave & Count Quota" : "Yes, Leave"}
          cancelText="Cancel"
          onConfirm={confirmBackToDashboard}
          onCancel={() => setShowBackToDashboardModal(false)}
          type="warning"
        />
      </div>
    </>
  );
};

export default withErrorBoundary(Builder);


