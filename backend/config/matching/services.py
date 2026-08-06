import string

STOPWORDS = {
    "the", "a", "an", "to", "for", "of", "and", "or", "my", "your", "his", "her",
    "their", "our", "in", "on", "at", "with", "by", "from", "is", "are", "be",
    "this", "that", "it", "as", "into", "up", "out", "about", "some",
}


def extract_keywords(description: str) -> set[str]:
    lowered = description.lower()
    stripped = lowered.translate(str.maketrans("", "", string.punctuation))
    words = stripped.split()
    return {w for w in words if w not in STOPWORDS}


def keyword_overlap_score(words_a: set[str], words_b: set[str]) -> float:
    if not words_a or not words_b:
        return 0.0
    intersection = words_a & words_b
    union = words_a | words_b
    return len(intersection) / len(union)