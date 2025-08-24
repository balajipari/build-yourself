"""
Project service layer for business logic
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from uuid import UUID
import json

from ..models import Project, User, UserFavorite, ProjectStatus
from ..schemas import ProjectCreate, ProjectCreateSimple, ProjectUpdate, ProjectSearchParams, PaginatedResponse


class ProjectService:
    """Service class for project operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def _generate_project_name(self, user_id: UUID, project_type: str) -> str:
        """Generate an auto-incremented project name like 'Untitled (1)', 'Untitled (2)'"""
        try:
            # Count existing projects of this type for the user
            count = self.db.query(func.count(Project.id)).filter(
                and_(
                    Project.user_id == user_id,
                    Project.project_type == project_type
                )
            ).scalar()
            
            # Generate name with increment
            return f"Untitled {project_type} ({count + 1})"
        except Exception:
            # Fallback to simple name if counting fails
            return f"Untitled {project_type} {project_type}"
    
    def create_project_simple(self, user_id: UUID, project_data: ProjectCreateSimple) -> Project:
        """Create a new project with auto-generated name"""
        try:
            # Generate auto-incremented name
            project_name = self._generate_project_name(user_id, project_data.project_type)
            
            project = Project(
                user_id=user_id,
                name=project_name,
                description=None,
                project_type=project_data.project_type,
                status=ProjectStatus.DRAFT,
                configuration={},
                image_base64=None,
                conversation_history=[]
            )
            
            self.db.add(project)
            self.db.commit()
            self.db.refresh(project)
            
            return project
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to create project: {str(e)}")
    
    def create_project(self, user_id: UUID, project_data: ProjectCreate) -> Project:
        """Create a new project for a user"""
        try:
            project = Project(
                user_id=user_id,
                name=project_data.name,
                description=project_data.description,
                project_type=project_data.project_type,
                status=project_data.status,
                configuration=project_data.configuration,
                image_base64=project_data.image_base64,
                conversation_history=project_data.conversation_history or []
            )
            
            self.db.add(project)
            self.db.commit()
            self.db.refresh(project)
            
            return project
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to create project: {str(e)}")
    
    def update_project_image(self, project_id: UUID, user_id: UUID, image_base64: str) -> Optional[Project]:
        """Update project with generated image"""
        try:
            project = self.get_project_by_id(project_id, user_id)
            if not project:
                return None
            
            project.image_base64 = image_base64
            self.db.commit()
            self.db.refresh(project)
            
            return project
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to update project image: {str(e)}")
    
    def update_conversation_history(self, project_id: UUID, user_id: UUID, conversation_history: List[Dict[str, Any]]) -> Optional[Project]:
        """Update project conversation history"""
        try:
            project = self.get_project_by_id(project_id, user_id)
            if not project:
                return None
            
            project.conversation_history = conversation_history
            self.db.commit()
            self.db.refresh(project)
            
            return project
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to update conversation history: {str(e)}")


    
    def get_project_by_id(self, project_id: UUID, user_id: UUID) -> Optional[Project]:
        """Get a project by ID for a specific user"""
        return self.db.query(Project).filter(
            and_(
                Project.id == project_id,
                Project.user_id == user_id
            )
        ).first()
    
    def get_user_projects(
        self, 
        user_id: UUID, 
        search_params: ProjectSearchParams
    ) -> PaginatedResponse:
        """Get paginated projects for a user with search and filters"""
        try:
            # Base query
            query = self.db.query(Project).filter(Project.user_id == user_id)
            
            # Apply search filter
            if search_params.search_key:
                search_term = f"%{search_params.search_key}%"
                query = query.filter(
                    or_(
                        Project.name.ilike(search_term),
                        Project.description.ilike(search_term)
                    )
                )
            
            # Apply category filter
            if search_params.category:
                query = query.filter(Project.project_type == search_params.category)
            
            # Apply status filter
            if search_params.status:
                query = query.filter(Project.status == search_params.status)
            
            # Apply favorite filter
            if search_params.is_favorite is not None:
                if search_params.is_favorite:
                    # Get projects that are favorited by the user
                    favorited_projects = self.db.query(UserFavorite.project_id).filter(
                        UserFavorite.user_id == user_id
                    ).subquery()
                    query = query.filter(Project.id.in_(favorited_projects))
                else:
                    # Get projects that are NOT favorited by the user
                    favorited_projects = self.db.query(UserFavorite.project_id).filter(
                        UserFavorite.user_id == user_id
                    ).subquery()
                    query = query.filter(~Project.id.in_(favorited_projects))
            
            # Get total count before pagination
            total = query.count()
            
            # Apply sorting
            if search_params.sort_by == "name":
                sort_field = Project.name
            elif search_params.sort_by == "updated_at":
                sort_field = Project.updated_at
            elif search_params.sort_by == "status":
                sort_field = Project.status
            else:  # default to created_at
                sort_field = Project.created_at
            
            if search_params.sort_order == "asc":
                query = query.order_by(asc(sort_field))
            else:
                query = query.order_by(desc(sort_field))
            
            # Apply pagination
            offset = (search_params.page - 1) * search_params.page_size
            projects = query.offset(offset).limit(search_params.page_size).all()
            
            # Calculate total pages
            total_pages = (total + search_params.page_size - 1) // search_params.page_size
            
            # Convert SQLAlchemy models to Pydantic schemas
            from ..schemas import ProjectResponse
            project_schemas = [ProjectResponse.model_validate(project) for project in projects]
            
            return PaginatedResponse(
                items=project_schemas,
                total=total,
                page=search_params.page,
                page_size=search_params.page_size,
                total_pages=total_pages
            )
            
        except Exception as e:
            raise Exception(f"Failed to get user projects: {str(e)}")
    
    def update_project(
        self, 
        project_id: UUID, 
        user_id: UUID, 
        project_data: ProjectUpdate
    ) -> Optional[Project]:
        """Update an existing project"""
        try:
            project = self.get_project_by_id(project_id, user_id)
            if not project:
                return None
            
            # Update only provided fields
            update_data = project_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(project, field, value)
            
            self.db.commit()
            self.db.refresh(project)
            
            return project
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to update project: {str(e)}")
    
    def delete_project(self, project_id: UUID, user_id: UUID) -> bool:
        """Delete a project"""
        try:
            project = self.get_project_by_id(project_id, user_id)
            if not project:
                return False
            
            self.db.delete(project)
            self.db.commit()
            
            return True
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to delete project: {str(e)}")
    
    def toggle_favorite(self, user_id: UUID, project_id: UUID) -> Dict[str, Any]:
        """Toggle favorite status for a project"""
        try:
            # Check if project exists and belongs to user
            project = self.get_project_by_id(project_id, user_id)
            if not project:
                raise Exception("Project not found")
            
            # Check if already favorited
            existing_favorite = self.db.query(UserFavorite).filter(
                and_(
                    UserFavorite.user_id == user_id,
                    UserFavorite.project_id == project_id
                )
            ).first()
            
            if existing_favorite:
                # Remove from favorites
                self.db.delete(existing_favorite)
                is_favorite = False
            else:
                # Add to favorites
                new_favorite = UserFavorite(
                    user_id=user_id,
                    project_id=project_id
                )
                self.db.add(new_favorite)
                is_favorite = True
            
            self.db.commit()
            
            return {
                "project_id": project_id,
                "is_favorite": is_favorite,
                "message": "Added to favorites" if is_favorite else "Removed from favorites"
            }
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to toggle favorite: {str(e)}")
    
    def get_project_categories(self, user_id: UUID) -> List[str]:
        """Get unique project categories for a user"""
        try:
            categories = self.db.query(Project.project_type).filter(
                Project.user_id == user_id
            ).distinct().all()
            
            return [category[0] for category in categories]
        except Exception as e:
            raise Exception(f"Failed to get project categories: {str(e)}")
    
    def get_project_stats(self, user_id: UUID) -> Dict[str, Any]:
        """Get project statistics for a user"""
        try:
            total_projects = self.db.query(func.count(Project.id)).filter(
                Project.user_id == user_id
            ).scalar()
            
            projects_by_status = self.db.query(
                Project.status,
                func.count(Project.id)
            ).filter(
                Project.user_id == user_id
            ).group_by(Project.status).all()
            
            total_favorites = self.db.query(func.count(UserFavorite.id)).filter(
                UserFavorite.user_id == user_id
            ).scalar()
            
            return {
                "total_projects": total_projects or 0,
                "total_favorites": total_favorites or 0,
                "by_status": {status: count for status, count in projects_by_status}
            }
            
        except Exception as e:
            raise Exception(f"Failed to get project stats: {str(e)}")
