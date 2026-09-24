import pytest
from app.core.security import create_refresh_token, decode_token


def test_register_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Jane Developer",
            "email": "jane@example.com",
            "password": "SecurePass123!",
            "confirm_password": "SecurePass123!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "jane@example.com"
    assert data["user"]["full_name"] == "Jane Developer"


def test_register_duplicate_email(client, test_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Duplicate User",
            "email": test_user.email,
            "password": "Password123!",
            "confirm_password": "Password123!"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_register_weak_password(client):
    # Missing special character
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Weak Pass User",
            "email": "weak@example.com",
            "password": "WeakPassword12",
            "confirm_password": "WeakPassword12"
        }
    )
    assert response.status_code == 422


def test_register_password_mismatch(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Mismatch User",
            "email": "mismatch@example.com",
            "password": "Password123!",
            "confirm_password": "DifferentPass123!"
        }
    )
    assert response.status_code == 422


def test_login_success(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "Password123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["id"] == test_user.id


def test_login_invalid_password(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "WrongPassword999!"
        }
    )
    assert response.status_code == 401


def test_login_nonexistent_email(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "ghost@example.com",
            "password": "Password123!"
        }
    )
    assert response.status_code == 401


def test_refresh_token(client, test_user):
    refresh_token = create_refresh_token(subject=test_user.id)
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_refresh_token_invalid(client):
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "invalid.jwt.token"}
    )
    assert response.status_code == 401


def test_me_endpoint_protected(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401


def test_me_endpoint_authorized(client, auth_headers, test_user):
    response = client.get("/api/v1/users/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["id"] == test_user.id


def test_forgot_password_success(client, test_user):
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": test_user.email}
    )
    assert response.status_code == 200
    data = response.json()
    assert "reset_token" in data


def test_forgot_password_not_found(client):
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "nonexistent@example.com"}
    )
    assert response.status_code == 404


def test_reset_password_token_flow(client, test_user):
    # 1. Request token
    req_res = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": test_user.email}
    )
    token = req_res.json()["reset_token"]

    # 2. Reset password
    reset_res = client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": token,
            "new_password": "NewSecurePass123!",
            "confirm_new_password": "NewSecurePass123!"
        }
    )
    assert reset_res.status_code == 200

    # 3. Verify login works with new password
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "NewSecurePass123!"}
    )
    assert login_res.status_code == 200


def test_reset_password_direct_flow(client, test_user):
    reset_res = client.post(
        "/api/v1/auth/reset-password-direct",
        json={
            "email": test_user.email,
            "new_password": "AnotherNewPass123!",
            "confirm_new_password": "AnotherNewPass123!"
        }
    )
    assert reset_res.status_code == 200

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "AnotherNewPass123!"}
    )
    assert login_res.status_code == 200

