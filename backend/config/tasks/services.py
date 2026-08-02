import json
import os
from dotenv import load_dotenv
from google import genai


load_dotenv()
gemini_client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))


class SubtaskGenerationError(Exception):
    pass


def build_generation_prompt(description: str) -> str:
    return (
        f"""You are a task-breakdown assistant for a productivity app used by neurodivergent users (ADHD, autism, executive-function challenges).

        Given a task description, break it into a clear, ordered sequence of 3 to 7 small, concrete subtasks. Each subtask should be a single actionable step — small enough to complete in one sitting without feeling overwhelming.

        For each subtask, assign a point value from 1 to 10 based on:
        - How much effort, time, or executive-function friction it involves
        - The FIRST subtask in the sequence should get a slightly higher point value than its apparent difficulty alone would suggest, since starting a task is often the hardest part for these users

        Task description:
        "{description}"

        Respond with ONLY valid JSON, no explanation, no markdown code fences, no extra text. Use exactly this shape:

        [
        {{"description": "string", "points": integer}},
        {{"description": "string", "points": integer}}
        ]"""
    )


def generate_subtasks(description: str) -> list[dict]:
    prompt = build_generation_prompt(description)
    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
    except Exception as e:
        raise SubtaskGenerationError(f"Gemini API error: {str(e)}") from e

    raw = response.text.strip()

    try:
        start = raw.index('[')
        end = raw.rindex(']') + 1
        raw = raw[start:end]
        tagged = json.loads(raw)
    except Exception as e:
        raise SubtaskGenerationError(f"Failed to parse Gemini response: {raw}") from e

    if not isinstance(tagged, list) or not tagged:
        raise SubtaskGenerationError(f"Expected a non-empty list, got: {raw}")

    for item in tagged:
        if not isinstance(item, dict) or 'description' not in item or 'points' not in item:
            raise SubtaskGenerationError(f"Malformed subtask item: {item}")
        if not isinstance(item['points'], int):
            raise SubtaskGenerationError(f"Non-integer points value: {item}")
        item['points'] = max(1, min(10, item['points']))

    return tagged