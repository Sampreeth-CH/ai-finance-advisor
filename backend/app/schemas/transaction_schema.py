from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

# Base properties shared across all transaction schemas
class TransactionBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: Optional[datetime] = None

# Schema for creating a transaction (Input)
class TransactionCreate(TransactionBase):
    pass

# Schema for returning a transaction to the user (Output)
class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    date: datetime # Ensure date is always returned, even if auto-generated

    # Tells Pydantic to read data even if it is not a dict (SQLAlchemy models)
    model_config = ConfigDict(from_attributes=True)