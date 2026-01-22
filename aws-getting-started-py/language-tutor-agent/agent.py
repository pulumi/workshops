"""Language Tutor Agent using Strands SDK.

An AI-powered language tutor that generates stories using vocabulary words
to help learners practice in context.
"""

from __future__ import annotations

import logging
import os
import sys

from strands import Agent
from strands.models import BedrockModel
from strands.types.exceptions import StructuredOutputException

from models import StoryOutput
from tools import generate_story

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Configuration
MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "us.anthropic.claude-opus-4-5-20251101-v1:0")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

SYSTEM_PROMPT = """You are an expert language tutor specializing in vocabulary
acquisition through storytelling. Your goal is to help language learners practice
new vocabulary by creating engaging, contextual stories.

When a user provides vocabulary words:
1. Use the generate_story tool to get the story parameters
2. Create a story incorporating ALL the provided words
3. The story should be appropriate for the specified language level (A1-C2)

Language Levels Guide:
- A1 (Beginner): Very simple sentences, basic vocabulary, present tense only
- A2 (Elementary): Simple sentences, common vocabulary, past and future tenses
- B1 (Intermediate): Compound sentences, varied vocabulary, multiple tenses
- B2 (Upper-Intermediate): Complex sentences, idiomatic expressions, all tenses
- C1 (Advanced): Sophisticated language, nuanced vocabulary, literary devices
- C2 (Mastery): Native-like fluency, rare vocabulary, complex literary styles

Always provide:
- A story title in the target language with English translation
- The story in the target language
- English translation of the story
- Vocabulary review for each word (with transliteration, meaning, usage)
- 2-3 comprehension questions
- A relevant grammar tip
- An encouraging message

Be supportive and encouraging of the learner's progress!"""


def create_agent() -> Agent:
    """Create and configure the Language Tutor agent.

    Returns:
        Configured Strands Agent instance with Bedrock model.
    """
    logger.info("Creating agent with model: %s in region: %s", MODEL_ID, AWS_REGION)

    model = BedrockModel(
        model_id=MODEL_ID,
        region_name=AWS_REGION,
        streaming=False,  # Structured output requires non-streaming
    )

    return Agent(
        model=model,
        tools=[generate_story],
        system_prompt=SYSTEM_PROMPT,
    )


def format_story_output(story: StoryOutput) -> str:
    """Format the structured story output for display.

    Args:
        story: The structured story output from the agent.

    Returns:
        Formatted string for display.
    """
    lines = [
        f"# {story.title}",
        f"*({story.title_translation})*",
        "",
        "## Story",
        story.story,
        "",
        "## Translation",
        f"*{story.translation}*",
        "",
        "## Vocabulary Review",
        "",
        "| Word | Pronunciation | Meaning | Usage |",
        "|------|---------------|---------|-------|",
    ]

    for vocab in story.vocabulary:
        lines.append(
            f"| **{vocab.word}** | {vocab.transliteration} | {vocab.meaning} | {vocab.usage} |"
        )

    lines.extend([
        "",
        "## Comprehension Questions",
    ])

    for i, question in enumerate(story.questions, 1):
        lines.append(f"{i}. {question}")

    lines.extend([
        "",
        "## Grammar Tip",
        story.grammar_tip,
        "",
        "---",
        f"*{story.encouragement}*",
    ])

    return "\n".join(lines)


def print_banner() -> None:
    """Print the welcome banner."""
    print("=" * 60)
    print("  Language Tutor Agent")
    print("  Powered by Strands SDK + Amazon Bedrock")
    print("  (Structured Output Mode)")
    print("=" * 60)
    print()
    print("Commands:")
    print("  /story <words> - Generate a story (comma-separated words)")
    print("  /help          - Show this help message")
    print("  /quit          - Exit the tutor")
    print()
    print("Or just chat naturally! Example:")
    print('  "Create a Spanish story using: gato, casa, dormir"')
    print()


def print_help() -> None:
    """Print usage examples."""
    print("\nUsage Examples:")
    print('  "Generate a B1 French story with: maison, manger, heureux"')
    print('  "Create an A2 German story using these words: Hund, spielen, Park"')
    print('  "Write a C1 English story incorporating: ephemeral, serendipity, melancholy"')
    print()


def interactive_shell() -> None:
    """Run an interactive shell for testing the Language Tutor."""
    agent = create_agent()
    print_banner()

    while True:
        try:
            user_input = input("You: ").strip()
        except EOFError:
            print("\nGoodbye! Keep practicing!")
            break
        except KeyboardInterrupt:
            print("\nGoodbye! Keep practicing!")
            break

        if not user_input:
            continue

        if user_input.lower() in {"/quit", "/exit", "quit", "exit"}:
            print("Goodbye! Keep practicing!")
            break

        if user_input.lower() == "/help":
            print_help()
            continue

        if user_input.startswith("/story "):
            words = user_input[7:].strip()
            user_input = f"Generate a story using these words: {words}"

        print("\nGenerating story...")
        try:
            result = agent(user_input, structured_output_model=StoryOutput)

            if result.structured_output:
                formatted = format_story_output(result.structured_output)
                print(f"\n{formatted}\n")
            else:
                # Fallback to raw message if structured output not available
                print(f"\nTutor: {result.message}\n")

        except StructuredOutputException as e:
            logger.warning("Structured output failed: %s", e)
            print(f"\nTutor: {e}\n")
        except Exception:
            logger.exception("Error processing request")
            print("\nSorry, an error occurred. Please try again.\n")


def main() -> None:
    """Main entry point."""
    interactive_shell()


if __name__ == "__main__":
    sys.exit(main() or 0)
