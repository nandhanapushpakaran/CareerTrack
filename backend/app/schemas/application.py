from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator, model_validator
from app.db.models import ApplicationStatus, EmploymentType


class ContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactRead(ContactBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    created_at: datetime


class ApplicationBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    position: str = Field(..., min_length=1, max_length=255)
    job_url: Optional[str] = None
    location: Optional[str] = None
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    salary_min: Optional[float] = Field(None, ge=0)
    salary_max: Optional[float] = Field(None, ge=0)
    currency: str = Field("USD", min_length=1, max_length=10)
    status: ApplicationStatus = ApplicationStatus.APPLIED
    application_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    notes: Optional[str] = None

    @field_validator("job_url")
    @classmethod
    def validate_url(cls, v: Optional[str]):
        if v is not None and v.strip() != "":
            v = v.strip()
            if not (v.startswith("http://") or v.startswith("https://")):
                raise ValueError("Job URL must start with http:// or https://")
            return v
        return None

    @model_validator(mode="after")
    def validate_salary_range(self):
        if self.salary_min is not None and self.salary_max is not None:
            if self.salary_min > self.salary_max:
                raise ValueError("Salary minimum cannot exceed salary maximum.")
        return self


class ApplicationCreate(ApplicationBase):
    contacts: Optional[List[ContactCreate]] = None


class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=255)
    position: Optional[str] = Field(None, min_length=1, max_length=255)
    job_url: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[EmploymentType] = None
    salary_min: Optional[float] = Field(None, ge=0)
    salary_max: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field(None, min_length=1, max_length=10)
    status: Optional[ApplicationStatus] = None
    application_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    notes: Optional[str] = None
    contacts: Optional[List[ContactCreate]] = None

    @field_validator("job_url")
    @classmethod
    def validate_url(cls, v: Optional[str]):
        if v is not None and v.strip() != "":
            v = v.strip()
            if not (v.startswith("http://") or v.startswith("https://")):
                raise ValueError("Job URL must start with http:// or https://")
            return v
        return None

    @model_validator(mode="after")
    def validate_salary_range(self):
        if self.salary_min is not None and self.salary_max is not None:
            if self.salary_min > self.salary_max:
                raise ValueError("Salary minimum cannot exceed salary maximum.")
        return self


class ApplicationRead(ApplicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    contacts: List[ContactRead] = []


class ApplicationPaginationResponse(BaseModel):
    items: List[ApplicationRead]
    total: int
    page: int
    page_size: int
    total_pages: int
