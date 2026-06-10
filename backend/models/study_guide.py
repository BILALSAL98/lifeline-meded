from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
import uuid


class StudyGuide(SQLModel, table=True):
    __tablename__ = "study_guides"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    topic: str
    system: str
    related_card_ids: List[str] = Field(default=[], sa_column=Column(JSON))
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class StudyGuideSection(SQLModel, table=True):
    __tablename__ = "study_guide_sections"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    guide_id: str = Field(foreign_key="study_guides.id", index=True)
    heading: str
    section_type: str                                       # concept, presentation, diagnostics, management, pharmacology, pearls, traps
    content: List[str] = Field(default=[], sa_column=Column(JSON))
    sort_order: int = Field(default=0)
