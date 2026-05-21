from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    # --- NEW: Shared Wallet / Split Columns ---
    split_with = Column(String, nullable=True)
    split_amount = Column(Float, nullable=True)

    # Note: Since you named this 'owner', your User model must use back_populates="owner"
    owner = relationship(
        "User",
        back_populates="transactions"
    )