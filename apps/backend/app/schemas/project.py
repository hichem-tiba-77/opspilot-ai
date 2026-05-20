from datetime import datetime

from pydantic import BaseModel


class CreateProjectRequest(BaseModel):
    name: str
    description: str = ""
    environment: str


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    environment: str
    status: str
    created_at: datetime
    owner_id: int

    model_config = {"from_attributes": True}