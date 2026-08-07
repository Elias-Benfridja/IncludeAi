from django.utils import timezone
import json
import os
from dotenv import load_dotenv
from google import genai


load_dotenv()
gemini_client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))


class SubtaskGenerationError(Exception):
    pass

class RewardRecommendationError(Exception):
    pass



def build_generation_prompt(description: str, min_items: int = 3, max_items: int = 7) -> str:
    return (
        f"""You are a task-breakdown assistant for a productivity app used by neurodivergent users (ADHD, autism, executive-function challenges).

        Given a task description, break it into a clear, ordered sequence of {min_items} to {max_items} small, concrete subtasks. Each subtask should be a single actionable step — small enough to complete in one sitting without feeling overwhelming.

        If the task naturally consists of multiple similar parts (e.g. multiple paragraphs, questions, sections, chapters, rooms, items), create one subtask per part instead of combining them into a single generic step. Do not compress the bulk of the actual work into one undifferentiated "do the task" step while only breaking out the surrounding setup and wrap-up.

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


def generate_subtasks(description: str, min_items: int = 3, max_items: int = 7) -> list[dict]:
    prompt = build_generation_prompt(description, min_items, max_items)
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


def redistribute_points(items: list[dict], total_points: int) -> list[dict]:
    """Rescale each item's points so the whole list sums to exactly total_points,
    keeping every item at 1 point minimum. Used when splitting a subtask, so the
    split pieces never award more total points than the original subtask did."""
    n = len(items)
    total_points = max(total_points, n)  # can't give fewer than 1 pt per item
    weight_sum = sum(item['points'] for item in items) or n

    result = []
    running = 0
    for i, item in enumerate(items):
        if i == n - 1:
            pts = total_points - running  # remainder goes to the last item
        else:
            pts = max(1, round(item['points'] / weight_sum * total_points))
            running += pts
        result.append({**item, 'points': max(1, pts)})
    return result



def build_recommendation_prompt(name: str, avg_subtask_points: float, existing_prices: list[int]) -> str:
    prices_text = ", ".join(str(p) for p in existing_prices) if existing_prices else "none yet"
    return (
        f"""You are helping set a point cost for a personal reward in a task app's token economy, used by neurodivergent users to motivate themselves.

        This user typically earns about {avg_subtask_points:.1f} points per completed subtask.
        Their existing rewards cost these amounts: {prices_text}.

        Suggest a fair point cost for a new reward called "{name}". Consider how small/quick vs. indulgent/significant this reward sounds compared to a typical small treat, and stay roughly consistent with their existing reward prices if any exist.

        Respond with ONLY a single integer, nothing else — no words, no units, no explanation."""
    )


def recommend_reward_points(name: str, avg_subtask_points: float, existing_prices: list[int]) -> int:
    prompt = build_recommendation_prompt(name, avg_subtask_points, existing_prices)
    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
    except Exception as e:
        raise RewardRecommendationError(f"Gemini API error: {str(e)}") from e

    raw = response.text.strip()
    try:
        points = int(''.join(ch for ch in raw if ch.isdigit()))
    except ValueError as e:
        raise RewardRecommendationError(f"Couldn't parse a number from: {raw}") from e

    return max(1, min(1000, points))

def _bank_elapsed_time(task):
    """If the timer is currently running, fold the time since it started
    into the accumulated total, and stop it from running. Safe to call
    even if the timer isn't running — does nothing in that case."""
    if task.timer_started_at is not None:
        elapsed = timezone.now() - task.timer_started_at
        task.timer_elapsed_seconds += int(elapsed.total_seconds())
        task.timer_started_at = None