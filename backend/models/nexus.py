from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
import uuid


class NexusPost(SQLModel, table=True):
    __tablename__ = "nexus_posts"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    author_id: str = Field(foreign_key="users.id", index=True)
    content: str
    tag: Optional[str] = None                              # Win, Teaching, Study Tip, Question
    likes: int = Field(default=0)
    comments: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NexusConnection(SQLModel, table=True):
    __tablename__ = "nexus_connections"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    requester_id: str = Field(foreign_key="users.id", index=True)
    recipient_id: str = Field(foreign_key="users.id", index=True)
    status: str = Field(default="pending")                 # pending, accepted, declined
    created_at: datetime = Field(default_factory=datetime.utcnow)


class StudyGroup(SQLModel, table=True):
    __tablename__ = "study_groups"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    description: Optional[str] = None
    member_ids: List[str] = Field(default=[], sa_column=Column(JSON))
    admin_id: str = Field(foreign_key="users.id")
    is_public: bool = Field(default=True)
    tags: List[str] = Field(default=[], sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
