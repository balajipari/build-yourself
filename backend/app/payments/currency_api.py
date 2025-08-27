"""
API endpoints for currency and credit package management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from ..dependencies import get_db, get_current_user_jwt
from ..services.currency_service import CurrencyService
from ..schemas import (
    CurrencyResponse,
    CreditPackageResponse,
    PriceResponse
)

router = APIRouter()

@router.get("/currencies", response_model=List[CurrencyResponse])
async def list_currencies(
    active_only: bool = True,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user_jwt)
):
    """Get list of available currencies"""
    currency_service = CurrencyService(db)
    return currency_service.get_currencies(active_only)

@router.get("/packages", response_model=List[CreditPackageResponse])
async def list_credit_packages(
    active_only: bool = True,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user_jwt)
):
    """Get list of credit packages"""
    currency_service = CurrencyService(db)
    return currency_service.get_credit_packages(active_only)

@router.get("/packages/{package_id}/price/{currency_code}", response_model=PriceResponse)
async def get_package_price(
    package_id: UUID,
    currency_code: str,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user_jwt)
):
    """Get price for a credit package in specified currency"""
    currency_service = CurrencyService(db)
    
    currency = currency_service.get_currency_by_code(currency_code)
    if not currency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Currency {currency_code} not found"
        )
    
    package = currency_service.get_credit_package(package_id)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Credit package not found"
        )
    
    amount = currency.convert_from_usd(package.base_price_usd)
    
    return PriceResponse(
        currency_code=currency.code,
        currency_symbol=currency.symbol,
        amount=amount,
        credits=package.credits
    )
