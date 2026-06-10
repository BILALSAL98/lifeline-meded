"""
Auth routes — Clerk webhook handler + user creation on first login
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from backend.database import get_session
from backend.models.user import User

router = APIRouter()


class UserCreateRequest(BaseModel):
    clerk_id: str
    email: str
    first_name: str
    last_name: str
    program: Optional[str] = "MD"
    year: Optional[str] = "MS2"
    school: Optional[str] = None


@router.post("/clerk-webhook", summary="Handle Clerk webhook events")
async def clerk_webhook(request: Request, session: AsyncSession = Depends(get_session)):
    """
    Receives Clerk webhook events (user.created, user.updated, user.deleted).
    Creates / updates user records in Lifeline's database.
    """
    payload = await request.json()
    event_type = payload.get("type")

    if event_type == "user.created":
        data = payload["data"]
        email = data["email_addresses"][0]["email_address"]

        # Check if already exists
        result = await session.execute(select(User).where(User.clerk_id == data["id"]))
        existing = result.scalar_one_or_none()
        if existing:
            return {"ok": True, "action": "already_exists"}

        user = User(
            clerk_id=data["id"],
            email=email,
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
        )
        session.add(user)
        await session.flush()
        return {"ok": True, "user_id": user.id}

    elif event_type == "user.deleted":
        clerk_id = payload["data"]["id"]
        result = await session.execute(select(User).where(User.clerk_id == clerk_id))
        user = result.scalar_one_or_none()
        if user:
            await session.delete(user)
        return {"ok": True}

    return {"ok": True, "action": "ignored"}


@router.get("/me/{clerk_id}", summary="Get current user by Clerk ID")
async def get_me(clerk_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/onboarding/{clerk_id}", summary="Complete user onboarding")
async def complete_onboarding(
    clerk_id: str,
    data: UserCreateRequest,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.program = data.program or user.program
    user.year = data.year or user.year
    user.school = data.school or user.school
    session.add(user)
    await session.flush()
    return user
