from datetime import datetime

from pydantic import BaseModel


class LogLineInput(BaseModel):
    level: str
    message: str
    source: str = "unknown"
    timestamp: datetime | None = None


class UploadLogsRequest(BaseModel):
    logs: list[LogLineInput]


class LogResponse(BaseModel):
    id: int
    level: str
    message: str
    source: str
    timestamp: datetime
    project_id: int

    model_config = {"from_attributes": True}