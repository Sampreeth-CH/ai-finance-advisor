# from sqlalchemy import Column
# from sqlalchemy import Integer
# from sqlalchemy import String

# from sqlalchemy.orm import relationship

# from app.core.database import Base


# class User(Base):

#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)

#     full_name = Column(String)

#     email = Column(String, unique=True, index=True)

#     hashed_password = Column(String)

#     transactions = relationship(
#         "Transaction",
#         back_populates="owner"
#     )

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Added cascade="all, delete-orphan" for production-level cleanup
    transactions = relationship(
        "Transaction",
        back_populates="owner",
        cascade="all, delete-orphan"
    )
