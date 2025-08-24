from pydantic import BaseModel, Field, validator
from typing import List, Literal, Optional, Dict, Any, Union
from enum import Enum

class QuestionType(str, Enum):
    BIKE_CATEGORY = "bike_category"
    FRONT_BODYWORK = "front_bodywork"
    WINDSCREEN = "windscreen"
    HEADLIGHT = "headlight"
    ENGINE = "engine"
    HANDLEBAR = "handlebar"
    MIRROR = "mirror"
    FUEL_TANK = "fuel_tank"
    SEAT = "seat"
    EXHAUST = "exhaust"
    WHEELS = "wheels"
    SUSPENSION = "suspension"
    FENDER = "fender"
    COLOR = "color"
    FRAME_GEOMETRY = "frame_geometry"
    CUSTOM_FOLLOWUP = "custom_followup"

class QuestionOption(BaseModel):
    number: int
    text: str
    value: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format for API response"""
        return {
            "number": self.number,
            "text": self.text,
            "value": self.value
        }

class QuestionResponse(BaseModel):
    question_type: Union[QuestionType, str]
    question_text: str
    options: List[QuestionOption]
    current_step: int
    total_steps: int = 15
    is_complete: bool = False
    user_feedback: Optional[str] = None
    parent_question: Optional[str] = None
    follow_up_count: int = 0
    max_follow_ups: int = 3
    
    def get_options_dict(self) -> List[Dict[str, Any]]:
        """Get options as dictionary list for API response"""
        return [opt.to_dict() for opt in self.options]
    
    def is_custom_followup(self) -> bool:
        """Check if this is a custom follow-up question"""
        return self.question_type == "custom_followup"
    
    def has_parent_question(self) -> bool:
        """Check if this question has a parent question"""
        return self.parent_question is not None

class CustomField(BaseModel):
    field_name: str
    value: str
    
    @validator('value')
    def validate_value_length(cls, v):
        if len(v) > 500:
            raise ValueError('Custom field value must be 500 characters or less')
        return v
    
    @validator('field_name')
    def validate_field_name(cls, v):
        if len(v) > 100:
            raise ValueError('Custom field name must be 100 characters or less')
        return v

class BikeSpecification(BaseModel):
    # Predefined fields
    bike_category: Optional[str] = None
    front_bodywork: Optional[str] = None
    windscreen: Optional[str] = None
    headlight: Optional[str] = None
    engine: Optional[str] = None
    handlebar: Optional[str] = None
    mirror: Optional[str] = None
    fuel_tank: Optional[str] = None
    seat: Optional[str] = None
    exhaust: Optional[str] = None
    wheels: Optional[str] = None
    suspension: Optional[str] = None
    fender: Optional[str] = None
    color: Optional[str] = None
    frame_geometry: Optional[str] = None
    
    # Dynamic custom fields
    custom_fields: Dict[str, str] = Field(default_factory=dict)
    
    def add_custom_field(self, field_name: str, value: str) -> bool:
        """Add a custom field with validation"""
        if len(value) > 500:
            return False
        
        self.custom_fields[field_name] = value
        return True
    
    def get_image_generation_specs(self) -> Dict[str, str]:
        """Get specifications suitable for image generation"""
        specs = {}
        
        # Add predefined fields
        for field, value in self.model_dump().items():
            if field != 'custom_fields' and value is not None:
                specs[field] = value
        
        # Add relevant custom fields
        for field_name, value in self.custom_fields.items():
            specs[f"custom_{field_name}"] = value
        
        return specs
    
    def validate_and_clean_custom_fields(self, validation_func) -> None:
        """Validate and clean custom fields using provided validation function"""
        validated_custom_fields = {}
        for field_name, value in self.custom_fields.items():
            if validation_func(value):
                validated_custom_fields[field_name] = value
            else:
                print(f"Rejected custom field '{field_name}': '{value}' - validation failed")
        self.custom_fields = validated_custom_fields
    
    def has_custom_fields(self) -> bool:
        """Check if bike specification has any custom fields"""
        return len(self.custom_fields) > 0
    
    def get_total_fields_count(self) -> int:
        """Get total number of fields (predefined + custom)"""
        predefined_count = sum(1 for value in self.model_dump().values() 
                              if value is not None and value != self.custom_fields)
        return predefined_count + len(self.custom_fields)

class StructuredLLMResponse(BaseModel):
    """Structured response from LLM for bike configuration"""
    type: Literal["question", "completion", "error"]
    content: Union[QuestionResponse, BikeSpecification, str]
    message: str
    
    def is_question_response(self) -> bool:
        """Check if response is a question type"""
        return self.type == "question"
    
    def is_completion_response(self) -> bool:
        """Check if response is a completion type"""
        return self.type == "completion"
    
    def is_error_response(self) -> bool:
        """Check if response is an error type"""
        return self.type == "error"
    
    def get_question_content(self) -> Optional[QuestionResponse]:
        """Get question content if response is question type"""
        if self.is_question_response() and isinstance(self.content, QuestionResponse):
            return self.content
        return None
    
    def get_bike_specification(self) -> Optional[BikeSpecification]:
        """Get bike specification if response is completion type"""
        if self.is_completion_response() and isinstance(self.content, BikeSpecification):
            return self.content
        return None

# API Request/Response Models
class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

class ChatSessionRequest(BaseModel):
    session_id: str
    user_message: str
    project_id: Optional[str] = None  # Optional project ID to associate chat with

class ChatResponse(BaseModel):
    ai_message: str
    is_complete: bool
    question_text: Optional[str] = None
    options: Optional[List[dict]] = None
    current_step: Optional[int] = None
    total_steps: Optional[int] = None
    raw_response: Optional[dict] = None
    
    @classmethod
    def from_question_response(cls, structured_response: StructuredLLMResponse, question_content: QuestionResponse):
        """Create ChatResponse from question type response"""
        return cls(
            ai_message=structured_response.message,
            is_complete=False,
            question_text=question_content.question_text,
            options=question_content.get_options_dict(),
            current_step=question_content.current_step,
            total_steps=question_content.total_steps
        )
    
    @classmethod
    def from_completion_response(cls, structured_response: StructuredLLMResponse):
        """Create ChatResponse from completion type response"""
        return cls(
            ai_message=structured_response.message,
            is_complete=True
        )
    
    @classmethod
    def from_error_response(cls, structured_response: StructuredLLMResponse):
        """Create ChatResponse from error type response"""
        return cls(
            ai_message=structured_response.message,
            is_complete=False,
            options=[]
        )
    
    @classmethod
    def from_fallback_response(cls, structured_response: StructuredLLMResponse):
        """Create ChatResponse from fallback response"""
        return cls(
            ai_message=structured_response.message,
            is_complete=False,
            options=[],
            raw_response=None
        )

class ImageGenerationRequest(BaseModel):
    session_id: str
    project_id: Optional[str] = None  # Optional project ID to save image to project

class ImageGenerationResponse(BaseModel):
    image_base64: str 