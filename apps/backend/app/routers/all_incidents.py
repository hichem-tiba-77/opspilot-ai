from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user
from app.models.incident import Incident
from app.models.project import Project
from app.models.user import User
from app.schemas.incident import IncidentResponse

router = APIRouter(prefix="/incidents", tags=["incidents-global"])


@router.get("", response_model=list[IncidentResponse])
def list_all_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all incidents across all projects owned by the current user."""
    user_project_ids = select(Project.id).where(Project.owner_id == current_user.id)

    return (
        db.query(Incident)
        .filter(Incident.project_id.in_(user_project_ids))
        .order_by(Incident.created_at.desc())
        .all()
    )


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident_by_id(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single incident by ID, verifying ownership via project."""
    user_project_ids = select(Project.id).where(Project.owner_id == current_user.id)

    incident = (
        db.query(Incident)
        .filter(
            Incident.id == incident_id,
            Incident.project_id.in_(user_project_ids),
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return incident
