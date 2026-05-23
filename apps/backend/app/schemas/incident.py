from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class SeverityEnum(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class CreateIncidentRequest(BaseModel):
    title: str
    description: str = ""
    severity: SeverityEnum


class ResolveIncidentRequest(BaseModel):
    resolved_at: datetime | None = None


class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    status: str
    created_at: datetime
    resolved_at: datetime | None
    project_id: int

    model_config = {"from_attributes": True}