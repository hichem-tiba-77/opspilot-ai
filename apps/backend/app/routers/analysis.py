import json
from typing import Literal
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.deps import get_current_user, get_project_or_404
from app.models.log import Log
from app.models.user import User

router = APIRouter(prefix="/projects/{project_id}/analysis", tags=["analysis"])


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=6000)

    @field_validator("content")
    @classmethod
    def trim_content(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Message content is required")
        return trimmed


class AnalysisRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    history: list[ConversationMessage] = Field(default_factory=list, max_length=10)

    @field_validator("question")
    @classmethod
    def trim_question(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Question is required")
        return trimmed


class AnalysisResponse(BaseModel):
    answer: str
    provider: str
    model: str
    thinking_mode: str


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
        f"[{log.timestamp}] [{log.level}] [{log.source}] {log.message[:2000]}"
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

Write a detailed, evidence-based investigation. Do not give a generic summary.
Use the logs and previous chat context, call out exact clues, connect symptoms to likely causes, and separate known facts from assumptions.
Prioritize production-safe guidance: include blast radius, rollback criteria, validation checks, and monitoring signals.
If multiple causes are plausible, rank them by likelihood and explain what evidence would confirm or rule out each one.

Format the answer with these sections:
1. Short conclusion
2. What the logs are showing
3. Most likely root cause
4. Evidence from the logs
5. What to check next
6. Fix plan
7. Rollback or mitigation plan
8. Commands or checks to run
9. Confidence and missing evidence

If the evidence is incomplete, say what is uncertain and what data would prove or disprove it.
Prefer a long, practical answer with concrete investigation steps over a short response."""


def is_gemini_three_model(model: str) -> bool:
    normalized = model.removeprefix("models/").lower()
    return normalized.startswith("gemini-3")


def is_gemini_two_five_model(model: str) -> bool:
    normalized = model.removeprefix("models/").lower()
    return normalized.startswith("gemini-2.5")


def build_thinking_config(model: str) -> tuple[dict[str, object], str]:
    if is_gemini_three_model(model):
        thinking_level = settings.GEMINI_THINKING_LEVEL.strip().lower()
        if thinking_level not in {"low", "high"}:
            thinking_level = "high"

        return {"thinkingLevel": thinking_level}, f"thinkingLevel:{thinking_level}"

    if is_gemini_two_five_model(model):
        thinking_budget = settings.GEMINI_THINKING_BUDGET
        return {"thinkingBudget": thinking_budget}, f"thinkingBudget:{thinking_budget}"

    return {}, "default"


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
    model_name = settings.GEMINI_MODEL.removeprefix("models/")
    model = quote(model_name, safe="")
    query = urlencode({"key": settings.GEMINI_API_KEY.strip()})
    url = (
        "https://generativelanguage.googleapis.com/v1beta/"
        f"models/{model}:generateContent?{query}"
    )
    thinking_config, _thinking_mode = build_thinking_config(model_name)
    generation_config: dict[str, object] = {
        "temperature": 0.15,
        "maxOutputTokens": settings.GEMINI_MAX_OUTPUT_TOKENS,
    }
    if thinking_config:
        generation_config["thinkingConfig"] = thinking_config

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": generation_config,
    }
    request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=settings.GEMINI_TIMEOUT_SECONDS) as response:
            data = json.loads(response.read().decode("utf-8"))
    except TimeoutError as error:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=(
                "AI analysis took too long to respond. Please try again, "
                "or ask a narrower question."
            ),
        ) from error
    except HTTPError as error:
        detail = read_gemini_error(error)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI analysis service returned an upstream error: {detail}",
        ) from error
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI analysis service is temporarily unavailable. "
                "Please try again in a moment."
            ),
        ) from error

    answer = extract_gemini_text(data)
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI analysis service returned no answer. Please try again.",
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
                "AI analysis is not configured in the backend container. "
                "Add the AI API key to apps/backend/.env, then recreate the backend container."
            ),
        )

    return AnalysisResponse(
        answer=analyze_with_gemini(prompt),
        provider="gemini",
        model=settings.GEMINI_MODEL,
        thinking_mode=build_thinking_config(settings.GEMINI_MODEL)[1],
    )
