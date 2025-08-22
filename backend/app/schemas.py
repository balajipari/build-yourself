"""
Pydantic schemas for API request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from uuid import UUID
from .models import USER_STATUS, PROJECT_STATUS


# Base schemas
class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    full_name: Optional[str] = Field(None, description="Full name")
    avatar_url: Optional[str] = Field(None, description="Avatar URL")
    google_id: Optional[str] = Field(None, description="Google OAuth ID")
    status: str = Field(USER_STATUS["ACTIVE"], description="User status")


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(None, description="Project description")
    project_type: str = Field(..., min_length=1, max_length=50, description="Project type (e.g., 'bike', 'car')")
    status: Literal["draft", "in_progress", "completed", "archived"] = Field(PROJECT_STATUS["DRAFT"], description="Project status")
    configuration: Optional[Dict[str, Any]] = Field(None, description="Project configuration data")
    image_base64: Optional[str] = Field(None, description="Generated image as base64 string")
    conversation_history: Optional[List[Dict[str, Any]]] = Field(None, description="Chat conversation history")


# Create schemas
class UserCreate(UserBase):
    pass


class ProjectCreate(ProjectBase):
    pass


class ProjectCreateSimple(BaseModel):
    """Simplified project creation - only requires project type"""
    project_type: str = Field(..., min_length=1, max_length=50, description="Project type (e.g., 'bike', 'car')")


# Update schemas
class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, description="Full name")
    avatar_url: Optional[str] = Field(None, description="Avatar URL")
    status: Optional[Literal["active", "inactive", "suspended"]] = Field(None, description="User status")


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(None, description="Project description")
    status: Optional[Literal["draft", "in_progress", "completed", "archived"]] = Field(None, description="Project status")
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


class ProjectResponse(ProjectBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProjectWithUserResponse(ProjectResponse):
    user: UserResponse
    
    class Config:
        from_attributes = True


# Search and filter schemas
class ProjectSearchParams(BaseModel):
    search_key: Optional[str] = Field(None, description="Search term for name/description")
    category: Optional[str] = Field(None, description="Filter by project type/category")
    status: Optional[Literal["draft", "in_progress", "completed", "archived"]] = Field(None, description="Filter by project status")
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
class PaginatedResponse(BaseModel):
    items: List[Any]
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
