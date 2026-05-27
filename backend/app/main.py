from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.nesta import router as nesta_router

app = FastAPI(
    title="Nesta AI Assistant",
    description="AI career companion — Claude + Gemini + pgvector",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://nesta.gunghointernational.com",
        "https://www.askaati.ai",
        "https://askaati.ai",
        "https://project-0f32b9a0-6f64-41d5-926.web.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(nesta_router)