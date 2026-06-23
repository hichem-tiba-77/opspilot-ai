from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import and_, case, func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user, get_project_or_404
from app.models.incident import Incident
from app.models.log import Log
from app.models.project import Project
from app.models.user import User
from app.schemas.project import (
    CreateProjectRequest,
    ProjectDetailResponse,
    ProjectResponse,
    ProjectSummaryResponse,
    UpdateProjectRequest,
)

router = APIRouter(prefix="/projects", tags=["projects"])


def normalize_status(status: str) -> str:
    normalized = status.lower()
    return normalized if normalized in {"healthy", "warning", "critical"} else "healthy"


def derive_project_status(
    base_status: str,
    open_incidents: int,
    major_open_incidents: int,
) -> str:
    if major_open_incidents > 0:
        return "critical"

    if open_incidents > 0:
        return "warning"

    return normalize_status(base_status)


def project_response(
    project: Project,
    logs_count: int = 0,
    incidents_count: int = 0,
    open_incidents: int = 0,
    major_open_incidents: int = 0,
    last_log_at: datetime | None = None,
) -> ProjectDetailResponse:
    return ProjectDetailResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        environment=project.environment,
        status=derive_project_status(
            project.status,
            open_incidents=open_incidents,
            major_open_incidents=major_open_incidents,
        ),
        created_at=project.created_at,
        owner_id=project.owner_id,
        logs_count=logs_count,
        incidents_count=incidents_count,
        open_incidents=open_incidents,
        last_log_at=last_log_at,
    )


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(
    body: CreateProjectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        name=body.name,
        description=body.description,
        environment=body.environment,
        status="healthy",
        owner_id=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=list[ProjectSummaryResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log_summary = (
        db.query(
            Log.project_id.label("project_id"),
            func.count(Log.id).label("logs_count"),
            func.max(Log.timestamp).label("last_log_at"),
        )
        .group_by(Log.project_id)
        .subquery()
    )

    incident_summary = (
        db.query(
            Incident.project_id.label("project_id"),
            func.count(Incident.id).label("incidents_count"),
            func.sum(case((Incident.status != "resolved", 1), else_=0)).label(
                "open_incidents"
            ),
            func.sum(
                case(
                    (
                        and_(
                            Incident.status != "resolved",
                            Incident.severity.in_(("critical", "high")),
                        ),
                        1,
                    ),
                    else_=0,
                )
            ).label("major_open_incidents"),
        )
        .group_by(Incident.project_id)
        .subquery()
    )

    rows = (
        db.query(
            Project,
            func.coalesce(log_summary.c.logs_count, 0),
            log_summary.c.last_log_at,
            func.coalesce(incident_summary.c.incidents_count, 0),
            func.coalesce(incident_summary.c.open_incidents, 0),
            func.coalesce(incident_summary.c.major_open_incidents, 0),
        )
        .outerjoin(log_summary, Project.id == log_summary.c.project_id)
        .outerjoin(incident_summary, Project.id == incident_summary.c.project_id)
        .filter(Project.owner_id == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )

    return [
        project_response(
            project=project,
            logs_count=int(logs_count or 0),
            incidents_count=int(incidents_count or 0),
            open_incidents=int(open_incidents or 0),
            major_open_incidents=int(major_open_incidents or 0),
            last_log_at=last_log_at,
        )
        for (
            project,
            logs_count,
            last_log_at,
            incidents_count,
            open_incidents,
            major_open_incidents,
        ) in rows
    ]


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_project_or_404(project_id, current_user.id, db)

    logs_count = (
        db.query(func.count(Log.id)).filter(Log.project_id == project_id).scalar() or 0
    )
    last_log_at = (
        db.query(func.max(Log.timestamp)).filter(Log.project_id == project_id).scalar()
    )
    incidents_count = (
        db.query(func.count(Incident.id))
        .filter(Incident.project_id == project_id)
        .scalar()
        or 0
    )
    open_incidents = (
        db.query(func.count(Incident.id))
        .filter(Incident.project_id == project_id, Incident.status != "resolved")
        .scalar()
        or 0
    )
    major_open_incidents = (
        db.query(func.count(Incident.id))
        .filter(
            Incident.project_id == project_id,
            Incident.status != "resolved",
            Incident.severity.in_(("critical", "high")),
        )
        .scalar()
        or 0
    )

    return project_response(
        project=project,
        logs_count=logs_count,
        incidents_count=incidents_count,
        open_incidents=open_incidents,
        major_open_incidents=major_open_incidents,
        last_log_at=last_log_at,
    )


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    body: UpdateProjectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_project_or_404(project_id, current_user.id, db)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_project_or_404(project_id, current_user.id, db)
    db.delete(project)
    db.commit()
