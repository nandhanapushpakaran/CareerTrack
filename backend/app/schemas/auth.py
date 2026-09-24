from pydantic import BaseModel, EmailStr, model_validator
from app.core.security import validate_password_strength


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    confirm_password: str

    @model_validator(mode="after")
    def validate_passwords(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        is_valid, error_msg = validate_password_strength(self.password)
        if not is_valid:
            raise ValueError(error_msg)
        if len(self.full_name.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters long.")
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_new_password: str

    @model_validator(mode="after")
    def validate_new_passwords(self):
        if self.new_password != self.confirm_new_password:
            raise ValueError("New passwords do not match.")
        is_valid, error_msg = validate_password_strength(self.new_password)
        if not is_valid:
            raise ValueError(error_msg)
        return self

