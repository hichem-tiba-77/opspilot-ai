from datetime import datetime

from pydantic import BaseModel, Field, field_validator


VALID_LOG_LEVELS = {"DEBUG", "INFO", "WARN", "WARNING", "ERROR"}


class LogLineInput(BaseModel):
    level: str = Field(min_length=3, max_length=20)
    message: str = Field(min_length=1, max_length=10000)
    source: str = Field(default="unknown", min_length=1, max_length=100)
    timestamp: datetime | None = None

    @field_validator("level")
    @classmethod
    def normalize_level(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized not in VALID_LOG_LEVELS:
            allowed = ", ".join(sorted(VALID_LOG_LEVELS - {"WARNING"}))
            raise ValueError(f"Log level must be one of: {allowed}")

        return "WARN" if normalized == "WARNING" else normalized

    @field_validator("message", "source")
    @classmethod
    def trim_text(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Value cannot be empty")
        return trimmed


class UploadLogsRequest(BaseModel):
    logs: list[LogLineInput] = Field(min_length=1, max_length=5000)


class LogResponse(BaseModel):
    id: int
    level: str
    message: str
    source: str
    timestamp: datetime
    project_id: int

    model_config = {"from_attributes": True}
