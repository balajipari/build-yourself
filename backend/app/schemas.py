"""
Pydantic schemas for API request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Literal, Generic, TypeVar
from datetime import datetime
from uuid import UUID
from .models import UserStatus, ProjectStatus

# Generic type for paginated items
T = TypeVar('T')


# Base schemas
class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    full_name: Optional[str] = Field(None, description="Full name")
    avatar_url: Optional[str] = Field(None, description="Avatar URL")
    google_id: Optional[str] = Field(None, description="Google OAuth ID")
    status: str = Field(UserStatus.ACTIVE, description="User status")


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(None, description="Project description")
    project_type: str = Field(..., min_length=1, max_length=50, description="Project type (e.g., 'bike', 'car')")
    status: Literal["DRAFT", "IN_PROGRESS", "COMPLETED", "ARCHIVED"] = Field(ProjectStatus.DRAFT, description="Project status")
    configuration: Optional[Dict[str, Any]] = Field(None, description="Project configuration data")
    image_base64: Optional[str] = Field(None, description="Generated image as base64 string")
    conversation_history: Optional[List[Dict[str, Any]]] = Field(None, description="Chat conversation history")


# Create schemas
class UserCreate(UserBase):
    pass


class ProjectCreate(BaseModel):
    name: str = Field(..., description="Project name")
    description: Optional[str] = Field(None, description="Project description")
    project_type: str = Field(..., description="Project type")
    status: ProjectStatus = Field(ProjectStatus.DRAFT, description="Project status")


class ProjectCreateSimple(BaseModel):
    """Simplified project creation - only requires project type"""
    project_type: str = Field(..., min_length=1, max_length=50, description="Project type (e.g., 'bike', 'car')")


# Update schemas
class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, description="Full name")
    avatar_url: Optional[str] = Field(None, description="Avatar URL")
    status: Optional[Literal["ACTIVE", "INACTIVE", "SUSPENDED"]] = Field(None, description="User status")


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(None, description="Project description")
    status: Optional[Literal["DRAFT", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]] = Field(None, description="Project status")
    configuration: Optional[Dict[str, Any] | None] = Field(None, description="Project configuration data")
    image_base64: Optional[str] = Field(None, description="Generated image as base64 string")
    conversation_history: Optional[List[Dict[str, Any]]] = Field(None, description="Chat conversation history")


# Response schemas
class UserResponse(UserBase):
    id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        """Custom validation to handle enum conversion"""
        if hasattr(obj, 'status') and hasattr(obj.status, 'value'):
            # Convert enum to string value
            obj.status = obj.status.value
        return super().model_validate(obj)


class ProjectSearchResponse(BaseModel):
    """Simplified project response for search results - only essential fields"""
    id: UUID
    name: str
    description: Optional[str]
    project_type: str
    status: str
    image_base64: Optional[str] = None  # Generated image as base64 string
    completion_timestamp: Optional[datetime] = None
    progress: Optional[int] = None  # Progress for draft projects (0-100)
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        """Custom validation to handle enum conversion and calculate progress"""
        # Convert enum to string value if needed
        if hasattr(obj, 'status') and hasattr(obj.status, 'value'):
            obj.status = obj.status.value
        if hasattr(obj, 'project_type') and hasattr(obj.project_type, 'value'):
            obj.project_type = obj.project_type.value
        
        # Get image_base64 from the object
        image_base64 = getattr(obj, 'image_base64', None)
        
        # Calculate completion timestamp from configuration if available
        completion_timestamp = None
        if hasattr(obj, 'configuration') and obj.configuration:
            if isinstance(obj.configuration, dict):
                completion_timestamp = obj.configuration.get('completion_timestamp')
        
        # Calculate progress for draft projects
        progress = None
        if hasattr(obj, 'status') and obj.status == 'DRAFT':
            if hasattr(obj, 'conversation_history') and obj.conversation_history:
                # Progress = (conversation length / total expected questions) * 100
                # Assuming 15 is the base number of questions, plus any custom questions
                conversation_length = len(obj.conversation_history)
                total_questions = 15  # Base questions
                
                # If we have custom fields in configuration, add them to total
                if hasattr(obj, 'configuration') and obj.configuration:
                    if isinstance(obj.configuration, dict):
                        custom_fields = obj.configuration.get('bike_specification', {}).get('custom_fields', {})
                        if custom_fields:
                            total_questions += len(custom_fields)
                
                # Calculate percentage: (completed / total) * 100
                progress = min(100, int((conversation_length / total_questions) * 100))
        
        # Create a new object with calculated fields
        obj_dict = {
            'id': obj.id,
            'name': obj.name,
            'description': obj.description,
            'project_type': obj.project_type,
            'status': obj.status,
            'image_base64': image_base64,
            'completion_timestamp': completion_timestamp,
            'progress': progress
        }
        
        return super().model_validate(obj_dict)


class ProjectResponse(ProjectBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        """Custom validation to handle enum conversion"""
        if hasattr(obj, 'status') and hasattr(obj.status, 'value'):
            # Convert enum to string value
            obj.status = obj.status.value
        if hasattr(obj, 'project_type') and hasattr(obj.project_type, 'value'):
            # Convert enum to string value if project_type is also an enum
            obj.project_type = obj.project_type.value
        return super().model_validate(obj)


class ProjectWithUserResponse(ProjectResponse):
    user: UserResponse
    
    class Config:
        from_attributes = True


# Search and filter schemas
class ProjectSearchParams(BaseModel):
    search_key: Optional[str] = Field(None, description="Search term for name/description")
    category: Optional[str] = Field(None, description="Filter by project type/category")
    status: Optional[Literal["DRAFT", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]] = Field(None, description="Filter by project status")
    is_favorite: Optional[bool] = Field(None, description="Filter by favorite status")
    sort_by: str = Field("created_at", description="Sort field (created_at, name, updated_at)")
    sort_order: str = Field("desc", description="Sort order (asc, desc)")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Page size")
    
    @validator('sort_order')
    def validate_sort_order(cls, v):
        if v not in ['asc', 'desc']:
            raise ValueError('sort_order must be "asc" or "desc"')
        return v
    
    @validator('sort_by')
    def validate_sort_by(cls, v):
        allowed_fields = ['created_at', 'name', 'updated_at', 'status']
        if v not in allowed_fields:
            raise ValueError(f'sort_by must be one of: {", ".join(allowed_fields)}')
        return v


# Pagination response
class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


# Favorite schemas
class FavoriteToggle(BaseModel):
    project_id: UUID = Field(..., description="Project ID to toggle favorite status")


class FavoriteResponse(BaseModel):
    project_id: UUID
    is_favorite: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Error response
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
