from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.application import ApplicationRead


class StatusMetric(BaseModel):
    status: str
    count: int
    percentage: float
    color: str


class TimelinePoint(BaseModel):
    period: str
    count: int


class UpcomingInterview(BaseModel):
    id: int
    company_name: str
    position: str
    interview_date: datetime
    location: Optional[str] = None


class DashboardStats(BaseModel):
    total_applications: int
    applied: int
    interviews: int
    offers: int
    rejected: int
    withdrawn: int
    response_rate: float
    offer_rate: float
    status_distribution: List[StatusMetric]
    application_trend: List[TimelinePoint]
    upcoming_interviews: List[UpcomingInterview]
    recent_applications: List[ApplicationRead]
