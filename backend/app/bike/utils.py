import openai
import os
import json
import base64
from datetime import datetime
from typing import List, Dict, Optional, TypeVar, Type
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

# Global configuration
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL")
IMAGE_MODEL = os.getenv("OPENAI_IMAGE_MODEL")
VALIDATION_MODEL = os.getenv("OPENAI_VALIDATION_MODEL")
ENABLE_LLM_VALIDATION = os.getenv("ENABLE_LLM_VALIDATION", "true").lower() == "true"
OUTPUT_DIR = "bike/output"

# Global stores
session_store = {}
image_files = {}
bike_specs = {}
custom_followup_tracking = {}

# Type variable for generic response models
T = TypeVar('T')

def get_openai_client():
    """Get OpenAI client with API key validation"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not set.")
    return openai.OpenAI(api_key=api_key)

def clean_json_response(response_text: str) -> str:
    """Clean JSON response by removing markdown formatting"""
    cleaned_text = response_text.strip()
    if cleaned_text.startswith("```json"):
        cleaned_text = cleaned_text[7:]
    if cleaned_text.endswith("```"):
        cleaned_text = cleaned_text[:-3]
    return cleaned_text.strip()

def parse_llm_response(response_text: str, response_model: Type[T]) -> T:
    """Parse LLM response and validate JSON structure"""
    try:
        cleaned_text = clean_json_response(response_text)
        data = json.loads(cleaned_text)
        result = response_model(**data)
        return result
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON response from LLM: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing LLM response: {str(e)}")

def validate_input_basic(value: str) -> bool:
    """Basic validation for custom input"""
    return 3 <= len(value.strip()) <= 500

def validate_input_with_llm(value: str, client) -> bool:
    """LLM-based semantic validation for custom input"""
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

def validate_custom_input(value: str) -> bool:
    """Validate custom input for bike relevance"""
    if not validate_input_basic(value):
        return False
    
    if not ENABLE_LLM_VALIDATION:
        return True
    
    try:
        client = get_openai_client()
        return validate_input_with_llm(value, client)
    except Exception as e:
        # Fallback to basic validation on LLM failure
        return True

def validate_custom_message_for_image_generation(custom_message: str, client) -> dict:
    """
    Pre-validate custom message for image generation policy compliance.
    Returns a dict with validation result and suggestions.
    """
    validation_prompt = f"""
    You are an AI content safety expert. Analyze this custom motorcycle description for potential content policy violations when used in AI image generation.
    
    Custom Message: "{custom_message}"
    
    Analyze for:
    1. Violence, weapons, or dangerous content
    2. Inappropriate or offensive language
    3. Brand names or copyrighted content
    4. Safety policy violations
    
    Respond in this exact JSON format:
    {{
        "is_safe": true/false,
        "violation_type": "none" or specific violation type,
        "risk_level": "low/medium/high",
        "suggestions": ["safer alternative 1", "safer alternative 2", "safer alternative 3"],
        "explanation": "Brief explanation of why it's safe or what makes it unsafe"
    }}
    
    Examples of safer alternatives:
    - Instead of "aggressive chopper" → "custom cruiser motorcycle"
    - Instead of "battle-scarred" → "vintage style"
    - Instead of "weapon-like" → "performance oriented"
    """
    
    try:
        response = client.chat.completions.create(
            model=VALIDATION_MODEL,
            messages=[{"role": "user", "content": validation_prompt}],
            max_tokens=300,
            temperature=0.1
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Clean and parse the response
        cleaned_text = clean_json_response(result_text)
        validation_result = json.loads(cleaned_text)
        
        return validation_result
        
    except Exception as e:
        # Fallback: return a safe default
        return {
            "is_safe": False,
            "violation_type": "validation_error",
            "risk_level": "medium",
            "suggestions": ["modern motorcycle", "custom design", "performance bike"],
            "explanation": "Unable to validate message, please use safer alternatives"
        }

def initialize_session(session_id: str, system_prompt: str) -> List[dict]:
    """Initialize a new chat session"""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Let's start building my dream bike!"}
    ]
    custom_followup_tracking[session_id] = {}
    return messages

def get_session_messages(session_id: str, system_prompt: str) -> List[dict]:
    """Get or initialize session messages"""
    if session_id not in session_store:
        return initialize_session(session_id, system_prompt)
    return session_store[session_id]

def track_custom_followup(session_id: str, question_content) -> None:
    """Track custom follow-up questions"""
    if hasattr(question_content, 'question_type') and question_content.question_type == "custom_followup":
        parent = getattr(question_content, 'parent_question', None)
        if parent:
            if parent not in custom_followup_tracking[session_id]:
                custom_followup_tracking[session_id][parent] = 0
            custom_followup_tracking[session_id][parent] += 1

def validate_custom_fields(bike_spec) -> dict:
    """Validate and clean custom fields"""
    validated_custom_fields = {}
    for field_name, value in bike_spec.custom_fields.items():
        if validate_custom_input(value):
            validated_custom_fields[field_name] = value
        else:
            # Field validation failed, skip it
            pass
    return validated_custom_fields

def create_image_prompt(specs: dict) -> str:
    """Create comprehensive image generation prompt"""
    summary_prompt = "Generate a photorealistic image of a custom motorcycle with these specifications:\n\n"
    
    for field, value in specs.items():
        if field.startswith('custom_'):
            summary_prompt += f"\n{field.replace('custom_', '').replace('_', ' ').title()}: {value}"
        else:
            summary_prompt += f"\n{field.replace('_', ' ').title()}: {value}"
    
    summary_prompt += """
    
    Generate a high-resolution, photorealistic image on a plain white background with soft lighting, 
    ¾ front-left camera angle, realistic textures, and no people or brand logos.
    
    Include all the custom specifications mentioned above in the final image.
    """
    
    return summary_prompt

def save_image_to_file(image_base64: str, session_id: str) -> str:
    """Save base64 image to file and return file path"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"custom_bike_{session_id}_{timestamp}.png"
    file_path = os.path.join(OUTPUT_DIR, filename)
    
    image_data = base64.b64decode(image_base64)
    with open(file_path, "wb") as f:
        f.write(image_data)
    
    return file_path

def get_summary_prompt(messages: List[Dict], client) -> str:
    """Generate a concise prompt for image generation from conversation history"""
    summary_messages = messages.copy()
    summary_messages.append({
        "role": "user",
        "content": (
            "Please summarize the above bike specification into a single, concise, and safe prompt (under 1000 characters) "
            "suitable for an AI image generator. Only include the essential visual details and user choices. "
            "Avoid any language that could violate content or safety policies."
        )
    })
    
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=summary_messages
    )
    
    return response.choices[0].message.content.strip()[:1000]

def generate_bike_image(prompt: str, client) -> str:
    """Generate bike image using OpenAI and return base64 string"""
    try:
        # Prepare image generation parameters
        image_params = {
            "model": IMAGE_MODEL,
            "prompt": prompt,
            "size": "1024x1024",
            "n": 1
        }
        
        # Add quality parameter only for DALL-E 3 models
        if IMAGE_MODEL and "dall-e-3" in IMAGE_MODEL.lower():
            image_params["quality"] = "standard"
        
        image_response = client.images.generate(**image_params)
        
        if not image_response.data:
            raise ValueError("No image data returned from API.")
        
        return image_response.data[0].b64_json
        
    except Exception as e:
        # Log error for debugging but don't expose internal details to user
        raise