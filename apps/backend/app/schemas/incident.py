from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class SeverityEnum(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class CreateIncidentRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(default="", max_length=4000)
    severity: SeverityEnum

    @field_validator("title", "description")
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("title")
    @classmethod
    def require_title(cls, value: str) -> str:
        if not value:
            raise ValueError("Incident title is required")
        return value


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
