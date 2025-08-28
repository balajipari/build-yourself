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
    id: UUID
    name: str
    description: Optional[str]
    project_type: str
    status: str
    image_base64: Optional[str] = None
    completion_timestamp: Optional[datetime] = None
    progress: Optional[int] = None
    is_favorite: bool = False
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        status = getattr(obj, 'status', None)
        status = status.value if hasattr(status, 'value') else status
        
        project_type = getattr(obj, 'project_type', None)
        project_type = project_type.value if hasattr(project_type, 'value') else project_type
        
        configuration = getattr(obj, 'configuration', {}) or {}
        completion_timestamp = configuration.get('completion_timestamp')
        
        progress = None
        if status == 'DRAFT':
            conversation_history = getattr(obj, 'conversation_history', []) or []
            if conversation_history:
                total_questions = 15
                if isinstance(configuration, dict):
                    custom_fields = configuration.get('bike_specification', {}).get('custom_fields', {})
                    total_questions += len(custom_fields) if custom_fields else 0
                progress = min(100, int((len(conversation_history) / total_questions) * 100))
        
        return super().model_validate({
            'id': getattr(obj, 'id', None),
            'name': getattr(obj, 'name', None),
            'description': getattr(obj, 'description', None),
            'project_type': project_type,
            'status': status,
            'image_base64': getattr(obj, 'image_base64', None),
            'is_favorite': getattr(obj, 'is_favorite', False),
            'completion_timestamp': completion_timestamp,
            'progress': progress
        })


class ProjectResponse(ProjectBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    is_favorite: bool = False

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

class FavoriteToggle(BaseModel):
    project_id: UUID = Field(..., description="Project ID to toggle favorite status")


class FavoriteResponse(BaseModel):
    project_id: UUID
    is_favorite: bool
    created_at: Optional[datetime] = None
    message: Optional[str] = None
    
    class Config:
        from_attributes = True


# Error response
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None


# Project Quota schemas
class ProjectQuotaBase(BaseModel):
    completed_projects_count: int
    free_projects_remaining: int


class ProjectQuotaCreate(ProjectQuotaBase):
    user_id: UUID

class ProjectQuotaUpdate(BaseModel):
    completed_projects_count: Optional[int] = None

class ProjectQuotaResponse(ProjectQuotaBase):
    id: UUID
    user_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Currency schemas
class CurrencyBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=3, description="Currency code (e.g., USD)")
    name: str = Field(..., min_length=1, max_length=50, description="Currency name")
    symbol: str = Field(..., min_length=1, max_length=5, description="Currency symbol")
    rate_to_usd: float = Field(..., gt=0, description="Exchange rate to USD")
    is_active: bool = Field(True, description="Whether the currency is active")

class CurrencyCreate(CurrencyBase):
    pass

class CurrencyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    symbol: Optional[str] = Field(None, min_length=1, max_length=5)
    rate_to_usd: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None

class CurrencyResponse(CurrencyBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Credit Package schemas
class CreditPackageBase(BaseModel):
    credits: int = Field(..., gt=0, description="Number of credits")
    base_price_usd: float = Field(..., gt=0, description="Base price in USD")
    is_active: bool = Field(True, description="Whether the package is active")

class CreditPackageCreate(CreditPackageBase):
    pass

class CreditPackageUpdate(BaseModel):
    credits: Optional[int] = Field(None, gt=0)
    base_price_usd: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None

class CreditPackageResponse(CreditPackageBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PriceResponse(BaseModel):
    currency_code: str
    currency_symbol: str
    amount: float
    credits: int

# Feedback schemas
class FeedbackCreate(BaseModel):
    feedback_text: str = Field(..., description="Feedback text content")
    selected_tags: Optional[List[str]] = Field(None, description="Selected suggestion tags")
    rating: Optional[float] = Field(None, ge=1, le=5, description="Rating between 1 and 5")
    user_id: Optional[UUID] = Field(None, description="User ID for authenticated feedback")

class FeedbackResponse(BaseModel):
    id: UUID
    feedback_text: str
    selected_tags: Optional[List[str]] = Field(None, description="Selected suggestion tags")
    rating: Optional[float] = Field(None, description="Rating between 1 and 5")
    user_id: Optional[UUID] = Field(None, description="User ID for authenticated feedback")
    created_at: datetime

    class Config:
        from_attributes = True