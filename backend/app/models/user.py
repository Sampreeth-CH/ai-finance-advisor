from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # --- NEW: Profile Fields ---
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    mobile_no = Column(String, nullable=True)
    place = Column(String, nullable=True)
    address = Column(String, nullable=True)
    profile_pic = Column(String, nullable=True) # Text/String to store Base64 image

    # Added cascade="all, delete-orphan" for production-level cleanup
    transactions = relationship(
        "Transaction",
        back_populates="owner",
        cascade="all, delete-orphan"
    )