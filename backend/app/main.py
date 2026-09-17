import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException, RequestValidationError
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
        sys.stderr.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass

from .routers import bot
from .database import Base, engine, init_db

load_dotenv()

# Automatically initialize database tables inside SQLite or Neon PostgreSQL on launch
Base.metadata.create_all(bind=engine)

app = FastAPI(title="QuillBot Backend", version="0.1.0")


@app.on_event("startup")
async def on_startup():
    Base.metadata.create_all(bind=engine)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bot.router, prefix="/api/v1")


@app.post("/chat/compare")
@app.post("/api/v1/chat/compare")
async def chat_compare_alias(request: bot.ChatCompareRequest):
    return await bot.chat_compare(request)


@app.post("/fact-check")
@app.post("/api/v1/fact-check")
async def fact_check_alias(request: bot.FactCheckRequest):
    return await bot.fact_check_endpoint(request)


@app.post("/bot/{bot_id}/generate-probe")
@app.post("/api/v1/bot/{bot_id}/generate-probe")
async def generate_probe_alias(bot_id: str, request: bot.GenerateProbeRequest):
    return await bot.generate_probe_endpoint(bot_id, request)




@app.get("/")
async def root():
    return {"message": "QuillBot Backend is running!"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "QuillBot Backend",
        "version": "0.1.0"
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "status_code": 422},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later.", "status_code": 500},
    )


