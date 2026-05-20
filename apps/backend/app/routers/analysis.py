import anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user
from app.models.log import Log
from app.models.project import Project
from app.models.user import User

router = APIRouter(prefix="/projects/{project_id}/analysis", tags=["analysis"])


class AnalysisRequest(BaseModel):
    question: str


class AnalysisResponse(BaseModel):
    answer: str


def get_project_or_404(project_id: int, user_id: int, db: Session) -> Project:
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.owner_id == user_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post("", response_model=AnalysisResponse)
async def analyze_logs(
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

    # Check if a real API key is configured
    import os
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if api_key:
        # Real AI analysis
        try:
            logs_text = "\n".join(
                f"[{log.timestamp}] [{log.level}] [{log.source}] {log.message}"
                for log in logs
            )

            prompt = f"""You are an expert DevOps engineer and site reliability engineer (SRE).
You are analysing logs for a project called "{project.name}" running in {project.environment}.

Here are the most recent logs:

{logs_text}

The engineer is asking: {body.question}

Provide a clear, structured answer. If you see errors or patterns, explain what they mean
and suggest concrete next steps to investigate or fix the issue."""

            client = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model="claude-opus-4-5",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
            )

            text_block = next(
                (block for block in message.content if isinstance(block, anthropic.types.TextBlock)),
                None,
            )

            if text_block is None:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="AI returned no text response",
                )

            return AnalysisResponse(answer=text_block.text)

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"AI service unavailable: {str(e)}",
            )

    # Mock analysis — used when no API key is configured
    error_count = sum(1 for log in logs if log.level == "ERROR")
    warn_count = sum(1 for log in logs if log.level == "WARN")
    info_count = sum(1 for log in logs if log.level == "INFO")
    debug_count = sum(1 for log in logs if log.level == "DEBUG")

    sources = list(set(log.source for log in logs))

    error_messages = [log.message for log in logs if log.level == "ERROR"][:3]
    error_detail = "\n".join(f"  • {msg}" for msg in error_messages) if error_messages else "  • None"

    health = "⚠️ Degraded" if error_count > 5 else "✅ Healthy"

    answer = f"""Analysis for project "{project.name}" ({project.environment})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your question: "{body.question}"

📊 Log Summary (last {len(logs)} entries)
  • Errors:   {error_count}
  • Warnings: {warn_count}
  • Info:     {info_count}
  • Debug:    {debug_count}

🖥️  Sources detected: {", ".join(sources)}

🔴 Most recent errors:
{error_detail}

🏥 Overall health: {health}

{'⚠️  High error rate detected. Recommended actions:\n  1. Check your database connection\n  2. Review service dependencies\n  3. Check available disk space and memory' if error_count > 5 else '✅ No critical issues detected in recent logs.'}

─────────────────────────────────────
💡 To enable full AI-powered analysis,
   add your ANTHROPIC_API_KEY to .env"""

    return AnalysisResponse(answer=answer)