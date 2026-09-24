import pytest
from app.db.models import Application, ApplicationStatus, EmploymentType


def test_create_application(client, auth_headers):
    payload = {
        "company_name": "Acme Corp",
        "position": "Backend Developer",
        "job_url": "https://acme.com/jobs/1",
        "location": "New York, NY",
        "employment_type": "Full-time",
        "salary_min": 120000,
        "salary_max": 150000,
        "currency": "USD",
        "status": "Applied",
        "notes": "Spoke to hiring manager at meet-up.",
        "contacts": [
            {"name": "Alice Smith", "email": "alice@acme.com", "role": "Recruiter"}
        ]
    }
    response = client.post("/api/v1/applications", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["company_name"] == "Acme Corp"
    assert data["position"] == "Backend Developer"
    assert len(data["contacts"]) == 1
    assert data["contacts"][0]["name"] == "Alice Smith"


def test_create_application_invalid_salary(client, auth_headers):
    payload = {
        "company_name": "Tech Corp",
        "position": "Developer",
        "salary_min": 150000,
        "salary_max": 100000,  # min > max should fail validation
    }
    response = client.post("/api/v1/applications", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_list_applications_pagination(client, auth_headers, test_user, db_session):
    # Add 5 applications
    for i in range(5):
        app = Application(
            user_id=test_user.id,
            company_name=f"Company {i}",
            position=f"Position {i}",
            status=ApplicationStatus.APPLIED,
            employment_type=EmploymentType.FULL_TIME
        )
        db_session.add(app)
    db_session.commit()

    response = client.get("/api/v1/applications?page=1&page_size=3", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5
    assert len(data["items"]) == 3
    assert data["total_pages"] == 2


def test_search_and_filter_applications(client, auth_headers, test_user, db_session):
    app1 = Application(
        user_id=test_user.id,
        company_name="Stripe",
        position="Backend Engineer",
        location="Remote",
        status=ApplicationStatus.INTERVIEW,
        employment_type=EmploymentType.FULL_TIME
    )
    app2 = Application(
        user_id=test_user.id,
        company_name="Google",
        position="Frontend Architect",
        location="Mountain View",
        status=ApplicationStatus.APPLIED,
        employment_type=EmploymentType.FULL_TIME
    )
    db_session.add_all([app1, app2])
    db_session.commit()

    # Search for "Stripe"
    res1 = client.get("/api/v1/applications?search=stripe", headers=auth_headers)
    assert res1.status_code == 200
    assert res1.json()["total"] == 1
    assert res1.json()["items"][0]["company_name"] == "Stripe"

    # Filter by status "Interview"
    res2 = client.get("/api/v1/applications?status=Interview", headers=auth_headers)
    assert res2.status_code == 200
    assert res2.json()["total"] == 1
    assert res2.json()["items"][0]["company_name"] == "Stripe"


def test_idor_protection_read(client, auth_headers, other_auth_headers, test_user, other_user, db_session):
    # Create application belonging to test_user
    app = Application(
        user_id=test_user.id,
        company_name="Secret Company",
        position="Private Position",
        status=ApplicationStatus.APPLIED,
        employment_type=EmploymentType.FULL_TIME
    )
    db_session.add(app)
    db_session.commit()
    db_session.refresh(app)

    # other_user attempts to read test_user's application
    response = client.get(f"/api/v1/applications/{app.id}", headers=other_auth_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Application not found."

    # test_user can read own application
    own_response = client.get(f"/api/v1/applications/{app.id}", headers=auth_headers)
    assert own_response.status_code == 200
    assert own_response.json()["company_name"] == "Secret Company"


def test_idor_protection_update(client, other_auth_headers, test_user, db_session):
    app = Application(
        user_id=test_user.id,
        company_name="Original Company",
        position="Role",
        status=ApplicationStatus.APPLIED,
        employment_type=EmploymentType.FULL_TIME
    )
    db_session.add(app)
    db_session.commit()
    db_session.refresh(app)

    # other_user attempts to modify test_user's application
    response = client.put(
        f"/api/v1/applications/{app.id}",
        json={"company_name": "Hacked Company"},
        headers=other_auth_headers
    )
    assert response.status_code == 404

    # Verify no modification happened
    db_session.refresh(app)
    assert app.company_name == "Original Company"


def test_idor_protection_delete(client, other_auth_headers, test_user, db_session):
    app = Application(
        user_id=test_user.id,
        company_name="Delete Target",
        position="Role",
        status=ApplicationStatus.APPLIED,
        employment_type=EmploymentType.FULL_TIME
    )
    db_session.add(app)
    db_session.commit()
    db_session.refresh(app)

    # other_user attempts to delete test_user's application
    response = client.delete(f"/api/v1/applications/{app.id}", headers=other_auth_headers)
    assert response.status_code == 404

    # Verify still in database
    db_session.refresh(app)
    assert app.id is not None
