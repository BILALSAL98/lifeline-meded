from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
import uuid


class Deck(SQLModel, table=True):
    __tablename__ = "decks"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    name: str                                               # e.g. "Nephrotic Syndrome"
    full_path: str                                          # e.g. "Step 1::Renal::Nephrotic Syndrome"
    card_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FlashCard(SQLModel, table=True):
    __tablename__ = "flashcards"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    deck_id: Optional[str] = Field(default=None, foreign_key="decks.id", index=True)

    # Card content
    card_type: str = Field(default="basic")                 # basic, cloze, vignette, comparison
    front: str
    back: str
    cloze_text: Optional[str] = None
    explanation: str = Field(default="")

    # Metadata
    tags: List[str] = Field(default=[], sa_column=Column(JSON))
    topic: str
    system: str
    difficulty: int = Field(default=3)                      # 1-5
    board_relevance: str = Field(default="step1")           # step1, step2, both, clinical, comlex

    # Source tracking
    source_type: str = Field(default="other")               # qbank, video, lecture, textbook, notes
    source_text: str = Field(default="")

    # Weakness tracking
    weakness_reason: Optional[str] = None
    weakness_category: Optional[str] = None

    # Spaced repetition (SM-2 algorithm)
    ease_factor: float = Field(default=2.5)
    interval_days: int = Field(default=1)
    repetitions: int = Field(default=0)
    due_date: datetime = Field(default_factory=datetime.utcnow)
    last_reviewed: Optional[datetime] = None

    # Anki integration
    exported_to_anki: bool = Field(default=False)
    anki_note_id: Optional[int] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
