from datetime import datetime, timedelta, timezone
from app.db.models import Application, ApplicationStatus, EmploymentType


def test_dashboard_stats_accuracy(client, auth_headers, test_user, other_user, db_session):
    now = datetime.now(timezone.utc)
    # Add applications for test_user
    apps = [
        Application(user_id=test_user.id, company_name="Co 1", position="Dev", status=ApplicationStatus.APPLIED, employment_type=EmploymentType.FULL_TIME, application_date=now),
        Application(user_id=test_user.id, company_name="Co 2", position="Dev", status=ApplicationStatus.INTERVIEW, employment_type=EmploymentType.FULL_TIME, application_date=now, interview_date=now + timedelta(days=2)),
        Application(user_id=test_user.id, company_name="Co 3", position="Dev", status=ApplicationStatus.OFFER, employment_type=EmploymentType.FULL_TIME, application_date=now),
        Application(user_id=test_user.id, company_name="Co 4", position="Dev", status=ApplicationStatus.REJECTED, employment_type=EmploymentType.FULL_TIME, application_date=now),
    ]
    # Add application for other_user (should NOT appear in test_user's stats)
    other_app = Application(
        user_id=other_user.id, company_name="Other Co", position="Dev", status=ApplicationStatus.OFFER, employment_type=EmploymentType.FULL_TIME, application_date=now
    )
    db_session.add_all(apps + [other_app])
    db_session.commit()

    response = client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["total_applications"] == 4
    assert data["applied"] == 1
    assert data["interviews"] == 1
    assert data["offers"] == 1
    assert data["rejected"] == 1
    assert data["withdrawn"] == 0
    assert data["offer_rate"] == 25.0
    assert data["response_rate"] == 75.0
    assert len(data["upcoming_interviews"]) == 1
    assert data["upcoming_interviews"][0]["company_name"] == "Co 2"
