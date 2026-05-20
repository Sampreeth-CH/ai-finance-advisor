# from sqlalchemy import Column
# from sqlalchemy import Integer
# from sqlalchemy import String
# from sqlalchemy import Float
# from sqlalchemy import ForeignKey

# from sqlalchemy.orm import relationship

# from app.core.database import Base


# class Transaction(Base):

#     __tablename__ = "transactions"

#     id = Column(Integer, primary_key=True, index=True)

#     description = Column(String)

#     amount = Column(Float)

#     category = Column(String)

#     user_id = Column(
#         Integer,
#         ForeignKey("users.id")
#     )

#     owner = relationship(
#         "User",
#         back_populates="transactions"
#     )


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

    # Note: Since you named this 'owner', your User model must use back_populates="owner"
    owner = relationship(
        "User",
        back_populates="transactions"
    )