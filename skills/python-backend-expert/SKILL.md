---
name: python-backend-expert
description: >
  Expert Python backend patterns: FastAPI, Pydantic v2, AsyncIO, dependency injection,
  SQLAlchemy async, and AI service integration. Use for any Python API development.
triggers:
  - "fastapi"
  - "python backend"
  - "python api"
  - "pydantic"
  - "asyncio"
  - "python"
  - "sqlalchemy"
  - "async python"
---

# Skill: Python Backend Expert

Production-grade FastAPI patterns with Pydantic v2, async SQLAlchemy, and AI service integration.

---

## Project Structure

```
src/
├── api/
│   ├── routes/
│   │   ├── users.py
│   │   └── items.py
│   └── deps.py          # Shared dependencies (auth, db)
├── models/
│   ├── db.py            # SQLAlchemy models
│   └── schemas.py       # Pydantic schemas
├── services/
│   ├── user_service.py
│   └── ai_service.py    # AI/LLM isolated here
├── core/
│   ├── config.py        # Settings via pydantic-settings
│   ├── database.py      # Async DB session
│   └── security.py      # Auth utilities
└── main.py
```

---

## Pydantic v2 — Data Validation

```python
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from datetime import datetime
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100, description="Full name")
    password: str = Field(..., min_length=8, description="Min 8 characters")

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # Pydantic v2

    id: UUID
    email: EmailStr
    name: str
    created_at: datetime
    # Never include password hash in response

class PaginatedResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    page_size: int
    has_next: bool
```

---

## FastAPI — Routes

```python
from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from .deps import get_current_user, get_db
from ..models.schemas import UserCreate, UserResponse
from ..services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    service = UserService(db)
    try:
        user = await service.create(data)
        return UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),  # Auth required
) -> UserResponse:
    service = UserService(db)
    user = await service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)
```

---

## Async SQLAlchemy

```python
# core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

engine = create_async_engine(
    settings.DATABASE_URL,  # postgresql+asyncpg://...
    pool_size=10,
    max_overflow=20,
    echo=False,
)

async_session_factory = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

# api/deps.py
async def get_db():
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

```python
# models/db.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime, func
from uuid import UUID, uuid4

class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(default=uuid4, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    hashed_password: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    deleted_at: Mapped[datetime | None]  # Soft delete
```

---

## AI Service Integration

```python
# services/ai_service.py
from anthropic import AsyncAnthropic
from pydantic import BaseModel
import asyncio

client = AsyncAnthropic()

class AnalysisResult(BaseModel):
    summary: str
    sentiment: str
    key_points: list[str]
    confidence: float

async def analyse_text(text: str) -> AnalysisResult:
    """Analyse text with Claude. Isolated from route handlers."""
    try:
        response = await asyncio.wait_for(
            client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=1000,
                messages=[{
                    "role": "user",
                    "content": f"Analyse this text and respond with JSON only: {text}"
                }]
            ),
            timeout=30.0  # Always set timeout on AI calls
        )
        raw = response.content[0].text
        return AnalysisResult.model_validate_json(raw)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="AI service timeout")
    except Exception as e:
        logger.error(f"AI service error: {e}")
        raise HTTPException(status_code=502, detail="AI service unavailable")
```

---

## Settings with pydantic-settings

```python
# core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DATABASE_URL: str
    ANTHROPIC_API_KEY: str
    JWT_SECRET: str
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "info"

settings = Settings()  # Validates on startup — fails fast if missing
```

---

## New Feature Checklist

- [ ] Pydantic request/response models defined
- [ ] Async route handler (no blocking I/O)
- [ ] Proper HTTPException with status codes
- [ ] Dependency injection for DB + auth
- [ ] AI calls isolated in `services/ai_service.py`
- [ ] Tests written (pytest + httpx AsyncClient)
