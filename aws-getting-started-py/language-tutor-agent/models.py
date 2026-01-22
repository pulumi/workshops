"""Pydantic models for structured output."""

from __future__ import annotations

from pydantic import BaseModel, Field


class VocabularyItem(BaseModel):
    """A single vocabulary word with its details."""

    word: str = Field(description="The vocabulary word in the target language")
    transliteration: str = Field(description="Phonetic pronunciation guide")
    meaning: str = Field(description="English translation/meaning")
    usage: str = Field(description="How the word was used in the story")


class StoryOutput(BaseModel):
    """Structured output for a language learning story."""

    title: str = Field(description="Title of the story in the target language")
    title_translation: str = Field(description="English translation of the title")
    story: str = Field(description="The complete story in the target language")
    translation: str = Field(description="English translation of the story")
    vocabulary: list[VocabularyItem] = Field(
        description="List of vocabulary words used in the story with details"
    )
    questions: list[str] = Field(
        description="2-3 comprehension questions about the story (in target language with English)"
    )
    grammar_tip: str = Field(
        description="A grammar tip relevant to the language level"
    )
    encouragement: str = Field(
        description="A brief encouraging message for the learner"
    )
