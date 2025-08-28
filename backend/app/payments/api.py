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
razorpay_key_id = os.getenv("RAZORPAY_KEY_ID", "")
razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")

if not razorpay_key_id or not razorpay_key_secret:
    raise ValueError("Razorpay credentials not configured")


client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))

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

        # Get user first to ensure they exist
        user_service = UserService(db)
        quota_service = ProjectQuotaService(db)
        
        user = user_service.get_user_by_id(payload["sub"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        try:
            # Verify payment signature
            params_dict = {
                'razorpay_payment_id': request.razorpay_payment_id,
                'razorpay_order_id': request.razorpay_order_id,
                'razorpay_signature': request.razorpay_signature
            }
            client.utility.verify_payment_signature(params_dict)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")

        try:
            # Get the credit package details
            currency_service = CurrencyService(db)
            payment = client.payment.fetch(request.razorpay_payment_id)
            order = client.order.fetch(request.razorpay_order_id)
            
            # Find the package that matches the order amount and currency
            packages = currency_service.get_credit_packages()
            currency = currency_service.get_currency_by_code(order['currency'])
            if not currency:
                raise HTTPException(status_code=400, detail=f"Currency {order['currency']} not found")
            
            matching_package = None
            for package in packages:
                amount = currency.convert_from_usd(package.base_price_usd)
                amount_in_smallest_unit = int(amount * 100)
                if amount_in_smallest_unit == order['amount']:
                    matching_package = package
                    break
                    
            if not matching_package:
                raise HTTPException(status_code=400, detail="Could not match payment to credit package")
                
            # Add credits to user's quota
            quota_service.add_credits(user.id, matching_package.credits)

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing payment: {str(e)}")
        
        return {
            "success": True,
            "message": f"Payment verified and {matching_package.credits} credits added",
            "credits_added": matching_package.credits
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
