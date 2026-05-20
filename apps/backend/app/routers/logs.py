from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user
from app.models.log import Log
from app.models.project import Project
from app.models.user import User
from app.schemas.log import LogResponse, UploadLogsRequest

router = APIRouter(prefix="/projects/{project_id}/logs", tags=["logs"])


def get_project_or_404(project_id: int, user_id: int, db: Session) -> Project:
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.owner_id == user_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post("", response_model=list[LogResponse], status_code=201)
def upload_logs(
    project_id: int,
    body: UploadLogsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user.id, db)

    logs = [
        Log(
            level=line.level.upper(),
            message=line.message,
            source=line.source,
            timestamp=line.timestamp or datetime.now(timezone.utc),
            project_id=project_id,
        )
        for line in body.logs
    ]

    db.add_all(logs)
    db.commit()
    for log in logs:
        db.refresh(log)

    return logs


@router.get("", response_model=list[LogResponse])
def get_logs(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user.id, db)

    return (
        db.query(Log)
        .filter(Log.project_id == project_id)
        .order_by(Log.timestamp.desc())
        .all()
    )