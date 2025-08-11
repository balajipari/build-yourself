import React, { useState, useCallback } from 'react';
import { useChat } from './context/ChatContext';
import ChatBox from './components/ChatBox';
import ImageResult from './components/ImageResult';

// Global configuration
const API_BASE_URL = 'http://localhost:8000/bike';
const CHAT_URL = `${API_BASE_URL}/chat/complete`;
const IMAGE_URL = `${API_BASE_URL}/image/generate`;
const DOWNLOAD_URL = `${API_BASE_URL}/image/download`;

function getOrCreateSessionId() {
  let id = localStorage.getItem('session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('session_id', id);
  }
  return id;
}

function clearSession() {
  localStorage.removeItem('session_id');
  window.location.reload();
}

async function makeApiRequest(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

interface QuestionData {
  question_text?: string;
  ai_message?: string;
  options?: Array<{ number: number; text: string; value: string }>;
  current_step?: number;
  total_steps?: number;
  is_complete?: boolean;
}

const Builder: React.FC = () => {
  const { messages, setMessages } = useChat();
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<Array<{ number: number; text: string; value: string }>>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(15);
  const [customInput, setCustomInput] = useState('');
  const [sessionId] = useState(getOrCreateSessionId());

  function resetQuestionState() {
    setQuestionText('');
    setOptions([]);
    setCurrentStep(0);
    setTotalSteps(0);
    setCustomInput('');
  }

  function setQuestionState(data: QuestionData) {
    setQuestionText(data.question_text || data.ai_message || '');
    setOptions(data.options || []);
    setCurrentStep(data.current_step || 0);
    setTotalSteps(data.total_steps || 15);
    setIsComplete(false);
    setCustomInput('');
  }

  function updateMessages(userContent: string | undefined, aiMessage: string) {
    let newMessages = [...messages];
    if (userContent) {
      newMessages = [...messages, { role: 'user', content: userContent }, { role: 'assistant', content: aiMessage }];
    } else if (messages.length === 0) {
      newMessages = [{ role: 'assistant', content: aiMessage }];
    }
    setMessages(newMessages);
  }

  const sendMessage = useCallback(
    async (userContent?: string) => {
      setLoading(true);
      let user_message = userContent || '';
      if (!userContent && messages.length === 0) {
        user_message = '';
      }
      try {
        const data = await makeApiRequest(CHAT_URL, { session_id: sessionId, user_message });
        if (userContent) {
          updateMessages(userContent, data.ai_message);
        } else if (messages.length === 0) {
          updateMessages(undefined, data.ai_message);
        }
        if (data.is_complete) {
          setIsComplete(true);
          resetQuestionState();
          setLoading(false);
          fetchImage();
        } else {
          setQuestionState(data);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        console.error('Error contacting backend:', error);
        alert('Error contacting backend');
      }
    },
    [messages.length, sessionId]
  );

  function handleCustomSubmit() {
    if (customInput.trim()) {
      sendMessage(customInput.trim());
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomSubmit();
    }
  }

  async function fetchImage() {
    setLoading(true);
    try {
      const data = await makeApiRequest(IMAGE_URL, { session_id: sessionId });
      setImageBase64(data.image_base64);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error generating image:', error);
      alert('Error generating image');
    }
  }

  function downloadImage() {
    const link = document.createElement('a');
    link.href = `${DOWNLOAD_URL}/${sessionId}`;
    link.download = `custom_bike_${sessionId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  React.useEffect(() => {
    if (messages.length === 0) {
      sendMessage();
    }
  }, [messages.length, sendMessage]);

  const progressPercentage = currentStep > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dream Bike Builder</h1>
          <p className="text-gray-600">Design your perfect motorcycle, one choice at a time</p>
        </div>

        {currentStep > 0 && !isComplete && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{progressPercentage}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            {totalSteps > 15 && (
              <p className="text-xs text-gray-500 mt-1 text-center">✨ Custom questions added for detailed specifications</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <ChatBox messages={messages} />

          {questionText && !isComplete && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{questionText}</h3>
              {options.length > 0 ? (
                <div className="grid gap-3">
                  {options.map((opt) => (
                    <button
                      key={opt.number}
                      className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onClick={() => sendMessage(opt.number.toString())}
                      disabled={loading}
                    >
                      <span className="font-medium text-gray-700">{opt.text}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your custom specification here..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      onClick={handleCustomSubmit}
                      disabled={loading || !customInput.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">Press Enter to submit, or click Send</p>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                {isComplete ? 'Generating your custom bike...' : 'Thinking...'}
              </div>
            </div>
          )}
        </div>

        {isComplete && imageBase64 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <ImageResult imageBase64={imageBase64} />
            <div className="flex gap-4 mt-6 justify-center">
              <button onClick={downloadImage} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500">📥 Download Image</button>
              <button onClick={clearSession} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">🚀 Create New Bike</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Builder;


