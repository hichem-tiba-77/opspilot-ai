from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models import user  # noqa: F401
from app.routers import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OpsPilot AI — Backend",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}