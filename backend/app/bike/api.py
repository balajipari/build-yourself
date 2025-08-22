from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from .prompt import SYSTEM_PROMPT
from .structured_prompt import STRUCTURED_SYSTEM_PROMPT
from .models import (
    StructuredLLMResponse, QuestionResponse, BikeSpecification,
    ChatSessionRequest, ChatResponse, ImageGenerationRequest, ImageGenerationResponse
)
from .utils import (
    get_openai_client, parse_llm_response, validate_custom_input,
    initialize_session, get_session_messages, track_custom_followup,
    validate_custom_fields, create_image_prompt, save_image_to_file,
    generate_bike_image, session_store, image_files, bike_specs
)
import os

router = APIRouter()

@router.get("/ping")
def ping():
    return {"message": "Bike module is alive!"}

@router.post("/chat/complete", response_model=ChatResponse)
def chat_complete(request: ChatSessionRequest):
    client = get_openai_client()
    session_id = request.session_id
    messages = get_session_messages(session_id, STRUCTURED_SYSTEM_PROMPT)
    messages.append({"role": "user", "content": request.user_message})

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_CHAT_MODEL"),
            messages=messages
        )
        ai_message = response.choices[0].message.content.strip()
        structured_response = parse_llm_response(ai_message, StructuredLLMResponse)
        messages.append({"role": "assistant", "content": ai_message})
        session_store[session_id] = messages
        
        if structured_response.is_question_response():
            question_content = structured_response.get_question_content()
            if question_content:
                track_custom_followup(session_id, question_content)
                return ChatResponse.from_question_response(structured_response, question_content)
            return ChatResponse.from_fallback_response(structured_response)
        
        elif structured_response.is_completion_response():
            bike_spec = structured_response.get_bike_specification()
            if bike_spec:
                bike_spec.validate_and_clean_custom_fields(validate_custom_input)
                bike_specs[session_id] = bike_spec
                return ChatResponse.from_completion_response(structured_response)
            return ChatResponse.from_fallback_response(structured_response)
        
        elif structured_response.is_error_response():
            return ChatResponse.from_error_response(structured_response)
        
        return ChatResponse.from_fallback_response(structured_response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image/generate", response_model=ImageGenerationResponse)
def generate_image(request: ImageGenerationRequest):
    client = get_openai_client()
    session_id = request.session_id
    
    if session_id not in bike_specs:
        raise HTTPException(status_code=400, detail="Bike specification not found. Complete the chat first.")

    bike_spec = bike_specs[session_id]

    try:
        specs = bike_spec.get_image_generation_specs()
        summary_prompt = create_image_prompt(specs)
        image_base64 = generate_bike_image(summary_prompt, client)
        
        print(f"Generated image base64 (first 100 chars): {image_base64[:100]}...")
        
        file_path = save_image_to_file(image_base64, session_id)
        image_files[session_id] = file_path
        
        return ImageGenerationResponse(image_base64=image_base64)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/image/download/{session_id}")
def download_image(session_id: str):
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