from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user, get_project_or_404
from app.models.log import Log
from app.models.user import User
from app.schemas.log import LogResponse, UploadLogsRequest

router = APIRouter(prefix="/projects/{project_id}/logs", tags=["logs"])


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
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_or_404(project_id, current_user.id, db)

    return (
        db.query(Log)
        .filter(Log.project_id == project_id)
        .order_by(Log.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )