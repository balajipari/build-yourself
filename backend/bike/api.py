from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
import openai
import os
import base64
import json
from datetime import datetime
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from .prompt import SYSTEM_PROMPT
from .structured_prompt import STRUCTURED_SYSTEM_PROMPT
from .models import StructuredLLMResponse, QuestionResponse, BikeSpecification, CustomField
from .utils import get_summary_prompt, generate_bike_image

load_dotenv()

# Model configuration from environment variables
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL")
VALIDATION_MODEL = os.getenv("OPENAI_VALIDATION_MODEL")

router = APIRouter()

# In-memory session store: session_id -> list of messages (dicts)
session_store = {}
# Store image file paths: session_id -> file_path
image_files = {}
# Store bike specifications: session_id -> BikeSpecification
bike_specs = {}
# Store custom follow-up tracking: session_id -> {question_type: follow_up_count}
custom_followup_tracking = {}

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
    question_text: Optional[str] = None
    options: Optional[List[dict]] = None
    current_step: Optional[int] = None
    total_steps: Optional[int] = None
    raw_response: dict = None

# For image generation endpoint
class ImageGenerationRequest(BaseModel):
    session_id: str

class ImageGenerationResponse(BaseModel):
    image_base64: str

@router.get("/ping")
def ping():
    return {"message": "Bike module is alive!"}

def parse_llm_response(response_text: str) -> StructuredLLMResponse:
    """Parse LLM response and validate JSON structure"""
    try:
        # Clean the response text (remove any markdown formatting)
        cleaned_text = response_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        
        # Parse JSON
        data = json.loads(cleaned_text.strip())
        
        # Validate and return structured response
        return StructuredLLMResponse(**data)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON response from LLM: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing LLM response: {str(e)}")

def validate_custom_input(value: str) -> bool:
    """Validate custom input for bike relevance using LLM"""
    # Basic length validation
    if len(value) > 500:
        return False
    
    if len(value.strip()) < 3:
        return False
    
    # Check if LLM validation is enabled via environment variable
    enable_llm_validation = os.getenv("ENABLE_LLM_VALIDATION", "true").lower() == "true"
    
    if not enable_llm_validation:
        # If LLM validation is disabled, only perform basic validation
        return True
    
    # LLM-based semantic validation
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("LLM validation enabled but OpenAI API key not set - falling back to basic validation")
            return True
        
        client = openai.OpenAI(api_key=api_key)
        
        validation_prompt = f"""
        You are a bike expert. Determine if this user input is relevant to motorcycle/bike customization or specification.
        
        Input: "{value}"
        
        Consider if this input describes:
        - Bike parts, components, or features
        - Customization details, modifications, or preferences
        - Design elements, styles, or aesthetics
        - Technical specifications or requirements
        - Materials, colors, or finishes
        - Performance or functional aspects
        
        Respond with only "YES" if relevant to bikes/motorcycles, or "NO" if not relevant.
        """
        
        response = client.chat.completions.create(
            model=VALIDATION_MODEL, 
            messages=[{"role": "user", "content": validation_prompt}],
            max_tokens=10,
            temperature=0.1
        )
        
        result = response.choices[0].message.content.strip().upper()
        return result == "YES"
        
    except Exception as e:
        print(f"LLM validation failed: {e} - falling back to basic validation")
        # If LLM validation fails, fall back to basic validation (accept the input)
        return True


@router.post("/chat/complete", response_model=ChatResponse)
def chat_complete(request: ChatSessionRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not set.")
    client = openai.OpenAI(api_key=api_key)

    # Retrieve or initialize session
    session_id = request.session_id
    if session_id not in session_store:
        # Start new session with structured system prompt
        messages = [
            {"role": "system", "content": STRUCTURED_SYSTEM_PROMPT},
            {"role": "user", "content": "Let's start building my dream bike!"}
        ]
        custom_followup_tracking[session_id] = {}
    else:
        messages = session_store[session_id]

    # Append the latest user message
    messages.append({"role": "user", "content": request.user_message})

    try:
        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=messages
        )
        ai_message = response.choices[0].message.content.strip()
        structured_response = parse_llm_response(ai_message)
        messages.append({"role": "assistant", "content": ai_message})
        session_store[session_id] = messages
        
        # Handle different response types
        if structured_response.type == "question":
            question_content = structured_response.content
            if isinstance(question_content, QuestionResponse):
                # Track custom follow-ups
                if question_content.question_type == "custom_followup":
                    parent = question_content.parent_question
                    if parent:
                        if parent not in custom_followup_tracking[session_id]:
                            custom_followup_tracking[session_id][parent] = 0
                        custom_followup_tracking[session_id][parent] += 1
                
                return ChatResponse(
                    ai_message=structured_response.message,
                    is_complete=False,
                    question_text=question_content.question_text,
                    options=[{"number": opt.number, "text": opt.text, "value": opt.value} for opt in question_content.options],
                    current_step=question_content.current_step,
                    total_steps=question_content.total_steps
                )
        
        elif structured_response.type == "completion":
            bike_spec = structured_response.content
            if isinstance(bike_spec, BikeSpecification):
                # Validate and clean custom fields
                validated_custom_fields = {}
                for field_name, value in bike_spec.custom_fields.items():
                    if validate_custom_input(value):
                        validated_custom_fields[field_name] = value
                    else:
                        print(f"Rejected custom field '{field_name}': '{value}' - validation failed")
                
                bike_spec.custom_fields = validated_custom_fields
                
                # Store the bike specification for image generation
                bike_specs[session_id] = bike_spec
                return ChatResponse(
                    ai_message=structured_response.message,
                    is_complete=True
                )
        
        elif structured_response.type == "error":
            return ChatResponse(
                ai_message=structured_response.message,
                is_complete=False,
                options=[]
            )
        
        # Fallback for unexpected response types
        return ChatResponse(
            ai_message=structured_response.message,
            is_complete=False,
            options=[],
            raw_response=None
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
    if session_id not in bike_specs:
        raise HTTPException(status_code=400, detail="Bike specification not found. Complete the chat first.")

    bike_spec = bike_specs[session_id]

    try:
        # Get validated specifications for image generation
        specs = bike_spec.get_image_generation_specs()
        
        # Create a comprehensive summary prompt
        summary_prompt = f"""
        Generate a photorealistic image of a custom motorcycle with these specifications:
        
        """
        
        # Add predefined specifications
        for field, value in specs.items():
            if field.startswith('custom_'):
                summary_prompt += f"\n{field.replace('custom_', '').replace('_', ' ').title()}: {value}"
            else:
                summary_prompt += f"\n{field.replace('_', ' ').title()}: {value}"
        
        summary_prompt += f"""
        
        Generate a high-resolution, photorealistic image on a plain white background with soft lighting, 
        ¾ front-left camera angle, realistic textures, and no people or brand logos.
        
        Include all the custom specifications mentioned above in the final image.
        """
        
        image_base64 = generate_bike_image(summary_prompt, client)
        
        # Log the base64 string (truncated for readability)
        print(f"Generated image base64 (first 100 chars): {image_base64[:100]}...")
        
        # Save image to output folder
        output_dir = "bike/output"
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"custom_bike_{session_id}_{timestamp}.png"
        file_path = os.path.join(output_dir, filename)
        
        # Decode base64 and save as PNG
        image_data = base64.b64decode(image_base64)
        with open(file_path, "wb") as f:
            f.write(image_data)
        
        # Store the file path for download
        image_files[session_id] = file_path
        
        print(f"Image saved to: {file_path}")
        
        return ImageGenerationResponse(image_base64=image_base64)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/image/download/{session_id}")
def download_image(session_id: str):
    """Download the generated image for a session"""
    if session_id not in image_files:
        raise HTTPException(status_code=404, detail="Image not found for this session.")
    
    file_path = image_files[session_id]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image file not found.")
    
    return FileResponse(
        path=file_path,
        filename=f"custom_bike_{session_id}.png",
        media_type="image/png"
    )