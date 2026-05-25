import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.deps import get_current_user, get_project_or_404
from app.models.log import Log
from app.models.user import User

router = APIRouter(prefix="/projects/{project_id}/analysis", tags=["analysis"])


class AnalysisRequest(BaseModel):
    question: str


class AnalysisResponse(BaseModel):
    answer: str


def build_analysis_prompt(project_name: str, environment: str, logs: list[Log], question: str) -> str:
    logs_text = "\n".join(
        f"[{log.timestamp}] [{log.level}] [{log.source}] {log.message}"
        for log in logs
    )

    return f"""You are an expert DevOps engineer and site reliability engineer (SRE).
You are analyzing logs for a project called "{project_name}" running in {environment}.

Here are the most recent logs:

{logs_text}

The engineer is asking: {question}

Provide a clear, structured answer. If you see errors or patterns, explain what they mean
and suggest concrete next steps to investigate or fix the issue."""


def extract_gemini_text(data: dict) -> str | None:
    for candidate in data.get("candidates", []):
        content = candidate.get("content", {})
        text_parts = [
            part["text"]
            for part in content.get("parts", [])
            if isinstance(part, dict) and isinstance(part.get("text"), str)
        ]
        if text_parts:
            return "\n".join(text_parts).strip()

    return None


def read_gemini_error(error: HTTPError) -> str:
    raw_body = error.read().decode("utf-8", errors="replace")
    if not raw_body:
        return error.reason

    try:
        body = json.loads(raw_body)
    except json.JSONDecodeError:
        return raw_body

    api_error = body.get("error", {})
    if isinstance(api_error, dict) and isinstance(api_error.get("message"), str):
        return api_error["message"]

    return raw_body


def analyze_with_gemini(prompt: str) -> str:
    model = quote(settings.GEMINI_MODEL.removeprefix("models/"), safe="")
    query = urlencode({"key": settings.GEMINI_API_KEY})
    url = (
        "https://generativelanguage.googleapis.com/v1beta/"
        f"models/{model}:generateContent?{query}"
    )
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 1024,
        },
    }
    request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        detail = read_gemini_error(error)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Gemini API error: {detail}",
        ) from error
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Gemini service unavailable: {error}",
        ) from error

    answer = extract_gemini_text(data)
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini returned no text response",
        )

    return answer


def build_mock_analysis(project_name: str, environment: str, logs: list[Log], question: str) -> str:
    error_count = sum(1 for log in logs if log.level == "ERROR")
    warn_count = sum(1 for log in logs if log.level == "WARN")
    info_count = sum(1 for log in logs if log.level == "INFO")
    debug_count = sum(1 for log in logs if log.level == "DEBUG")

    sources = sorted({log.source for log in logs})
    error_messages = [log.message for log in logs if log.level == "ERROR"][:3]
    error_detail = (
        "\n".join(f"  - {msg}" for msg in error_messages)
        if error_messages
        else "  - None"
    )
    health = "Degraded" if error_count > 5 else "Healthy"
    recommendation = (
        "High error rate detected. Recommended actions:\n"
        "  1. Check your database connection\n"
        "  2. Review service dependencies\n"
        "  3. Check available disk space and memory"
        if error_count > 5
        else "No critical issues detected in recent logs."
    )

    return f"""Analysis for project "{project_name}" ({environment})

Your question: "{question}"

Log summary (last {len(logs)} entries)
  - Errors:   {error_count}
  - Warnings: {warn_count}
  - Info:     {info_count}
  - Debug:    {debug_count}

Sources detected: {", ".join(sources)}

Most recent errors:
{error_detail}

Overall health: {health}

{recommendation}

To enable full AI-powered analysis, add GEMINI_API_KEY to apps/backend/.env."""


@router.post("", response_model=AnalysisResponse)
def analyze_logs(
    project_id: int,
    body: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_project_or_404(project_id, current_user.id, db)

    logs = (
        db.query(Log)
        .filter(Log.project_id == project_id)
        .order_by(Log.timestamp.desc())
        .limit(100)
        .all()
    )

    if not logs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No logs found for this project. Upload some logs first.",
        )

    prompt = build_analysis_prompt(
        project_name=project.name,
        environment=project.environment,
        logs=logs,
        question=body.question,
    )

    if settings.GEMINI_API_KEY:
        return AnalysisResponse(answer=analyze_with_gemini(prompt))

    return AnalysisResponse(
        answer=build_mock_analysis(
            project_name=project.name,
            environment=project.environment,
            logs=logs,
            question=body.question,
        )
    )
