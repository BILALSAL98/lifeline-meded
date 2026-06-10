"""
Flashcard API routes — CRUD + AI generation + Anki export
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

from backend.database import get_session
from backend.models.flashcard import FlashCard, Deck
from backend.services.ai_card_generator import generate_cards_from_text

router = APIRouter()


# ─── Request / Response schemas ──────────────────────────────────────────────

class GenerateCardsRequest(BaseModel):
    text: str
    source_type: str = "other"
    topic: Optional[str] = None
    system: Optional[str] = None
    weakness_reason: Optional[str] = None
    user_id: str


class CardCreateRequest(BaseModel):
    user_id: str
    card_type: str = "basic"
    front: str
    back: str
    cloze_text: Optional[str] = None
    explanation: str = ""
    tags: List[str] = []
    deck: str = "General"
    topic: str
    system: str
    difficulty: int = 3
    board_relevance: str = "step1"
    source_type: str = "other"
    source_text: str = ""
    weakness_reason: Optional[str] = None
    weakness_category: Optional[str] = None


class SpacedRepetitionUpdate(BaseModel):
    card_id: str
    rating: str  # "again", "hard", "good", "easy"


# ─── SM-2 Spaced Repetition Algorithm ────────────────────────────────────────

def sm2_update(card: FlashCard, rating: str) -> FlashCard:
    """Update card scheduling using SuperMemo SM-2 algorithm."""
    rating_map = {"again": 0, "hard": 2, "good": 3, "easy": 5}
    q = rating_map.get(rating, 3)

    if q < 3:
        card.repetitions = 0
        card.interval_days = 1
    else:
        if card.repetitions == 0:
            card.interval_days = 1
        elif card.repetitions == 1:
            card.interval_days = 6
        else:
            card.interval_days = round(card.interval_days * card.ease_factor)
        card.repetitions += 1

    card.ease_factor = max(1.3, card.ease_factor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    card.last_reviewed = datetime.utcnow()

    from datetime import timedelta
    card.due_date = datetime.utcnow() + timedelta(days=card.interval_days)
    return card


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/generate", summary="Generate flashcards from text using AI")
async def generate_cards(
    request: GenerateCardsRequest,
    session: AsyncSession = Depends(get_session),
):
    """
    Takes raw text (qbank explanation, transcript, notes) and returns
    AI-generated flashcards + a study guide structure.
    """
    try:
        result = await generate_cards_from_text(
            text=request.text,
            source_type=request.source_type,
            topic=request.topic,
            system=request.system,
        )
        # Save generated cards to DB
        saved_cards = []
        for card_data in result["cards"]:
            card = FlashCard(
                user_id=request.user_id,
                weakness_reason=request.weakness_reason,
                **card_data,
            )
            session.add(card)
            saved_cards.append(card)

        await session.flush()
        return {"cards": saved_cards, "study_guide": result.get("study_guide"), "topic": result.get("topic"), "system": result.get("system")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/due", summary="Get cards due for spaced repetition review")
async def get_due_cards(
    user_id: str,
    limit: int = 20,
    session: AsyncSession = Depends(get_session),
):
    now = datetime.utcnow()
    result = await session.execute(
        select(FlashCard)
        .where(FlashCard.user_id == user_id, FlashCard.due_date <= now)
        .order_by(FlashCard.due_date)
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/", summary="Create a single flashcard")
async def create_card(
    request: CardCreateRequest,
    session: AsyncSession = Depends(get_session),
):
    card = FlashCard(**request.model_dump())
    session.add(card)
    await session.flush()
    return card


@router.patch("/{card_id}/review", summary="Submit a spaced repetition rating for a card")
async def review_card(
    card_id: str,
    update: SpacedRepetitionUpdate,
    session: AsyncSession = Depends(get_session),
):
    card = await session.get(FlashCard, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    card = sm2_update(card, update.rating)
    session.add(card)
    await session.flush()
    return card


@router.delete("/{card_id}")
async def delete_card(card_id: str, session: AsyncSession = Depends(get_session)):
    card = await session.get(FlashCard, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    await session.delete(card)
    return {"ok": True}


@router.get("/{user_id}/export/csv", summary="Export user's cards as CSV for Anki import")
async def export_csv(user_id: str, session: AsyncSession = Depends(get_session)):
    """Returns CSV-formatted flashcards compatible with Anki import."""
    result = await session.execute(select(FlashCard).where(FlashCard.user_id == user_id))
    cards = result.scalars().all()

    import csv, io
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Front", "Back", "Tags", "Deck", "Type"])
    for card in cards:
        writer.writerow([card.front, card.back, " ".join(card.tags), card.deck_id or "General", card.card_type])

    from fastapi.responses import StreamingResponse
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=lifeline_cards.csv"},
    )
