from pydantic import BaseModel
from pydantic import EmailStr


class UserSignup(BaseModel):

    full_name: str

    email: EmailStr

    password: str


class UserLogin(BaseModel):

    email: EmailStr

    password: str