from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

# Adjust these imports based on your exact file structure
from app.core.database import get_db 
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction_schema import TransactionCreate, TransactionResponse
from typing import List
from app.services.transaction_service import get_user_transactions
router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)

@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save a new transaction linked to the logged-in user.
    """
    # Create the SQLAlchemy model instance
    # We unpack the Pydantic schema and forcefully attach the logged-in user's ID
    new_transaction = Transaction(
        **transaction_data.model_dump(),
        user_id=current_user.id
    )
    
    # Save to database (Async operations)
    db.add(new_transaction)
    await db.commit()
    await db.refresh(new_transaction)
    
    return new_transaction


@router.get("/", response_model=List[TransactionResponse])
async def get_history(
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch the logged-in user's transaction history.
    This is the data the AI will use to understand long-term spending habits.
    """
    transactions = await get_user_transactions(db, current_user.id, limit)
    return transactions