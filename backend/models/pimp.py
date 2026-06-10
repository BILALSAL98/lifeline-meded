from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
import uuid


class PimpSession(SQLModel, table=True):
    __tablename__ = "pimp_sessions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    topic: str
    system: str
    level: str = Field(default="step1")                     # ms1, ms2, step1, step2, clinical, intern, resident
    overall_score: float = Field(default=0.0)               # 0-100
    strengths: List[str] = Field(default=[], sa_column=Column(JSON))
    weaknesses: List[str] = Field(default=[], sa_column=Column(JSON))
    missed_concepts: List[str] = Field(default=[], sa_column=Column(JSON))
    recommended_card_ids: List[str] = Field(default=[], sa_column=Column(JSON))
    new_cards_created: List[str] = Field(default=[], sa_column=Column(JSON))
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


class PimpQuestion(SQLModel, table=True):
    __tablename__ = "pimp_questions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = Field(foreign_key="pimp_sessions.id", index=True)
    question: str
    question_type: str                                      # definition, mechanism, lab, differential, treatment, etc.
    expected_answer: str
    student_answer: Optional[str] = None
    score: Optional[str] = None                             # correct, partial, incorrect
    feedback: Optional[str] = None
    follow_up_question: Optional[str] = None
    generated_card_id: Optional[str] = None
    asked_at: datetime = Field(default_factory=datetime.utcnow)
    answered_at: Optional[datetime] = None


class PimpMessage(SQLModel, table=True):
    __tablename__ = "pimp_messages"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = Field(foreign_key="pimp_sessions.id", index=True)
    role: str                                               # attending, student
    content: str
    score: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
