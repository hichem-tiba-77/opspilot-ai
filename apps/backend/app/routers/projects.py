from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
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
    UpdateProjectRequest,
)

router = APIRouter(prefix="/projects", tags=["projects"])


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
        owner_id=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Project).filter(Project.owner_id == current_user.id).all()


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
    incidents_count = (
        db.query(func.count(Incident.id))
        .filter(Incident.project_id == project_id)
        .scalar()
        or 0
    )

    return ProjectDetailResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        environment=project.environment,
        status=project.status,
        created_at=project.created_at,
        owner_id=project.owner_id,
        logs_count=logs_count,
        incidents_count=incidents_count,
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