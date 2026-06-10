from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List

from backend.database import get_session
from backend.models.study_guide import StudyGuide, StudyGuideSection

router = APIRouter()


class SectionCreate(BaseModel):
    heading: str
    section_type: str
    content: List[str]
    sort_order: int = 0


class StudyGuideCreate(BaseModel):
    user_id: str
    topic: str
    system: str
    sections: List[SectionCreate]
    related_card_ids: List[str] = []


@router.post("/", summary="Save a generated study guide")
async def create_guide(request: StudyGuideCreate, session: AsyncSession = Depends(get_session)):
    guide = StudyGuide(
        user_id=request.user_id,
        topic=request.topic,
        system=request.system,
        related_card_ids=request.related_card_ids,
    )
    session.add(guide)
    await session.flush()

    for i, sec in enumerate(request.sections):
        section = StudyGuideSection(
            guide_id=guide.id,
            heading=sec.heading,
            section_type=sec.section_type,
            content=sec.content,
            sort_order=sec.sort_order or i,
        )
        session.add(section)

    await session.flush()
    return guide


@router.get("/{user_id}", summary="Get all study guides for a user")
async def get_guides(user_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(StudyGuide).where(StudyGuide.user_id == user_id).order_by(StudyGuide.generated_at.desc())
    )
    return result.scalars().all()


@router.get("/{guide_id}/full", summary="Get a full study guide with all sections")
async def get_guide_full(guide_id: str, session: AsyncSession = Depends(get_session)):
    guide = await session.get(StudyGuide, guide_id)
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")

    sections_result = await session.execute(
        select(StudyGuideSection).where(StudyGuideSection.guide_id == guide_id).order_by(StudyGuideSection.sort_order)
    )
    sections = sections_result.scalars().all()
    return {"guide": guide, "sections": sections}
