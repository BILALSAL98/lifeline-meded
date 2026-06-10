from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from backend.database import get_session
from backend.models.user import User, UserWeakness
from backend.models.flashcard import FlashCard
from backend.models.practice import PracticeSession
from backend.models.pimp import PimpSession

router = APIRouter()


@router.get("/{user_id}/dashboard-summary", summary="Get data for the main dashboard")
async def get_dashboard_summary(user_id: str, session: AsyncSession = Depends(get_session)):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Due cards count
    now = datetime.utcnow()
    due_result = await session.execute(
        select(FlashCard).where(FlashCard.user_id == user_id, FlashCard.due_date <= now)
    )
    due_cards = due_result.scalars().all()

    # Recent practice sessions
    practice_result = await session.execute(
        select(PracticeSession)
        .where(PracticeSession.user_id == user_id)
        .order_by(PracticeSession.started_at.desc())
        .limit(5)
    )
    recent_sessions = practice_result.scalars().all()

    # Weaknesses
    weakness_result = await session.execute(
        select(UserWeakness)
        .where(UserWeakness.user_id == user_id)
        .order_by(UserWeakness.miss_count.desc())
        .limit(5)
    )
    weaknesses = weakness_result.scalars().all()

    return {
        "user": user,
        "due_card_count": len(due_cards),
        "streak_days": user.streak_days,
        "xp": user.xp,
        "level": user.level,
        "recent_sessions": recent_sessions,
        "top_weaknesses": weaknesses,
    }


@router.post("/{user_id}/xp", summary="Award XP to a user")
async def award_xp(user_id: str, amount: int, session: AsyncSession = Depends(get_session)):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.xp += amount
    # Level up every 500 XP
    user.level = max(1, user.xp // 500 + 1)
    session.add(user)
    await session.flush()
    return {"xp": user.xp, "level": user.level}
