from sqlalchemy.ext.asyncio import AsyncSession
from app.models.transaction import Transaction
from app.schemas.transaction_schema import TransactionCreate
from datetime import datetime
from sqlalchemy import select

async def create_transaction(db: AsyncSession, transaction_data: TransactionCreate, user_id: int):
    # 1. Convert the Pydantic schema to a dictionary
    data_dict = transaction_data.model_dump(exclude_unset=True)
    
    # 2. Ensure the date is set if it wasn't provided
    if "date" not in data_dict or data_dict["date"] is None:
        data_dict["date"] = datetime.utcnow()
        
    # 3. Create the SQLAlchemy model instance, linking it to the user
    # Notice the ** below! This is required to unpack the dictionary.
    db_transaction = Transaction(**data_dict, user_id=user_id)
    
    # 4. Save to the database
    db.add(db_transaction)
    await db.commit()
    await db.refresh(db_transaction)
    
    return db_transaction

async def get_user_transactions(db: AsyncSession, user_id: int, limit: int = 100):
    """
    Fetch the historical transactions for a specific user, sorted by newest first.
    This acts as the 'Memory' for our AI.
    """
    # Create a query to select transactions for this specific user
    query = select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.date.desc()).limit(limit)
    
    # Execute the query
    result = await db.execute(query)
    
    # Return the list of transaction objects
    return result.scalars().all()