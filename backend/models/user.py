from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
import uuid


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    clerk_id: str = Field(unique=True, index=True)          # Clerk auth user ID
    email: str = Field(unique=True, index=True)
    first_name: str
    last_name: str
    program: str = Field(default="MD")                      # MD, DO, PA, NP, IMG
    year: str = Field(default="MS2")                        # MS1-MS4, Resident, etc.
    school: Optional[str] = None
    target_exam: Optional[str] = None                       # "step1", "step2", "comlex1"
    exam_date: Optional[datetime] = None

    # Gamification
    xp: int = Field(default=0)
    level: int = Field(default=1)
    streak_days: int = Field(default=0)
    last_active: Optional[datetime] = None

    # Subscription
    plan: str = Field(default="free")                       # free, pro, institutional
    stripe_customer_id: Optional[str] = None
    subscription_end: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserWeakness(SQLModel, table=True):
    __tablename__ = "user_weaknesses"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    topic: str
    system: str
    miss_count: int = Field(default=1)
    weakness_category: str                                  # mechanism, diagnostic, management, etc.
    last_missed: datetime = Field(default_factory=datetime.utcnow)
    predicted_forget_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
