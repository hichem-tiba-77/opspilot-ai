from datetime import datetime

from pydantic import BaseModel, Field, field_validator


VALID_ENVIRONMENTS = {"development", "staging", "production"}
VALID_STATUSES = {"healthy", "warning", "critical"}


def strip_text(value: str) -> str:
    return value.strip()


class CreateProjectRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str = Field(default="", max_length=500)
    environment: str = Field(min_length=2, max_length=50)

    @field_validator("name", "description", "environment")
    @classmethod
    def trim_text(cls, value: str) -> str:
        return strip_text(value)

    @field_validator("name")
    @classmethod
    def require_name(cls, value: str) -> str:
        if not value:
            raise ValueError("Project name is required")
        return value

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, value: str) -> str:
        normalized = value.lower()
        if normalized not in VALID_ENVIRONMENTS:
            allowed = ", ".join(sorted(VALID_ENVIRONMENTS))
            raise ValueError(f"Environment must be one of: {allowed}")
        return normalized


class UpdateProjectRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    environment: str | None = Field(default=None, min_length=2, max_length=50)
    status: str | None = Field(default=None, min_length=2, max_length=50)

    @field_validator("name", "description", "environment", "status")
    @classmethod
    def trim_optional_text(cls, value: str | None) -> str | None:
        return strip_text(value) if value is not None else value

    @field_validator("name")
    @classmethod
    def require_optional_name(cls, value: str | None) -> str | None:
        if value is not None and not value:
            raise ValueError("Project name is required")
        return value

    @field_validator("environment")
    @classmethod
    def validate_optional_environment(cls, value: str | None) -> str | None:
        if value is None:
            return value

        normalized = value.lower()
        if normalized not in VALID_ENVIRONMENTS:
            allowed = ", ".join(sorted(VALID_ENVIRONMENTS))
            raise ValueError(f"Environment must be one of: {allowed}")
        return normalized

    @field_validator("status")
    @classmethod
    def validate_optional_status(cls, value: str | None) -> str | None:
        if value is None:
            return value

        normalized = value.lower()
        if normalized not in VALID_STATUSES:
            allowed = ", ".join(sorted(VALID_STATUSES))
            raise ValueError(f"Status must be one of: {allowed}")
        return normalized


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
    open_incidents: int = 0
    last_log_at: datetime | None = None


class ProjectSummaryResponse(ProjectDetailResponse):
    pass
