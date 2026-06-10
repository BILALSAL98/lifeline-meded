"""
AI Pimping (Oral Rounds) routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
import os
import anthropic
from datetime import datetime

from backend.database import get_session
from backend.models.pimp import PimpSession, PimpQuestion, PimpMessage
from backend.models.user import UserWeakness

router = APIRouter()

AI_ATTENDING_SYSTEM = """You are Dr. Chen, a brilliant and demanding internal medicine attending physician.
You are conducting oral rounds with a medical student.

Your teaching style:
- Ask ONE clear question at a time
- Never immediately reveal the answer if wrong — guide toward it with follow-up questions
- Acknowledge correct answers briefly, then immediately push to the next level
- For partial answers, probe what they know and fill gaps
- Always connect answers to clinical practice
- Be tough but fair — like the best attendings who genuinely want students to learn

Response format (JSON only):
{
  "content": "Your response as the attending",
  "score": "correct|partial|incorrect",
  "follow_up": "next question or null if session ending",
  "new_card_content": "null or {front, back} if missed concept needs a card"
}"""


class StartPimpRequest(BaseModel):
    user_id: str
    topic: str
    system: str
    level: str = "step1"


class AnswerRequest(BaseModel):
    session_id: str
    user_id: str
    question_id: str
    answer: str


@router.post("/start", summary="Start an AI pimping session")
async def start_session(request: StartPimpRequest, session: AsyncSession = Depends(get_session)):
    pimp_session = PimpSession(
        user_id=request.user_id,
        topic=request.topic,
        system=request.system,
        level=request.level,
    )
    session.add(pimp_session)
    await session.flush()

    # Generate opening question
    opening = await _generate_opening_question(request.topic, request.system, request.level)

    first_question = PimpQuestion(
        session_id=pimp_session.id,
        question=opening["question"],
        question_type=opening.get("type", "mechanism"),
        expected_answer=opening.get("expected_answer", ""),
    )
    session.add(first_question)

    opening_msg = PimpMessage(
        session_id=pimp_session.id,
        role="attending",
        content=opening["content"],
    )
    session.add(opening_msg)
    await session.flush()

    return {
        "session_id": pimp_session.id,
        "first_message": opening_msg,
        "first_question": first_question,
    }


@router.post("/answer", summary="Submit an answer and get AI attending response")
async def submit_answer(request: AnswerRequest, session: AsyncSession = Depends(get_session)):
    question = await session.get(PimpQuestion, request.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    pimp_session = await session.get(PimpSession, request.session_id)

    # Save student message
    student_msg = PimpMessage(
        session_id=request.session_id,
        role="student",
        content=request.answer,
    )
    session.add(student_msg)

    # Get AI attending response
    ai_response = await _evaluate_answer(
        question=question.question,
        expected=question.expected_answer,
        student_answer=request.answer,
        topic=pimp_session.topic if pimp_session else "Medicine",
        level=pimp_session.level if pimp_session else "step1",
    )

    # Update question record
    question.student_answer = request.answer
    question.score = ai_response["score"]
    question.feedback = ai_response["content"]
    question.answered_at = datetime.utcnow()
    session.add(question)

    # Save AI response
    ai_msg = PimpMessage(
        session_id=request.session_id,
        role="attending",
        content=ai_response["content"],
        score=ai_response["score"],
    )
    session.add(ai_msg)

    # Track weakness if incorrect
    if ai_response["score"] == "incorrect" and pimp_session:
        weakness = UserWeakness(
            user_id=request.user_id,
            topic=pimp_session.topic,
            system=pimp_session.system,
            weakness_category="mechanism",
        )
        session.add(weakness)

    await session.flush()
    return {"ai_message": ai_msg, "score": ai_response["score"], "follow_up": ai_response.get("follow_up")}


async def _generate_opening_question(topic: str, system: str, level: str) -> dict:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return {
            "question": f"Tell me about {topic}. Start with the pathophysiology.",
            "type": "mechanism",
            "expected_answer": "Detailed mechanistic explanation",
            "content": f"Good morning. You're presenting to me today on {topic}. Walk me through the pathophysiology.",
        }

    client = anthropic.AsyncAnthropic(api_key=api_key)
    prompt = f"Generate an opening pimp question for a {level} student on the topic of {topic} in {system}. Return JSON: {{question, type, expected_answer, content}}"

    msg = await client.messages.create(
        model="claude-sonnet-4-6", max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )
    import json, re
    match = re.search(r'\{[\s\S]*\}', msg.content[0].text)
    return json.loads(match.group()) if match else {"question": f"Explain {topic}", "type": "mechanism", "expected_answer": "", "content": f"Let's talk about {topic}."}


async def _evaluate_answer(question: str, expected: str, student_answer: str, topic: str, level: str) -> dict:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return {"content": "Good attempt. Let me push you a bit further. Can you explain the mechanism in more detail?", "score": "partial", "follow_up": None}

    client = anthropic.AsyncAnthropic(api_key=api_key)
    prompt = f"""
Evaluate this student answer during oral rounds on {topic}.

Question: {question}
Expected answer: {expected}
Student said: {student_answer}
Level: {level}

{AI_ATTENDING_SYSTEM}
"""
    msg = await client.messages.create(
        model="claude-sonnet-4-6", max_tokens=800,
        messages=[{"role": "user", "content": prompt}]
    )
    import json, re
    match = re.search(r'\{[\s\S]*\}', msg.content[0].text)
    return json.loads(match.group()) if match else {"content": msg.content[0].text, "score": "partial", "follow_up": None}
