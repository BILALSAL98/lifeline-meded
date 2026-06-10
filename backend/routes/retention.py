from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from backend.database import get_session
from backend.models.flashcard import FlashCard

router = APIRouter()


@router.get("/{user_id}/due")
async def get_due_cards(user_id: str, limit: int = 20, db: AsyncSession = Depends(get_session)):
    now = datetime.utcnow()
    result = await db.execute(
        select(FlashCard)
        .where(FlashCard.user_id == user_id, FlashCard.due_date <= now)
        .order_by(FlashCard.due_date)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{user_id}/stats")
async def get_retention_stats(user_id: str, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(FlashCard).where(FlashCard.user_id == user_id))
    cards = result.scalars().all()
    now = datetime.utcnow()

    return {
        "total_cards": len(cards),
        "due_now": len([c for c in cards if c.due_date <= now]),
        "mastered": len([c for c in cards if c.interval_days >= 21]),
        "learning": len([c for c in cards if 0 < c.interval_days < 21]),
        "new": len([c for c in cards if c.repetitions == 0]),
    }
