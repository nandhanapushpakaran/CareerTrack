from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, model_validator
from app.core.security import validate_password_strength


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str

    @model_validator(mode="after")
    def validate_new_password(self):
        if self.new_password != self.confirm_new_password:
            raise ValueError("New passwords do not match.")
        is_valid, error_msg = validate_password_strength(self.new_password)
        if not is_valid:
            raise ValueError(error_msg)
        return self
