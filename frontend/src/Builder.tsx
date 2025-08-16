import React, { useCallback, useEffect } from 'react';
import { useChat } from './context/ChatContext';
import { useApi, useSession, useBuilderState } from './hooks';
import { API_URLS } from './config/api';
import { MESSAGES } from './config/constants';
import { withErrorBoundary } from './components/common';
import {
  BuilderHeader,
  ProgressBar,
  QuestionDisplay,
  CustomInput,
  LoadingIndicator,
  ActionButtons,
} from './components/Builder';
import ChatBox from './components/ChatBox';
import ImageResult from './components/ImageResult';

const Builder: React.FC = () => {
  const { messages, setMessages } = useChat();
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
    setQuestionState,
    setIsComplete,
    setImageBase64,
    setCustomInput,
  } = useBuilderState();

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

  // Initialize chat on component mount
  useEffect(() => {
    if (messages.length === 0) {
      sendMessage();
    }
  }, [messages.length, sendMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <BuilderHeader />
        
        <ProgressBar 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
        />

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <ChatBox messages={messages} />

          <QuestionDisplay
            questionText={questionText}
            options={options}
            isComplete={isComplete}
            onOptionSelect={sendMessage}
            loading={loading}
          />

          {!questionText && !isComplete && (
            <CustomInput
              value={customInput}
              onChange={setCustomInput}
              onSubmit={handleCustomSubmit}
              loading={loading}
            />
          )}

          <LoadingIndicator 
            loading={loading} 
            isComplete={isComplete} 
          />
        </div>

        {isComplete && imageBase64 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <ImageResult imageBase64={imageBase64} />
            <ActionButtons 
              onDownload={downloadImage}
              onReset={resetSession}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Export with error boundary wrapper
export default withErrorBoundary(Builder);


