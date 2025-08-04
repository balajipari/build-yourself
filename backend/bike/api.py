from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
import openai
import os
from dotenv import load_dotenv
from .prompt import SYSTEM_PROMPT
from .utils import get_summary_prompt, generate_bike_image

load_dotenv()

router = APIRouter()

# In-memory session store: session_id -> list of messages (dicts)
session_store = {}

class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

# For chat endpoint
class ChatSessionRequest(BaseModel):
    session_id: str
    user_message: str

class ChatResponse(BaseModel):
    ai_message: str
    is_complete: bool
    raw_response: dict = None

# For image generation endpoint
class ImageGenerationRequest(BaseModel):
    session_id: str

class ImageGenerationResponse(BaseModel):
    image_base64: str

@router.get("/ping")
def ping():
    return {"message": "Bike module is alive!"}

@router.post("/chat/complete", response_model=ChatResponse)
def chat_complete(request: ChatSessionRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not set.")
    client = openai.OpenAI(api_key=api_key)

    # Retrieve or initialize session
    session_id = request.session_id
    if session_id not in session_store:
        # Start new session with system prompt and initial user message
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "Let's start building my dream bike!"}
        ]
    else:
        messages = session_store[session_id]

    # Append the latest user message
    messages.append({"role": "user", "content": request.user_message})

    try:
        response = client.chat.completions.create(
            model="o4-mini",
            messages=messages
        )
        ai_message = response.choices[0].message.content.strip()
        messages.append({"role": "assistant", "content": ai_message})
        is_complete = "<<END_OF_BIKE_SPEC>>" in ai_message
        # Save updated session
        session_store[session_id] = messages
        return ChatResponse(
            ai_message=ai_message,
            is_complete=is_complete
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image/generate", response_model=ImageGenerationResponse)
def generate_image(request: ImageGenerationRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not set.")
    client = openai.OpenAI(api_key=api_key)

    session_id = request.session_id
    if session_id not in session_store:
        raise HTTPException(status_code=400, detail="Session ID not found or chat not started.")
    messages = session_store[session_id]

    # Check if conversation is complete
    if not any(
        "<<END_OF_BIKE_SPEC>>" in msg["content"]
        for msg in messages if msg["role"] == "assistant"
    ):
        raise HTTPException(status_code=400, detail="Conversation not complete. Finish chat before generating image.")

    try:
        summary_prompt = get_summary_prompt(messages, client)
        image_base64 = generate_bike_image(summary_prompt, client)
        return ImageGenerationResponse(image_base64=image_base64)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))