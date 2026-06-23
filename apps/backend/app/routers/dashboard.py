from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user
from app.models.incident import Incident
from app.models.log import Log
from app.models.project import Project
from app.models.user import User
from app.schemas.incident import IncidentResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class DashboardStatsResponse(BaseModel):
    projects_count: int
    total_logs: int
    open_incidents: int
    resolved_incidents: int


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_project_ids = select(Project.id).where(Project.owner_id == current_user.id)

    projects_count = (
        db.query(func.count(Project.id))
        .filter(Project.owner_id == current_user.id)
        .scalar()
        or 0
    )

    total_logs = (
        db.query(func.count(Log.id))
        .filter(Log.project_id.in_(user_project_ids))
        .scalar()
        or 0
    )

    open_incidents = (
        db.query(func.count(Incident.id))
        .filter(
            Incident.project_id.in_(user_project_ids),
            Incident.status != "resolved",
        )
        .scalar()
        or 0
    )

    resolved_incidents = (
        db.query(func.count(Incident.id))
        .filter(
            Incident.project_id.in_(user_project_ids),
            Incident.status == "resolved",
        )
        .scalar()
        or 0
    )

    return DashboardStatsResponse(
        projects_count=projects_count,
        total_logs=total_logs,
        open_incidents=open_incidents,
        resolved_incidents=resolved_incidents,
    )


@router.get("/recent-incidents", response_model=list[IncidentResponse])
def get_recent_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_project_ids = select(Project.id).where(Project.owner_id == current_user.id)

    return (
        db.query(Incident)
        .filter(Incident.project_id.in_(user_project_ids))
        .order_by(Incident.created_at.desc())
        .limit(5)
        .all()
    )
