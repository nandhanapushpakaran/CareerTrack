from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_token,
    get_password_hash,
    verify_password
)
from app.db.models import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse
)
from app.services.email import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create user
    hashed_password = get_password_hash(request.password)
    user = User(
        full_name=request.full_name.strip(),
        email=request.email.lower().strip(),
        password_hash=hashed_password,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user={
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
    )


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email.lower().strip()).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated."
        )

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user={
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
    )


@router.post("/refresh")
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload."
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive."
        )

    new_access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout")
def logout():
    return {"message": "Successfully logged out."}


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = request.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()

    dev_url = None
    # To prevent email enumeration attacks, always return the same generic message.
    # Only generate and send reset email if user exists and is active.
    if user and user.is_active:
        reset_token = create_reset_token(subject=user.id)
        send_password_reset_email(
            to_email=user.email,
            reset_token=reset_token,
            user_name=user.full_name
        )
        if settings.ENVIRONMENT == "development" and not settings.SMTP_HOST:
            dev_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={reset_token}"
    elif settings.ENVIRONMENT == "development":
        print(f"\n[DEV NOTICE] Password reset requested for '{email}', but no registered user with that email was found in the database. Please register first at /register.\n")

    res = {
        "message": "If an account with that email exists, password reset instructions have been sent to it."
    }
    if dev_url:
        res["dev_reset_url"] = dev_url
        res["dev_note"] = "No SMTP mail server configured in .env. During local testing, you can use this link to test password reset."

    return res


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(request.token)
    if payload is None or payload.get("type") != "reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token payload."
        )
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or inactive."
        )
    user.password_hash = get_password_hash(request.new_password)
    db.add(user)
    db.commit()
    return {"message": "Password has been successfully reset. You can now log in."}


