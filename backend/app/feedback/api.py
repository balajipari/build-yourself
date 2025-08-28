"""Feedback API endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..dependencies import get_db
from ..models import Feedback
from ..schemas import FeedbackCreate, FeedbackResponse
from ..dependencies import get_current_user_jwt_optional

router = APIRouter()

@router.post("/submit", response_model=FeedbackResponse)
async def submit_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_jwt_optional)
):
    """Submit user feedback"""
    try:
        # Create feedback entry
        db_feedback = Feedback(
            feedback_text=feedback.feedback_text,
            selected_tags=feedback.selected_tags,
            user_id=current_user["id"] if current_user else None,
            rating=feedback.rating
        )
        db.add(db_feedback)
        db.commit()
        db.refresh(db_feedback)
        
        return db_feedback
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
