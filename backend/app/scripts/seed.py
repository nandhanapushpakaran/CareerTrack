import sys
from datetime import datetime, timedelta, timezone
from app.core.security import get_password_hash
from app.db.models import Application, ApplicationStatus, Contact, EmploymentType, User
from app.db.session import SessionLocal, engine, Base


def seed_demo_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check or create demo user
        demo_email = "demo@careertrack.io"
        demo_user = db.query(User).filter(User.email == demo_email).first()

        if not demo_user:
            demo_user = User(
                full_name="Alex Morgan",
                email=demo_email,
                password_hash=get_password_hash("DemoPass123!"),
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"Created demo user: {demo_email} (Password: DemoPass123!)")
        else:
            print(f"Found existing demo user: {demo_email}")

        # Clear existing applications for demo user to ensure clean seed
        db.query(Application).filter(Application.user_id == demo_user.id).delete()
        db.commit()

        now = datetime.now(timezone.utc)

        sample_apps = [
            {
                "company_name": "Google",
                "position": "Senior Full-Stack Engineer",
                "job_url": "https://careers.google.com/jobs/results/12345",
                "location": "Mountain View, CA (Hybrid)",
                "employment_type": EmploymentType.FULL_TIME,
                "salary_min": 180000,
                "salary_max": 230000,
                "currency": "USD",
                "status": ApplicationStatus.INTERVIEW,
                "application_date": now - timedelta(days=14),
                "interview_date": now + timedelta(days=2, hours=3),
                "notes": "Passed initial recruiter screen and technical phone screen. Upcoming virtual on-site interview consisting of system design and coding.",
                "contacts": [
                    {"name": "Sarah Jenkins", "email": "sjenkins@google.com", "role": "Technical Recruiter", "phone": "+1 650-555-0199"}
                ]
            },
            {
                "company_name": "Stripe",
                "position": "Staff Software Engineer - Payments Platform",
                "job_url": "https://stripe.com/jobs/staff-eng-payments",
                "location": "Remote (US)",
                "employment_type": EmploymentType.FULL_TIME,
                "salary_min": 210000,
                "salary_max": 270000,
                "currency": "USD",
                "status": ApplicationStatus.OFFER,
                "application_date": now - timedelta(days=35),
                "interview_date": now - timedelta(days=5),
                "notes": "Received written offer letter! Total compensation package includes equity bonus. Reviewing contract details by next Friday.",
                "contacts": [
                    {"name": "Marcus Vance", "email": "mvance@stripe.com", "role": "Engineering Manager", "phone": "+1 415-555-0142"}
                ]
            },
            {
                "company_name": "Microsoft",
                "position": "Software Engineer II - Azure Cloud",
                "job_url": "https://careers.microsoft.com/us/en/job/78910",
                "location": "Redmond, WA (Hybrid)",
                "employment_type": EmploymentType.FULL_TIME,
                "salary_min": 150000,
                "salary_max": 195000,
                "currency": "USD",
                "status": ApplicationStatus.INTERVIEW,
                "application_date": now - timedelta(days=10),
                "interview_date": now + timedelta(days=5, hours=1),
                "notes": "Hiring manager round scheduled for Thursday 2 PM. Review distributed caching patterns and Azure Cosmos DB.",
                "contacts": [
                    {"name": "David Chen", "email": "dchen@microsoft.com", "role": "Talent Acquisition", "phone": "+1 425-555-0188"}
                ]
            },
            {
                "company_name": "Airbnb",
                "position": "Frontend Engineer - Design Systems",
                "job_url": "https://careers.airbnb.com/positions/design-systems",
                "location": "San Francisco, CA",
                "employment_type": EmploymentType.FULL_TIME,
                "salary_min": 165000,
                "salary_max": 205000,
                "currency": "USD",
                "status": ApplicationStatus.APPLIED,
                "application_date": now - timedelta(days=4),
                "interview_date": None,
                "notes": "Applied through employee referral from university alumni. Resume submitted emphasizing React 19, TypeScript, and Tailwind CSS.",
                "contacts": []
            },
            {
                "company_name": "Amazon Web Services",
                "position": "Solutions Architect",
                "job_url": "https://amazon.jobs/en/jobs/aws-sa",
                "location": "Seattle, WA (On-site)",
                "employment_type": EmploymentType.FULL_TIME,
                "salary_min": 160000,
                "salary_max": 210000,
                "currency": "USD",
                "status": ApplicationStatus.REJECTED,
                "application_date": now - timedelta(days=45),
                "interview_date": now - timedelta(days=20),
                "notes": "Position placed on freeze after round 2. Recruiter mentioned keeping profile active for future team expansion in Q4.",
                "contacts": []
            },
            {
                "company_name": "Spotify",
                "position": "Backend Engineer - Core Infrastructure",
                "job_url": "https://spotifyjobs.com/job/core-infra-be",
                "location": "New York, NY (Hybrid)",
                "employment_type": EmploymentType.FULL_TIME,
                "salary_min": 175000,
                "salary_max": 220000,
                "currency": "USD",
                "status": ApplicationStatus.INTERVIEW,
                "application_date": now - timedelta(days=18),
                "interview_date": now + timedelta(days=8),
                "notes": "System design assessment completed. Final portfolio and culture fit session coming up next week.",
                "contacts": [
                    {"name": "Elena Rostova", "email": "erostova@spotify.com", "role": "Senior Recruiter", "phone": "+1 212-555-0177"}
                ]
            },
            {
                "company_name": "Figma",
                "position": "Software Engineer - Web Platform",
                "job_url": "https://figma.com/careers/web-platform",
                "location": "San Francisco, CA (Remote)",
                "employment_type": EmploymentType.FULL_TIME,
                "salary_min": 170000,
                "salary_max": 215000,
                "currency": "USD",
                "status": ApplicationStatus.APPLIED,
                "application_date": now - timedelta(days=2),
                "interview_date": None,
                "notes": "Application acknowledged by automated system. Highly interested in their WebAssembly and canvas rendering engine.",
                "contacts": []
            },
            {
                "company_name": "Datadog",
                "position": "Full-Stack Software Engineer",
                "job_url": "https://datadoghq.com/careers/fs-eng",
                "location": "Boston, MA (Hybrid)",
                "employment_type": EmploymentType.FULL_TIME,
                "salary_min": 155000,
                "salary_max": 190000,
                "currency": "USD",
                "status": ApplicationStatus.WITHDRAWN,
                "application_date": now - timedelta(days=28),
                "interview_date": None,
                "notes": "Withdrawn voluntarily due to overlapping offers and required 4-days in-office mandate.",
                "contacts": []
            },
            {
                "company_name": "Vercel",
                "position": "Developer Experience Engineer",
                "job_url": "https://vercel.com/careers/dx-engineer",
                "location": "Remote (Worldwide)",
                "employment_type": EmploymentType.FULL_TIME,
                "salary_min": 160000,
                "salary_max": 200000,
                "currency": "USD",
                "status": ApplicationStatus.APPLIED,
                "application_date": now - timedelta(days=7),
                "interview_date": None,
                "notes": "Shared open source repositories and blog post demonstrations in application submission.",
                "contacts": []
            },
            {
                "company_name": "Cloudflare",
                "position": "Systems Engineer - Edge Compute",
                "job_url": "https://cloudflare.com/careers/edge-systems",
                "location": "Austin, TX (Hybrid)",
                "employment_type": EmploymentType.FULL_TIME,
                "salary_min": 165000,
                "salary_max": 210000,
                "currency": "USD",
                "status": ApplicationStatus.OFFER,
                "application_date": now - timedelta(days=30),
                "interview_date": now - timedelta(days=12),
                "notes": "Received second offer! Comprehensive health benefits and 401k match. In discussions regarding start date.",
                "contacts": [
                    {"name": "Liam Vance", "email": "lvance@cloudflare.com", "role": "Lead Recruiter", "phone": "+1 512-555-0133"}
                ]
            }
        ]

        for item in sample_apps:
            contacts_data = item.pop("contacts", [])
            app_obj = Application(**item, user_id=demo_user.id)
            db.add(app_obj)
            db.flush()

            for c in contacts_data:
                contact_obj = Contact(**c, application_id=app_obj.id)
                db.add(contact_obj)

        db.commit()
        print(f"Successfully seeded {len(sample_apps)} applications for {demo_email}!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
