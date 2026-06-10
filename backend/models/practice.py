from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
import uuid


class Question(SQLModel, table=True):
    __tablename__ = "questions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)

    # Content
    stem: str
    options: List[str] = Field(sa_column=Column(JSON))
    correct_index: int
    explanation: str
    wrong_explanations: List[str] = Field(default=[], sa_column=Column(JSON))

    # Metadata
    topic: str
    system: str
    difficulty: int = Field(default=3)                      # 1-5
    board_relevance: str = Field(default="step1")
    question_type: str = Field(default="mcq")               # mcq, multi-select, image, vignette
    source: str = Field(default="NBME-style")
    tags: List[str] = Field(default=[], sa_column=Column(JSON))

    # AI generation
    ai_generated: bool = Field(default=False)
    generated_from_card_id: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)


class PracticeSession(SQLModel, table=True):
    __tablename__ = "practice_sessions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    system_filter: Optional[str] = None
    total_questions: int = Field(default=0)
    correct: int = Field(default=0)
    accuracy: float = Field(default=0.0)
    avg_time_seconds: float = Field(default=0.0)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


class PracticeAnswer(SQLModel, table=True):
    __tablename__ = "practice_answers"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = Field(foreign_key="practice_sessions.id", index=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    question_id: str = Field(foreign_key="questions.id", index=True)
    selected_index: int
    is_correct: bool
    time_seconds: float
    flagged: bool = Field(default=False)
    bookmarked: bool = Field(default=False)
    answered_at: datetime = Field(default_factory=datetime.utcnow)
