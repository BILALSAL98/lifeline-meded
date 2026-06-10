from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from backend.database import get_session
from backend.models.nexus import NexusPost, NexusConnection, StudyGroup

router = APIRouter()


class PostCreate(BaseModel):
    author_id: str
    content: str
    tag: Optional[str] = None


@router.get("/feed")
async def get_feed(limit: int = 20, db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(NexusPost).order_by(NexusPost.created_at.desc()).limit(limit)
    )
    return result.scalars().all()


@router.post("/posts")
async def create_post(request: PostCreate, db: AsyncSession = Depends(get_session)):
    post = NexusPost(**request.model_dump())
    db.add(post)
    await db.flush()
    return post


@router.post("/posts/{post_id}/like")
async def like_post(post_id: str, db: AsyncSession = Depends(get_session)):
    post = await db.get(NexusPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.likes += 1
    db.add(post)
    await db.flush()
    return {"likes": post.likes}


@router.get("/groups")
async def get_groups(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(StudyGroup).where(StudyGroup.is_public == True))
    return result.scalars().all()
