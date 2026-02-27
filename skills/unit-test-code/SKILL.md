---
name: unit-test-code
description: >
  Standards for writing robust, isolated unit tests. Covers pytest (Python)
  and Vitest (TypeScript) patterns: fixtures, mocking, AAA structure, coverage
  strategy. Use when writing or reviewing test suites.
triggers:
  - "write tests"
  - "unit test"
  - "pytest"
  - "vitest"
  - "test this function"
  - "add tests"
  - "test coverage"
  - "mock"
---

# Skill: Unit Test Code

Robust, isolated, meaningful unit tests. Covers pytest and Vitest.

---

## Core Principles

1. **Isolation** — Tests must not depend on each other or real external services
2. **AAA Structure** — Arrange → Act → Assert
3. **One assertion concept per test** — Test one thing clearly
4. **Deterministic** — Same result every time, no flakiness

---

## Python (pytest)

### Setup

```python
# conftest.py — shared fixtures
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
def mock_db():
    """Mock database session — never hit real DB in unit tests."""
    with patch("app.api.deps.get_db") as mock:
        session = AsyncMock()
        mock.return_value = session
        yield session

@pytest.fixture
async def client():
    """Async test client for FastAPI."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac
```

### Test Patterns

```python
# tests/unit/test_user_service.py
import pytest
from unittest.mock import AsyncMock, patch
from uuid import uuid4
from app.services.user_service import UserService
from app.models.schemas import UserCreate

class TestUserService:

    @pytest.mark.asyncio
    async def test_create_user_success(self, mock_db):
        # Arrange
        mock_db.execute.return_value = AsyncMock()
        service = UserService(mock_db)
        data = UserCreate(email="test@example.com", name="Test User", password="secure123")

        # Act
        user = await service.create(data)

        # Assert
        assert user.email == "test@example.com"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_user_duplicate_email_raises(self, mock_db):
        # Arrange
        from sqlalchemy.exc import IntegrityError
        mock_db.commit.side_effect = IntegrityError("", {}, None)
        service = UserService(mock_db)
        data = UserCreate(email="exists@example.com", name="User", password="secure123")

        # Act & Assert
        with pytest.raises(ValueError, match="Email already exists"):
            await service.create(data)

    @pytest.mark.asyncio
    async def test_create_user_sends_welcome_email(self, mock_db):
        # Arrange
        with patch("app.services.user_service.send_welcome_email") as mock_email:
            service = UserService(mock_db)
            data = UserCreate(email="new@example.com", name="New", password="secure123")

            # Act
            await service.create(data)

            # Assert — verify side effect
            mock_email.assert_called_once_with("new@example.com", "New")
```

### API Route Tests

```python
# tests/unit/test_user_routes.py
@pytest.mark.asyncio
async def test_create_user_returns_201(client, mock_db):
    response = await client.post("/users/", json={
        "email": "test@example.com",
        "name": "Test User",
        "password": "secure123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "password" not in data  # Never expose password

@pytest.mark.asyncio
async def test_create_user_invalid_email_returns_422(client):
    response = await client.post("/users/", json={
        "email": "not-an-email",
        "name": "Test",
        "password": "secure123"
    })
    assert response.status_code == 422
```

---

## TypeScript (Vitest)

### Setup

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      reporter: ["text", "lcov"],
      threshold: { lines: 80, functions: 80 },
    },
  },
})
```

### Test Patterns

```typescript
// src/lib/__tests__/pricing.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import { calculateDiscount, processPayment } from "../pricing"

describe("calculateDiscount", () => {
  it("applies 20% for annual plan", () => {
    // Arrange
    const price = 100
    const plan = "annual"

    // Act
    const result = calculateDiscount(price, plan)

    // Assert
    expect(result).toBe(80)
  })

  it("returns original price for monthly plan", () => {
    expect(calculateDiscount(100, "monthly")).toBe(100)
  })

  it("throws for negative price", () => {
    expect(() => calculateDiscount(-10, "monthly")).toThrow("Price must be positive")
  })
})

describe("processPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls Stripe with correct amount", async () => {
    // Arrange
    const mockStripe = vi.mock("../stripe", () => ({
      createPaymentIntent: vi.fn().mockResolvedValue({ id: "pi_123", status: "succeeded" })
    }))

    // Act
    const result = await processPayment({ amount: 4900, currency: "usd" })

    // Assert
    expect(result.status).toBe("succeeded")
  })

  it("throws PaymentError on Stripe failure", async () => {
    vi.mock("../stripe", () => ({
      createPaymentIntent: vi.fn().mockRejectedValue(new Error("Card declined"))
    }))

    await expect(processPayment({ amount: 4900, currency: "usd" }))
      .rejects.toThrow("PaymentError")
  })
})
```

---

## Coverage Strategy

| Priority | What to Test | Tool |
|---|---|---|
| ⭐⭐⭐ | Business logic (pricing, auth, billing) | Unit tests |
| ⭐⭐⭐ | API input validation | Unit tests |
| ⭐⭐⭐ | Error paths and edge cases | Unit tests |
| ⭐⭐ | Service layer (DB operations) | Unit + Integration |
| ⭐ | UI components | Vitest + Testing Library |

**Never test:** framework internals, third-party library behavior, trivial getters/setters.
