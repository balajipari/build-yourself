from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from .prompt import SYSTEM_PROMPT
from .structured_prompt import STRUCTURED_SYSTEM_PROMPT
from .models import (
    StructuredLLMResponse, QuestionResponse, BikeSpecification,
    ChatSessionRequest, ChatResponse, ImageGenerationRequest, ImageGenerationResponse
)
from .utils import (
    get_openai_client, parse_llm_response, validate_custom_input,
    initialize_session, get_session_messages, track_custom_followup,
    validate_custom_fields, create_image_prompt,
    generate_bike_image, session_store, image_files, bike_specs,
    validate_custom_message_for_image_generation
)
import os
import base64
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.services.project_service import ProjectService
from app.models import Project, ProjectStatus
from uuid import UUID
import json
import traceback

router = APIRouter()


def extract_readable_content(ai_message: str) -> str:
    """Extract human-readable content from AI response, handling various formats"""
    try:
        # Check if content is wrapped in markdown code blocks
        if '```json' in ai_message and '```' in ai_message:
            # Extract JSON content between code blocks
            import re
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', ai_message)
            if json_match and json_match.group(1):
                json_content = json_match.group(1).strip()
                parsed = json.loads(json_content)
                if isinstance(parsed, dict) and 'message' in parsed:
                    return parsed['message']
        
        # Try to parse as regular JSON
        parsed = json.loads(ai_message)
        if isinstance(parsed, dict) and 'message' in parsed:
            return parsed['message']
        
        # If no message field, return the original content
        return ai_message
        
    except (json.JSONDecodeError, KeyError, AttributeError):
        # If parsing fails, return the original message
        return ai_message

def save_bike_configuration(project_id: str, structured_response):
    """Save the final bike configuration to the project's configuration column"""
    try:
        # Validate project_id format
        if not project_id or not isinstance(project_id, str) or project_id.strip() == '':
            print(f"❌ Invalid project_id: {project_id}")
            return
            
        # Validate UUID format
        try:
            project_uuid = UUID(project_id)
        except ValueError as e:
            print(f"❌ Invalid UUID format for project_id {project_id}")
            return
        
        # Get database session
        db = next(get_db())
        project = db.query(Project).filter(Project.id == project_uuid).first()
        if not project:
            print(f"❌ Project {project_id} not found")
            return
        
        # Get the bike specification from the structured response
        bike_spec = structured_response.get_bike_specification()
        if bike_spec:
            # Convert bike spec to configuration format using Pydantic's model_dump
            bike_spec_dict = bike_spec.model_dump()
            configuration = {
                "bike_specification": bike_spec_dict,
                "completion_timestamp": datetime.now(timezone.utc).isoformat(),
                "status": ProjectStatus.COMPLETED.value
            }
            
            # Update project configuration
            project.configuration = configuration
            project.status = ProjectStatus.COMPLETED
            
            try:
                db.commit()
                db.refresh(project)
            except Exception as e:
                db.rollback()
                return
        else:
            print(f"❌ No bike specification found for project {project_id}")
            
    except Exception as e:
        print(f"❌ Error saving bike configuration: {e}")
    finally:
        db.close()

def save_image_to_project(project_id: str, image_base64: str):
    """Save the generated image to the project's image_base64 column"""
    try:
        # Validate project_id format
        if not project_id or not isinstance(project_id, str) or project_id.strip() == '':
            print("❌ Invalid project ID")
            return
            
        # Validate UUID format
        try:
            project_uuid = UUID(project_id)
        except ValueError:
            print("❌ Invalid UUID format")
            return
        
        # Get database session
        db = next(get_db())
        project = db.query(Project).filter(Project.id == project_uuid).first()
        if not project:
            print("❌ Project not found")
            return
        
        # Update project image
        project.image_base64 = image_base64
        
        try:
            db.commit()
            db.refresh(project)
            print("✅ Image saved to project")
        except Exception as e:
            db.rollback()
            print(f"❌ Error saving image: {e}")
            return
            
    except Exception as e:
        print(f"❌ Error saving image: {e}")
    finally:
        db.close()




@router.get("/ping")
def ping():
    return {"message": "Bike module is alive!"}

@router.post("/validate-custom-message")
async def validate_custom_message(request: dict):
    """
    Validate a custom message for image generation policy compliance.
    Returns validation result with suggestions for safer alternatives.
    """
    try:
        custom_message = request.get("message", "").strip()
        if not custom_message:
            raise HTTPException(status_code=400, detail="Custom message is required")
        
        if len(custom_message) > 500:
            raise HTTPException(status_code=400, detail="Custom message too long (max 500 characters)")
        
        # Get OpenAI client
        client = get_openai_client()
        
        # Validate the custom message
        validation_result = validate_custom_message_for_image_generation(custom_message, client)
        
        return {
            "message": custom_message,
            "validation_result": validation_result,
            "is_safe": validation_result.get("is_safe", False),
            "suggestions": validation_result.get("suggestions", []),
            "explanation": validation_result.get("explanation", ""),
            "risk_level": validation_result.get("risk_level", "unknown")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error validating custom message: {e}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

@router.post("/chat/complete", response_model=ChatResponse)
def chat_complete(request: ChatSessionRequest):
    client = get_openai_client()
    project_id = request.project_id
    messages = get_session_messages(project_id, STRUCTURED_SYSTEM_PROMPT)
    
    # If the user message is empty, fetch project conversations
    if not request.user_message or request.user_message.strip() == "":
        project_convos = fetch_project_conversations(project_id)
        if project_convos is not None:
            # Extend messages with project conversations instead of appending the array
            if isinstance(project_convos, list):
                messages.extend(project_convos)
            else:
                messages.append(project_convos)
        else:
            messages.append({"role": "user", "content": request.user_message})
    else:
        messages.append({"role": "user", "content": request.user_message})

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_CHAT_MODEL"),
            messages=messages
        )
        ai_message = response.choices[0].message.content.strip()
        
        try:
            structured_response = parse_llm_response(ai_message, StructuredLLMResponse)
        except Exception as parse_error:
            # Try to extract a readable message from the AI response
            readable_content = extract_readable_content(ai_message)
            
            # Return a fallback response instead of crashing
            return ChatResponse(
                ai_message=readable_content or "I'm having trouble processing your request. Please try again.",
                is_complete=False,
                options=[]
            )
        
        messages.append({"role": "assistant", "content": ai_message})
        session_store[project_id] = messages
        
        # Save bike configuration if this is a completion response
        if project_id and structured_response.is_completion_response():
            try:
                save_bike_configuration(project_id, structured_response)
            except Exception as e:
                print(f"❌ Error saving bike configuration: {e}")
        
        if structured_response.is_question_response():
            question_content = structured_response.get_question_content()
            if question_content:
                track_custom_followup(project_id, question_content)
                return ChatResponse.from_question_response(structured_response, question_content)
            return ChatResponse.from_fallback_response(structured_response)
        
        elif structured_response.is_completion_response():
            bike_spec = structured_response.get_bike_specification()
            if bike_spec:
                bike_spec.validate_and_clean_custom_fields(validate_custom_input)
                bike_specs[project_id] = bike_spec
                return ChatResponse.from_completion_response(structured_response)
            return ChatResponse.from_fallback_response(structured_response)
        
        elif structured_response.is_error_response():
            return ChatResponse.from_error_response(structured_response)
        
        return ChatResponse.from_fallback_response(structured_response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def fetch_project_conversations(project_id):
    """
    Fetch the conversation history from the project's conversation_history column.
    Returns a list of messages or None if not found.
    """
    # Check the directory before running any command (custom rule)
    try:
        project_uuid = UUID(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project_id format")
    db = next(get_db())
    try:
        project = db.query(Project).filter(Project.id == project_uuid).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        # Use conversation_history instead of conversation
        if hasattr(project, "conversation_history") and project.conversation_history:
            try:
                if isinstance(project.conversation_history, str):
                    conversation_history = json.loads(project.conversation_history)
                else:
                    conversation_history = project.conversation_history
                return conversation_history
            except Exception as e:
                return project.conversation_history
        return None
    finally:
        db.close()

@router.post("/image/generate", response_model=ImageGenerationResponse)
def generate_image(request: ImageGenerationRequest, db: Session = Depends(get_db)):
    client = get_openai_client()
    project_id = request.project_id
    
    if project_id not in bike_specs:
        raise HTTPException(status_code=400, detail="Bike specification not found. Complete the chat first.")

    bike_spec = bike_specs[project_id]

    try:
        # Get project and user
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        user = project.user
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Initialize credit transaction service
        from app.services.credit_transaction_service import CreditTransactionService
        credit_service = CreditTransactionService(db)

        # Deduct credits first
        try:
            credit_service.deduct_credits(
                user=user,
                project=project,
                amount=1,
                description="Image generation"
            )
        except ValueError as e:
            if "Insufficient credits" in str(e):
                raise HTTPException(status_code=400, detail="Insufficient credits")
            raise HTTPException(status_code=400, detail=str(e))

        try:
            # Generate image
            specs = bike_spec.get_image_generation_specs()
            summary_prompt = create_image_prompt(specs)
            image_base64 = generate_bike_image(summary_prompt, client)
                        
            if project_id:
                save_image_to_project(project_id, image_base64)

        except Exception as e:
            # If image generation fails, refund credits
            credit_service.refund_credits(
                user=user,
                project=project,
                amount=1,
                description="Image generation failed - refund"
            )
            raise e
        
        return ImageGenerationResponse(image_base64=image_base64)
    except Exception as e:
        error_message = str(e)
        
        # Handle content policy violations specifically
        if "content_policy_violation" in error_message.lower() or "safety system" in error_message.lower():
            raise HTTPException(
                status_code=500, 
                detail="Image cannot be generated due to content policy violations. Please use safer, non-violent language in your bike description."
            )
        
        # Handle other OpenAI API errors
        if "openai" in error_message.lower() or "api" in error_message.lower():
            raise HTTPException(
                status_code=500, 
                detail=f"Image generation failed: {error_message}"
            )
        
        # Generic error
        raise HTTPException(status_code=500, detail=f"Image generation failed: {error_message}")


@router.get("/image/download/project/{project_id}")
def download_project_image(project_id: UUID, db: Session = Depends(get_db)):
    try:
        # Get project from database
        project = db.query(Project).filter(Project.id == project_id).first()
        
        # Check if project exists and has image data
        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")
            
        if not project.image_base64:
            raise HTTPException(status_code=500, detail="Project image data is missing or corrupted.")
        
        # Return the base64 image data
        return {
            "image_base64": project.image_base64,
            "project_id": str(project_id)
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))