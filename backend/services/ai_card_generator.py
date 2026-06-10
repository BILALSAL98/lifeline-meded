"""
AI Card Generation Service
Uses Claude (primary) with OpenAI fallback to generate high-quality flashcards
from raw text input (qbank explanations, transcripts, notes, textbook excerpts).
"""

import os
import json
import re
from typing import Optional
import anthropic

SYSTEM_PROMPT = """You are an expert medical education AI that converts raw medical text
into high-yield flashcards and structured study guides.

Rules for flashcard generation:
- Cards must be SHORT, SPECIFIC, and TESTABLE
- Focus on MECHANISMS over raw facts
- Prefer cloze deletion for facts, basic cards for mechanisms
- Generate clinical vignette cards for application
- Generate comparison cards for commonly confused topics
- Never duplicate what's already clear
- Always include a brief explanation (why this card matters)
- Classify each card by system and topic
- Rate difficulty 1-5 (1=easy fact, 5=complex mechanism)

Output valid JSON only. No prose before or after the JSON.
"""

USER_PROMPT_TEMPLATE = """Convert this medical content into flashcards and a study guide.

SOURCE TYPE: {source_type}
CONTENT:
{text}

Return JSON in exactly this format:
{{
  "topic": "detected topic name",
  "system": "organ system (e.g. Renal, Cardiology)",
  "cards": [
    {{
      "card_type": "basic|cloze|vignette|comparison",
      "front": "question or prompt",
      "back": "complete answer",
      "cloze_text": "text with {{{{c1::answer}}}} markers (only for cloze type)",
      "explanation": "why this card matters, mnemonic, clinical pearl",
      "tags": ["tag1", "tag2"],
      "deck": "Step 1::System::Topic",
      "topic": "specific topic",
      "system": "organ system",
      "difficulty": 3,
      "board_relevance": "step1|step2|both|clinical|comlex",
      "source_type": "{source_type}",
      "source_text": "brief quote from source"
    }}
  ],
  "study_guide": {{
    "sections": [
      {{
        "heading": "Core Concept",
        "section_type": "concept",
        "content": ["bullet point 1", "bullet point 2"]
      }},
      {{
        "heading": "Pathophysiology",
        "section_type": "pathophysiology",
        "content": ["bullet point 1", "bullet point 2"]
      }},
      {{
        "heading": "Presentation",
        "section_type": "presentation",
        "content": ["bullet point 1"]
      }},
      {{
        "heading": "Diagnostics",
        "section_type": "diagnostics",
        "content": ["bullet point 1"]
      }},
      {{
        "heading": "Management",
        "section_type": "management",
        "content": ["bullet point 1"]
      }},
      {{
        "heading": "Board Traps",
        "section_type": "traps",
        "content": ["trap 1", "trap 2"]
      }}
    ]
  }}
}}

Generate 3-8 cards. Mix card types. Prioritize mechanisms over memorization."""


async def generate_cards_from_text(
    text: str,
    source_type: str = "other",
    topic: Optional[str] = None,
    system: Optional[str] = None,
) -> dict:
    """
    Call Claude API to generate structured flashcards and study guide from raw text.
    Falls back to a mock response if API key is not configured.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        # Return mock data for development without API key
        return _mock_generation(text, source_type)

    client = anthropic.AsyncAnthropic(api_key=api_key)

    prompt = USER_PROMPT_TEMPLATE.format(
        source_type=source_type,
        text=text[:4000],  # Limit to 4k chars to manage tokens
    )

    message = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = message.content[0].text

    # Extract JSON from response
    json_match = re.search(r'\{[\s\S]*\}', response_text)
    if not json_match:
        raise ValueError("AI did not return valid JSON")

    result = json.loads(json_match.group())
    return result


def _mock_generation(text: str, source_type: str) -> dict:
    """Mock response for development / testing without API key."""
    return {
        "topic": "Medical Concept",
        "system": "General",
        "cards": [
            {
                "card_type": "basic",
                "front": "What is the key mechanism from this content?",
                "back": "Review the source text to extract the primary mechanism.",
                "cloze_text": None,
                "explanation": "Generated from pasted content. Configure ANTHROPIC_API_KEY for real AI generation.",
                "tags": ["review"],
                "deck": "General::Review",
                "topic": "Medical Concept",
                "system": "General",
                "difficulty": 3,
                "board_relevance": "step1",
                "source_type": source_type,
                "source_text": text[:100] + "...",
            }
        ],
        "study_guide": {
            "sections": [
                {
                    "heading": "Core Concept",
                    "section_type": "concept",
                    "content": ["Configure ANTHROPIC_API_KEY to enable AI-powered study guide generation."],
                }
            ]
        },
    }
