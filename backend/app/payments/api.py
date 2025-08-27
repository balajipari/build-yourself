import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
import razorpay
from ..dependencies import get_db
from ..services.user_service import UserService
from ..services.project_quota_service import ProjectQuotaService
from ..services.currency_service import CurrencyService
from ..auth.google_oauth import verify_jwt_token

router = APIRouter()
security = HTTPBearer()

# Initialize Razorpay client
client = razorpay.Client(
    auth=(
        os.getenv("RAZORPAY_KEY_ID", ""),
        os.getenv("RAZORPAY_KEY_SECRET", "")
    )
)

class OrderRequest(BaseModel):
    package_id: UUID
    currency_code: str = "INR"

class PaymentVerificationRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str

@router.post("/create-order")
async def create_order(
    request: OrderRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Create a new Razorpay order"""
    try:
        # Verify JWT token
        payload = verify_jwt_token(credentials.credentials)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Get price in requested currency
        currency_service = CurrencyService(db)
        package = currency_service.get_credit_package(request.package_id)
        if not package:
            raise HTTPException(status_code=404, detail="Credit package not found")

        currency = currency_service.get_currency_by_code(request.currency_code)
        if not currency:
            raise HTTPException(status_code=404, detail="Currency not found")

        amount = currency.convert_from_usd(package.base_price_usd)
        
        # Create order
        order_data = {
            'amount': int(amount * 100),  # Convert to smallest currency unit
            'currency': currency.code,
            'payment_capture': 1  # Auto capture payment
        }
        order = client.order.create(data=order_data)

        return {
            "id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify")
async def verify_payment(
    request: PaymentVerificationRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Verify Razorpay payment and update user quota"""
    try:
        # Verify JWT token
        payload = verify_jwt_token(credentials.credentials)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Verify payment signature
        params_dict = {
            'razorpay_payment_id': request.razorpay_payment_id,
            'razorpay_order_id': request.razorpay_order_id,
            'razorpay_signature': request.razorpay_signature
        }
        client.utility.verify_payment_signature(params_dict)

        # Get user and update quota
        user_service = UserService(db)
        quota_service = ProjectQuotaService(db)
        
        user = user_service.get_user_by_id(payload["sub"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Reset project quota
        quota = quota_service.get_user_quota(user.id)
        quota.completed_projects_count = 0
        db.commit()

        return {"success": True, "message": "Payment verified and credits added"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
