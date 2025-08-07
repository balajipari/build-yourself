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
    # Custom follow-up types
    CUSTOM_FOLLOWUP = "custom_followup"

class QuestionOption(BaseModel):
    number: int
    text: str
    value: str

class QuestionResponse(BaseModel):
    question_type: Union[QuestionType, str]  # Allow custom question types
    question_text: str
    options: List[QuestionOption]
    current_step: int
    total_steps: int = 15  # Will be dynamic based on custom inputs
    is_complete: bool = False
    user_feedback: Optional[str] = None
    # Follow-up tracking
    parent_question: Optional[str] = None  # Which question this follow-up belongs to
    follow_up_count: int = 0  # How many follow-ups for this parent question
    max_follow_ups: int = 3  # Maximum follow-ups allowed per custom selection

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
            return False  # Validation failed
        
        # Add the custom field without relevance check
        self.custom_fields[field_name] = value
        return True
    
    def get_image_generation_specs(self) -> Dict[str, str]:
        """Get specifications suitable for image generation"""
        specs = {}
        
        # Add predefined fields
        for field, value in self.dict().items():
            if field != 'custom_fields' and value is not None:
                specs[field] = value
        
        # Add relevant custom fields
        for field_name, value in self.custom_fields.items():
            specs[f"custom_{field_name}"] = value
        
        return specs

class StructuredLLMResponse(BaseModel):
    """Structured response from LLM for bike configuration"""
    type: Literal["question", "completion", "error"]
    content: Union[QuestionResponse, BikeSpecification, str]
    message: str  # Human-readable message for display 