from collections import defaultdict
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import desc, func
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.db.models import Application, ApplicationStatus, User
from app.schemas.dashboard import DashboardStats, StatusMetric, TimelinePoint, UpcomingInterview

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

STATUS_COLORS = {
    ApplicationStatus.APPLIED.value: "#3B82F6",     # Blue
    ApplicationStatus.INTERVIEW.value: "#8B5CF6",   # Purple
    ApplicationStatus.OFFER.value: "#10B981",       # Green
    ApplicationStatus.REJECTED.value: "#EF4444",    # Red
    ApplicationStatus.WITHDRAWN.value: "#6B7280",   # Gray
}


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(Application).filter(Application.user_id == current_user.id).all()
    total = len(apps)

    counts = {
        ApplicationStatus.APPLIED.value: 0,
        ApplicationStatus.INTERVIEW.value: 0,
        ApplicationStatus.OFFER.value: 0,
        ApplicationStatus.REJECTED.value: 0,
        ApplicationStatus.WITHDRAWN.value: 0
    }

    for app in apps:
        status_val = app.status.value if hasattr(app.status, "value") else str(app.status)
        if status_val in counts:
            counts[status_val] += 1

    applied_count = counts[ApplicationStatus.APPLIED.value]
    interview_count = counts[ApplicationStatus.INTERVIEW.value]
    offer_count = counts[ApplicationStatus.OFFER.value]
    rejected_count = counts[ApplicationStatus.REJECTED.value]
    withdrawn_count = counts[ApplicationStatus.WITHDRAWN.value]

    # Rates calculations
    # Response rate = (Interviews + Offers + Rejections) / Total * 100
    active_responses = interview_count + offer_count + rejected_count
    response_rate = round((active_responses / total) * 100, 1) if total > 0 else 0.0
    offer_rate = round((offer_count / total) * 100, 1) if total > 0 else 0.0

    status_distribution = [
        StatusMetric(
            status=status_name,
            count=count,
            percentage=round((count / total) * 100, 1) if total > 0 else 0.0,
            color=STATUS_COLORS.get(status_name, "#3B82F6")
        )
        for status_name, count in counts.items()
    ]

    # Timeline calculation: past 6 months
    now = datetime.now(timezone.utc)
    months_data = {}
    for i in range(5, -1, -1):
        # Approximate month intervals
        month_date = now - timedelta(days=i * 30)
        month_key = month_date.strftime("%b %Y")
        months_data[month_key] = 0

    for app in apps:
        app_date = app.application_date
        if app_date:
            month_key = app_date.strftime("%b %Y")
            if month_key in months_data:
                months_data[month_key] += 1

    application_trend = [
        TimelinePoint(period=k, count=v) for k, v in months_data.items()
    ]

    def ensure_utc(dt):
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    # Upcoming interviews
    upcoming_interviews = []
    interview_apps = [
        a for a in apps
        if a.interview_date and ensure_utc(a.interview_date) >= (now - timedelta(days=1))
    ]
    interview_apps.sort(key=lambda x: ensure_utc(x.interview_date))
    for app in interview_apps[:5]:
        upcoming_interviews.append(
            UpcomingInterview(
                id=app.id,
                company_name=app.company_name,
                position=app.position,
                interview_date=app.interview_date,
                location=app.location
            )
        )

    # Recent applications (top 5)
    recent_apps = sorted(
        apps,
        key=lambda x: ensure_utc(x.application_date) or ensure_utc(x.created_at) or now,
        reverse=True
    )[:5]

    return DashboardStats(
        total_applications=total,
        applied=applied_count,
        interviews=interview_count,
        offers=offer_count,
        rejected=rejected_count,
        withdrawn=withdrawn_count,
        response_rate=response_rate,
        offer_rate=offer_rate,
        status_distribution=status_distribution,
        application_trend=application_trend,
        upcoming_interviews=upcoming_interviews,
        recent_applications=recent_apps
    )
