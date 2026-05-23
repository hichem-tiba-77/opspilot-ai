from datetime import datetime

from pydantic import BaseModel


class CreateProjectRequest(BaseModel):
    name: str
    description: str = ""
    environment: str


class UpdateProjectRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    environment: str | None = None
    status: str | None = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    environment: str
    status: str
    created_at: datetime
    owner_id: int

    model_config = {"from_attributes": True}


class ProjectDetailResponse(ProjectResponse):
    logs_count: int = 0
    incidents_count: int = 0