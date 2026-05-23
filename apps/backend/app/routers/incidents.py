from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user, get_project_or_404
from app.models.incident import Incident
from app.models.user import User
from app.schemas.incident import CreateIncidentRequest, IncidentResponse, ResolveIncidentRequest

router = APIRouter(prefix="/projects/{project_id}/incidents", tags=["incidents"])


@router.post("", response_model=IncidentResponse, status_code=201)
def create_incident(
    project_id: int,
    body: CreateIncidentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user.id, db)

    incident = Incident(
        title=body.title,
        description=body.description,
        severity=body.severity.value,
        project_id=project_id,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("", response_model=list[IncidentResponse])
def list_incidents(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user.id, db)

    return (
        db.query(Incident)
        .filter(Incident.project_id == project_id)
        .order_by(Incident.created_at.desc())
        .all()
    )


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    project_id: int,
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user.id, db)

    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id, Incident.project_id == project_id)
        .first()
    )
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return incident


@router.patch("/{incident_id}/resolve", response_model=IncidentResponse)
def resolve_incident(
    project_id: int,
    incident_id: int,
    body: ResolveIncidentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user.id, db)

    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id, Incident.project_id == project_id)
        .first()
    )
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    incident.status = "resolved"
    incident.resolved_at = body.resolved_at or datetime.now(timezone.utc)
    db.commit()
    db.refresh(incident)
    return incident