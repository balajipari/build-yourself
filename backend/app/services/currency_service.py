"""
Service for managing currencies and credit packages
"""

from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional

from ..models import Currency, CreditPackage
from ..schemas import CurrencyCreate, CurrencyUpdate, CreditPackageCreate, CreditPackageUpdate

class CurrencyService:
    def __init__(self, db: Session):
        self.db = db

    def get_currencies(self, active_only: bool = True) -> List[Currency]:
        """Get all currencies"""
        query = select(Currency)
        if active_only:
            query = query.where(Currency.is_active == True)
        return list(self.db.execute(query).scalars().all())

    def get_currency_by_code(self, code: str) -> Optional[Currency]:
        """Get currency by code"""
        return self.db.query(Currency).filter(Currency.code == code.upper()).first()

    def create_currency(self, currency_data: CurrencyCreate) -> Currency:
        """Create a new currency"""
        currency = Currency(**currency_data.model_dump())
        self.db.add(currency)
        self.db.commit()
        self.db.refresh(currency)
        return currency

    def update_currency(self, code: str, currency_data: CurrencyUpdate) -> Optional[Currency]:
        """Update a currency"""
        currency = self.get_currency_by_code(code)
        if not currency:
            return None

        for key, value in currency_data.model_dump(exclude_unset=True).items():
            setattr(currency, key, value)

        self.db.commit()
        self.db.refresh(currency)
        return currency

    def get_credit_packages(self, active_only: bool = True) -> List[CreditPackage]:
        """Get all credit packages"""
        query = select(CreditPackage)
        if active_only:
            query = query.where(CreditPackage.is_active == True)
        return list(self.db.execute(query).scalars().all())

    def get_credit_package(self, package_id: UUID) -> Optional[CreditPackage]:
        """Get credit package by ID"""
        return self.db.query(CreditPackage).filter(CreditPackage.id == package_id).first()

    def create_credit_package(self, package_data: CreditPackageCreate) -> CreditPackage:
        """Create a new credit package"""
        package = CreditPackage(**package_data.model_dump())
        self.db.add(package)
        self.db.commit()
        self.db.refresh(package)
        return package

    def update_credit_package(self, package_id: UUID, package_data: CreditPackageUpdate) -> Optional[CreditPackage]:
        """Update a credit package"""
        package = self.get_credit_package(package_id)
        if not package:
            return None

        for key, value in package_data.model_dump(exclude_unset=True).items():
            setattr(package, key, value)

        self.db.commit()
        self.db.refresh(package)
        return package

    def calculate_price(self, package_id: UUID, currency_code: str) -> Optional[float]:
        """Calculate price for a credit package in specified currency"""
        package = self.get_credit_package(package_id)
        currency = self.get_currency_by_code(currency_code)
        
        if not package or not currency:
            return None
            
        return currency.convert_from_usd(package.base_price_usd)
