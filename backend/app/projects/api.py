"""
Project API router for project management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from app.dependencies import get_db, get_current_user_jwt
from app.services.project_service import ProjectService
from app.services.user_service import UserService
from app.schemas import (
    ProjectCreateSimple,
    ProjectUpdate, 
    ProjectResponse, 
    ProjectSearchResponse,
    ProjectSearchParams,
    PaginatedResponse,
    FavoriteToggle,
    FavoriteResponse,
    ErrorResponse
)


router = APIRouter()


@router.get("/ping")
def ping():
    return {"message": "Projects module is alive!"}



@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreateSimple,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Create a new project with auto-generated name"""
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_id(UUID(current_user["id"]))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        project_service = ProjectService(db)
        project = project_service.create_project_simple(
            user_id=user.id,
            project_data=project_data
        )
        
        # Convert SQLAlchemy model to Pydantic schema
        return ProjectResponse.model_validate(project)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/", response_model=PaginatedResponse[ProjectSearchResponse])
async def list_projects(
    search_key: Optional[str] = Query(None, description="Search term for name/description"),
    category: Optional[str] = Query(None, description="Filter by project type/category"),
    project_status: Optional[str] = Query(None, description="Filter by project status"),
    is_favorite: Optional[bool] = Query(None, description="Filter by favorite status"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Get paginated list of projects for the authenticated user with search and filters"""
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_id(UUID(current_user["id"]))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create search parameters
        search_params = ProjectSearchParams(
            search_key=search_key,
            category=category,
            status=project_status,
            is_favorite=is_favorite,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        project_service = ProjectService(db)
        result = project_service.get_user_projects(
            user_id=user.id,
            search_params=search_params
        )
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Get a specific project by ID"""
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_id(UUID(current_user["id"]))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        project_service = ProjectService(db)
        project = project_service.get_project_by_id(
            project_id=project_id,
            user_id=user.id
        )
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Convert SQLAlchemy model to Pydantic schema
        return ProjectResponse.model_validate(project)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Update an existing project"""
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_id(UUID(current_user["id"]))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        project_service = ProjectService(db)
        project = project_service.update_project(
            project_id=project_id,
            user_id=user.id,
            project_data=project_data
        )
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Convert SQLAlchemy model to Pydantic schema
        return ProjectResponse.model_validate(project)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{project_id}/image", response_model=ProjectResponse)
async def update_project_image(
    project_id: UUID,
    image_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Update project with generated image"""
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_id(UUID(current_user["id"]))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if "image_base64" not in image_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="image_base64 field is required"
            )
        
        project_service = ProjectService(db)
        project = project_service.update_project_image(
            project_id=project_id,
            user_id=user.id,
            image_base64=image_data["image_base64"]
        )
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Convert SQLAlchemy model to Pydantic schema
        return ProjectResponse.model_validate(project)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{project_id}/conversation", response_model=ProjectResponse)
async def update_conversation_history(
    project_id: UUID,
    conversation_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Update project conversation history"""
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_id(UUID(current_user["id"]))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if "conversation_history" not in conversation_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="conversation_history field is required"
            )
        
        project_service = ProjectService(db)
        project = project_service.update_conversation_history(
            project_id=project_id,
            user_id=user.id,
            conversation_history=conversation_data["conversation_history"]
        )
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Convert SQLAlchemy model to Pydantic schema
        return ProjectResponse.model_validate(project)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Delete a project"""
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_id(UUID(current_user["id"]))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        project_service = ProjectService(db)
        success = project_service.delete_project(
            project_id=project_id,
            user_id=user.id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{project_id}/favorite", response_model=FavoriteResponse)
async def toggle_favorite(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Toggle favorite status for a project"""
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_id(UUID(current_user["id"]))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        project_service = ProjectService(db)
        result = project_service.toggle_favorite(
            user_id=user.id,
            project_id=project_id
        )
        
        return FavoriteResponse(
            project_id=result["project_id"],
            is_favorite=result["is_favorite"],
            created_at=result.get("created_at")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/categories/list")
async def get_project_categories(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Get unique project categories for the authenticated user"""
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_id(UUID(current_user["id"]))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        project_service = ProjectService(db)
        categories = project_service.get_project_categories(user_id=user.id)
        
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/stats/summary")
async def get_project_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Get project statistics for the authenticated user"""
    try:
        user_service = UserService(db)
        user = user_service.get_user_by_id(UUID(current_user["id"]))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        project_service = ProjectService(db)
        stats = project_service.get_project_stats(user_id=user.id)
        
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )



