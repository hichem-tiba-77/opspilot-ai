import json
from typing import Literal
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.deps import get_current_user, get_project_or_404
from app.models.log import Log
from app.models.user import User

router = APIRouter(prefix="/projects/{project_id}/analysis", tags=["analysis"])


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class AnalysisRequest(BaseModel):
    question: str
    history: list[ConversationMessage] = Field(default_factory=list)


class AnalysisResponse(BaseModel):
    answer: str
    provider: str
    model: str


def format_conversation_history(history: list[ConversationMessage]) -> str:
    if not history:
        return "No previous conversation in this chat."

    recent_history = history[-10:]
    formatted_messages = []
    for message in recent_history:
        role = "Engineer" if message.role == "user" else "OpsPilot AI"
        content = message.content.strip()
        if len(content) > 2500:
            content = f"{content[:2500]}\n[truncated]"
        formatted_messages.append(f"{role}: {content}")

    return "\n\n".join(formatted_messages)


def build_analysis_prompt(
    project_name: str,
    environment: str,
    logs: list[Log],
    question: str,
    history: list[ConversationMessage],
) -> str:
    logs_text = "\n".join(
        f"[{log.timestamp}] [{log.level}] [{log.source}] {log.message}"
        for log in logs
    )
    conversation_history = format_conversation_history(history)

    return f"""You are an expert DevOps engineer and site reliability engineer (SRE).
You are analyzing logs for a project called "{project_name}" running in {environment}.

Previous conversation:
{conversation_history}

Here are the most recent logs:

{logs_text}

Current engineer question: {question}

Write a detailed, evidence-based explanation. Do not give a generic summary.
Use the logs and previous chat context, call out exact clues, and explain your reasoning.

Format the answer with these sections:
1. Short conclusion
2. What the logs are showing
3. Most likely root cause
4. Evidence from the logs
5. What to check next
6. Fix plan
7. Commands or checks to run

If the evidence is incomplete, say what is uncertain and what data would prove or disprove it.
Prefer a long, practical answer with concrete investigation steps over a short response."""


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
    query = urlencode({"key": settings.GEMINI_API_KEY.strip()})
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
            "maxOutputTokens": settings.GEMINI_MAX_OUTPUT_TOKENS,
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
        history=body.history,
    )

    if not settings.GEMINI_API_KEY.strip():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Gemini API key is not configured in the backend container. "
                "Add GEMINI_API_KEY to apps/backend/.env, then recreate the backend container."
            ),
        )

    return AnalysisResponse(
        answer=analyze_with_gemini(prompt),
        provider="gemini",
        model=settings.GEMINI_MODEL,
    )
