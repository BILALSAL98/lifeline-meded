# Re-export all models so SQLModel metadata registers them all
from backend.models.user import User, UserWeakness
from backend.models.flashcard import FlashCard, Deck
from backend.models.study_guide import StudyGuide, StudyGuideSection
from backend.models.practice import Question, PracticeSession, PracticeAnswer
from backend.models.pimp import PimpSession, PimpQuestion, PimpMessage
from backend.models.nexus import NexusPost, NexusConnection, StudyGroup

__all__ = [
    "User", "UserWeakness",
    "FlashCard", "Deck",
    "StudyGuide", "StudyGuideSection",
    "Question", "PracticeSession", "PracticeAnswer",
    "PimpSession", "PimpQuestion", "PimpMessage",
    "NexusPost", "NexusConnection", "StudyGroup",
]
