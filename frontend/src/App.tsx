import React, { useState } from 'react';
import { useChat } from './context/ChatContext';
import ChatBox from './components/ChatBox';
import ImageResult from './components/ImageResult';

const CHAT_URL = 'http://localhost:8000/bike/chat/complete';
const IMAGE_URL = 'http://localhost:8000/bike/image/generate';

function getOrCreateSessionId() {
  let id = localStorage.getItem('session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('session_id', id);
  }
  return id;
}

const App: React.FC = () => {
  const { messages, setMessages } = useChat();
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [sessionId] = useState(getOrCreateSessionId());

  // Helper to extract options from AI message
  const extractOptions = (msg: string): string[] => {
    const optionRegex = /\d+\.(.*?)(?=\n|$)/g;
    const found: string[] = [];
    let match;
    while ((match = optionRegex.exec(msg))) {
      found.push(match[1].trim());
    }
    return found;
  };

  // Send message to backend
  const sendMessage = async (userContent?: string) => {
    setLoading(true);
    let newMessages = [...messages];
    let user_message = userContent || '';
    // If first load, don't send a user message
    if (!userContent && messages.length === 0) {
      user_message = '';
    }
    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, user_message }),
      });
      const data = await res.json();
      // Only append if user actually sent a message
      if (userContent) {
        newMessages = [
          ...messages,
          { role: 'user', content: userContent },
          { role: 'assistant', content: data.ai_message },
        ];
      } else if (messages.length === 0) {
        // First AI message
        newMessages = [{ role: 'assistant', content: data.ai_message }];
      }
      setMessages(newMessages);
      setQuestion(data.ai_message);
      setOptions(extractOptions(data.ai_message));
      setIsComplete(data.is_complete);
      setLoading(false);
      if (data.is_complete) {
        // Call image generation endpoint
        fetchImage();
      }
    } catch (e) {
      setLoading(false);
      alert('Error contacting backend');
    }
  };

  // Fetch image from backend
  const fetchImage = async () => {
    setLoading(true);
    try {
      const res = await fetch(IMAGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      setImageBase64(data.image_base64);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert('Error generating image');
    }
  };

  React.useEffect(() => {
    if (messages.length === 0) {
      sendMessage();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded shadow p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Dream Bike Builder</h1>
        <ChatBox messages={messages} question={question} />
        {!isComplete && options.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            {options.map((opt, idx) => (
              <button
                key={idx}
                className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition"
                onClick={() => sendMessage((idx + 1).toString())}
                disabled={loading}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
        {loading && <div className="text-center mt-4">Loading...</div>}
        {isComplete && imageBase64 && <ImageResult imageBase64={imageBase64} />}
      </div>
    </div>
  );
};

export default App;