import math
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc, or_
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.db.models import Application, ApplicationStatus, Contact, EmploymentType, User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationPaginationResponse,
    ApplicationRead,
    ApplicationUpdate,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("", response_model=ApplicationPaginationResponse)
def list_applications(
    search: Optional[str] = Query(None, description="Search in company, position, or location"),
    status: Optional[ApplicationStatus] = Query(None, description="Filter by application status"),
    employment_type: Optional[EmploymentType] = Query(None, description="Filter by employment type"),
    date_from: Optional[datetime] = Query(None, description="Filter applications from this date"),
    date_to: Optional[datetime] = Query(None, description="Filter applications up to this date"),
    sort_by: str = Query("newest", description="Sort order: newest, oldest, company_asc, company_desc, interview_date"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Application).filter(Application.user_id == current_user.id)

    # Search filter
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Application.company_name.ilike(term),
                Application.position.ilike(term),
                Application.location.ilike(term)
            )
        )

    # Status filter
    if status:
        query = query.filter(Application.status == status)

    # Employment type filter
    if employment_type:
        query = query.filter(Application.employment_type == employment_type)

    # Date range filters
    if date_from:
        query = query.filter(Application.application_date >= date_from)
    if date_to:
        query = query.filter(Application.application_date <= date_to)

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(asc(Application.application_date), asc(Application.id))
    elif sort_by == "company_asc":
        query = query.order_by(asc(Application.company_name))
    elif sort_by == "company_desc":
        query = query.order_by(desc(Application.company_name))
    elif sort_by == "interview_date":
        query = query.order_by(desc(Application.interview_date).nullslast(), desc(Application.id))
    else:  # default 'newest'
        query = query.order_by(desc(Application.application_date), desc(Application.id))

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    return ApplicationPaginationResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application(
    application_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_data = application_in.model_dump(exclude={"contacts"})
    application = Application(
        **app_data,
        user_id=current_user.id
    )
    db.add(application)
    db.flush()

    if application_in.contacts:
        for c in application_in.contacts:
            contact = Contact(**c.model_dump(), application_id=application.id)
            db.add(contact)

    db.commit()
    db.refresh(application)
    return application


@router.get("/{application_id}", response_model=ApplicationRead)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found."
        )

    return application


@router.put("/{application_id}", response_model=ApplicationRead)
def update_application(
    application_id: int,
    application_in: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found."
        )

    update_dict = application_in.model_dump(exclude_unset=True, exclude={"contacts"})
    for key, value in update_dict.items():
        setattr(application, key, value)

    # Optional contact updates
    if application_in.contacts is not None:
        db.query(Contact).filter(Contact.application_id == application.id).delete()
        for c in application_in.contacts:
            contact = Contact(**c.model_dump(), application_id=application.id)
            db.add(contact)

    db.commit()
    db.refresh(application)
    return application


@router.delete("/{application_id}", status_code=status.HTTP_200_OK)
def delete_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found."
        )

    db.delete(application)
    db.commit()
    return {"message": "Application deleted successfully."}
