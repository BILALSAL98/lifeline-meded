from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from backend.database import get_session
from backend.models.practice import Question, PracticeSession, PracticeAnswer

router = APIRouter()


class StartSessionRequest(BaseModel):
    user_id: str
    system_filter: Optional[str] = None
    difficulty_filter: Optional[int] = None
    count: int = 20


class SubmitAnswerRequest(BaseModel):
    session_id: str
    user_id: str
    question_id: str
    selected_index: int
    time_seconds: float
    flagged: bool = False
    bookmarked: bool = False


@router.post("/sessions/start")
async def start_session(request: StartSessionRequest, session: AsyncSession = Depends(get_session)):
    query = select(Question)
    if request.system_filter:
        query = query.where(Question.system == request.system_filter)
    if request.difficulty_filter:
        query = query.where(Question.difficulty == request.difficulty_filter)
    query = query.order_by(func.random()).limit(request.count)

    result = await session.execute(query)
    questions = result.scalars().all()

    practice_session = PracticeSession(
        user_id=request.user_id,
        system_filter=request.system_filter,
        total_questions=len(questions),
    )
    session.add(practice_session)
    await session.flush()
    return {"session_id": practice_session.id, "questions": questions}


@router.post("/answers/submit")
async def submit_answer(request: SubmitAnswerRequest, session: AsyncSession = Depends(get_session)):
    question = await session.get(Question, request.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    is_correct = request.selected_index == question.correct_index

    answer = PracticeAnswer(
        session_id=request.session_id,
        user_id=request.user_id,
        question_id=request.question_id,
        selected_index=request.selected_index,
        is_correct=is_correct,
        time_seconds=request.time_seconds,
        flagged=request.flagged,
        bookmarked=request.bookmarked,
    )
    session.add(answer)
    await session.flush()

    return {
        "is_correct": is_correct,
        "correct_index": question.correct_index,
        "explanation": question.explanation,
        "wrong_explanations": question.wrong_explanations,
    }


@router.post("/sessions/{session_id}/complete")
async def complete_session(session_id: str, db: AsyncSession = Depends(get_session)):
    practice_session = await db.get(PracticeSession, session_id)
    if not practice_session:
        raise HTTPException(status_code=404, detail="Session not found")

    answers_result = await db.execute(
        select(PracticeAnswer).where(PracticeAnswer.session_id == session_id)
    )
    answers = answers_result.scalars().all()

    correct = sum(1 for a in answers if a.is_correct)
    total = len(answers)
    avg_time = sum(a.time_seconds for a in answers) / total if total > 0 else 0

    practice_session.correct = correct
    practice_session.accuracy = correct / total if total > 0 else 0
    practice_session.avg_time_seconds = avg_time
    practice_session.completed_at = datetime.utcnow()
    db.add(practice_session)
    await db.flush()

    return {
        "session": practice_session,
        "correct": correct,
        "total": total,
        "accuracy": practice_session.accuracy,
    }


@router.get("/{user_id}/stats")
async def get_practice_stats(user_id: str, db: AsyncSession = Depends(get_session)):
    sessions_result = await db.execute(
        select(PracticeSession).where(PracticeSession.user_id == user_id).order_by(PracticeSession.started_at.desc()).limit(10)
    )
    sessions = sessions_result.scalars().all()

    if not sessions:
        return {"total_questions": 0, "average_accuracy": 0, "sessions": []}

    total_q = sum(s.total_questions for s in sessions)
    avg_acc = sum(s.accuracy for s in sessions if s.completed_at) / len([s for s in sessions if s.completed_at]) if sessions else 0

    return {"total_questions": total_q, "average_accuracy": avg_acc, "sessions": sessions}
