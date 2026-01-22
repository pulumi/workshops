"""Language Tutor Tools - Story generation for vocabulary practice."""

from __future__ import annotations

from typing import TypedDict

from strands import tool

# CEFR levels
VALID_LEVELS = frozenset({"A1", "A2", "B1", "B2", "C1", "C2"})
DEFAULT_LEVEL = "B1"


class LevelGuide(TypedDict):
    """Type definition for level complexity guidelines."""

    sentences: str
    vocabulary: str
    tenses: str
    length: str


# Story complexity guidelines based on CEFR level (module-level constant)
COMPLEXITY_GUIDE: dict[str, LevelGuide] = {
    "A1": {
        "sentences": "very short and simple",
        "vocabulary": "basic, everyday words",
        "tenses": "present tense only",
        "length": "50-100 words",
    },
    "A2": {
        "sentences": "short and clear",
        "vocabulary": "common, familiar words",
        "tenses": "present, simple past, simple future",
        "length": "100-150 words",
    },
    "B1": {
        "sentences": "compound sentences with connectors",
        "vocabulary": "varied, some less common words",
        "tenses": "all simple tenses, present perfect",
        "length": "150-250 words",
    },
    "B2": {
        "sentences": "complex sentences with subordinate clauses",
        "vocabulary": "idiomatic expressions, phrasal verbs",
        "tenses": "all tenses including conditionals",
        "length": "250-350 words",
    },
    "C1": {
        "sentences": "sophisticated structures, varied syntax",
        "vocabulary": "nuanced, precise, some rare words",
        "tenses": "full range with subtle distinctions",
        "length": "350-450 words",
    },
    "C2": {
        "sentences": "native-like complexity and elegance",
        "vocabulary": "literary, technical, culturally rich",
        "tenses": "masterful use of all forms",
        "length": "450-600 words",
    },
}


@tool
def generate_story(
    words: str,
    language: str,
    level: str = DEFAULT_LEVEL,
) -> dict:
    """Generate a story incorporating the provided vocabulary words.

    This tool creates an educational story that naturally incorporates
    the given vocabulary words, helping learners see the words used
    in context.

    Args:
        words: Comma-separated list of vocabulary words to include in the story
            (e.g., "cat, house, sleep, happy")
        language: Target language for the story (e.g., "Spanish", "French", "German", "English")
        level: CEFR language proficiency level from A1 to C2:
            - A1: Beginner (very simple sentences)
            - A2: Elementary (simple past/future)
            - B1: Intermediate (compound sentences)
            - B2: Upper-Intermediate (complex structures)
            - C1: Advanced (sophisticated language)
            - C2: Mastery (native-like fluency)
            Defaults to B1 if not specified.

    Returns:
        Dictionary containing the story parameters for the LLM to generate
        the actual story content.
    """
    # Parse and clean the word list
    word_list = [w.strip() for w in words.split(",") if w.strip()]

    # Validate and normalize level
    normalized_level = level.upper()
    if normalized_level not in VALID_LEVELS:
        normalized_level = DEFAULT_LEVEL

    guide = COMPLEXITY_GUIDE[normalized_level]

    return {
        "status": "ready",
        "words": word_list,
        "word_count": len(word_list),
        "language": language,
        "level": normalized_level,
        "guidelines": guide,
        "instruction": f"""Please generate a {language} story at {normalized_level} level that \
naturally incorporates ALL of these vocabulary words: {', '.join(word_list)}.

Story requirements:
- Language: {language}
- Proficiency Level: {normalized_level}
- Sentence complexity: {guide['sentences']}
- Vocabulary style: {guide['vocabulary']}
- Tenses to use: {guide['tenses']}
- Target length: {guide['length']}

After the story, provide:
1. A vocabulary review showing how each word was used
2. 2-3 comprehension questions about the story
3. One grammar tip relevant to the level""",
    }
