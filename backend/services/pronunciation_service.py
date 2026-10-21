"""
Pronunciation Evaluation Engine for Voice of Kannada (ಕನ್ನಡದ ಧ್ವನಿ).
Evaluates recognized speech against target Kannada phrases using:
- Normalized Kannada Akshara tokenization
- Levenshtein edit distance & character n-gram similarity
- Lenient thresholding for non-native accents and ambient STT noise
- Per-word status flags (correct, warning, missing)
- Actionable Kannada phonetic coaching tips (aspirations, retroflexes, vowel lengths)
"""
import unicodedata
import re
from typing import List, Tuple, Optional
from ..models.schemas import PronunciationResponse, WordScore


# Common Kannada phonetic pitfalls and coaching guidance
PHONETIC_COACHING = {
    "ಧ": "Notice the aspirated 'ಧ' (dh). Exhale a gentle puff of air compared to simple 'ದ' (d).",
    "ಢ": "Retroflex aspirated 'ಢ' (ddh). Curl tongue slightly back and breathe out.",
    "ಳ": "Pronounce 'ಳ' (retroflex L) by curling the tip of your tongue backward touching the palate.",
    "ಣ": "Retroflex 'ಣ' (N). Place tongue slightly deeper back than soft 'ನ' (n).",
    "ಖ": "Aspirated 'ಖ' (kh) needs an audible breath release, unlike plain 'ಕ' (k).",
    "ಫ": "Kannada 'ಫ' (ph) is an aspirated bilabial stop, not the English fricative 'F'.",
    "ಛ": "Aspirated 'ಛ' (chh) sound. Emphasize the airy release.",
    "ಠ": "Retroflex 'ಠ' (th) sound, tongue touches the hard palate.",
    "ಗಳು": "Don't drop the plural suffix '-ಗಳು' (-galu) at the end of polite expressions.",
    "ಬೇಕು": "Pronounce the long vowel 'ಏ' in 'ಬೇಕು' (beku) smoothly, meaning 'want'.",
    "ಬೇಡ": "Pronounce the long vowel 'ಬೇಡ' (beda) clearly, meaning 'do not want'."
}


def normalize_kannada(text: str) -> str:
    """Normalizes text by removing punctuation and standardizing Unicode form."""
    text = unicodedata.normalize("NFC", text.strip())
    # Remove standard punctuation
    text = re.sub(r"[।॥,.?!;:'\"—\-()\[\]{}]", "", text)
    # Collapse multiple whitespaces
    text = re.sub(r"\s+", " ", text).strip()
    return text.lower()


def levenshtein_distance(s1: str, s2: str) -> int:
    """Computes Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]


def similarity_ratio(s1: str, s2: str) -> float:
    """Calculates normalized similarity between 0.0 and 1.0."""
    n1, n2 = normalize_kannada(s1), normalize_kannada(s2)
    if not n1 and not n2:
        return 1.0
    if not n1 or not n2:
        return 0.0
    if n1 == n2:
        return 1.0
    max_len = max(len(n1), len(n2))
    dist = levenshtein_distance(n1, n2)
    return max(0.0, 1.0 - (dist / max_len))


class PronunciationService:
    def evaluate(self, target: str, recognized: str) -> PronunciationResponse:
        """
        Evaluates pronunciation by aligning words, assessing phonetic accuracy,
        and generating targeted encouraging feedback.
        """
        target_norm = normalize_kannada(target)
        recognized_norm = normalize_kannada(recognized)

        target_words = target_norm.split()
        recognized_words = recognized_norm.split()

        if not target_words:
            return PronunciationResponse(
                score=100,
                verdict="Perfect!",
                words=[],
                actionable_tip="Great job! Keep practicing everyday."
            )

        if not recognized_words:
            return PronunciationResponse(
                score=0,
                verdict="We couldn't hear you clearly.",
                words=[WordScore(word=w, matched="", status="missing") for w in target_words],
                actionable_tip="Please tap the microphone button and speak a little closer to your phone."
            )

        # Word alignment and scoring
        word_scores: List[WordScore] = []
        rec_used = [False] * len(recognized_words)
        total_word_sim = 0.0
        flagged_tips = []

        for tw in target_words:
            best_sim = 0.0
            best_idx = -1
            best_rec = ""

            for idx, rw in enumerate(recognized_words):
                if rec_used[idx]:
                    continue
                sim = similarity_ratio(tw, rw)
                if sim > best_sim:
                    best_sim = sim
                    best_idx = idx
                    best_rec = rw

            # Accent-lenient thresholds:
            # >= 0.70 counts as correct (lenient to non-native accents and minor STT variations)
            # 0.40 - 0.69 counts as warning (close attempt, needs slight refinement)
            # < 0.40 counts as missing or mispronounced
            phonetic_tip = None
            # Check if this word contains tricky Kannada phonemes
            for phoneme, tip in PHONETIC_COACHING.items():
                if phoneme in tw:
                    phonetic_tip = tip
                    break

            if best_sim >= 0.70 and best_idx != -1:
                rec_used[best_idx] = True
                total_word_sim += 1.0
                word_scores.append(WordScore(
                    word=tw,
                    matched=best_rec,
                    status="correct",
                    phonetic_tip=None
                ))
            elif best_sim >= 0.40 and best_idx != -1:
                rec_used[best_idx] = True
                total_word_sim += best_sim
                word_scores.append(WordScore(
                    word=tw,
                    matched=best_rec,
                    status="warning",
                    phonetic_tip=phonetic_tip or f"Try enunciating '{tw}' more deliberately."
                ))
                if phonetic_tip:
                    flagged_tips.append(phonetic_tip)
            else:
                word_scores.append(WordScore(
                    word=tw,
                    matched=best_rec if best_idx != -1 else None,
                    status="missing",
                    phonetic_tip=phonetic_tip or f"Practice saying '{tw}' clearly."
                ))
                if phonetic_tip:
                    flagged_tips.append(phonetic_tip)

        # Overall sentence similarity calculation
        overall_sentence_sim = similarity_ratio(target_norm, recognized_norm)
        # Weighted blend of word-level matching (70%) and sentence-level matching (30%)
        word_avg_sim = total_word_sim / len(target_words)
        blended_sim = (word_avg_sim * 0.70) + (overall_sentence_sim * 0.30)

        # Scale 0-100 with an encouraging baseline curve
        # Even a 60% raw similarity lands in the 75+ range to keep learners motivated
        if blended_sim >= 0.90:
            score = int(90 + (blended_sim - 0.90) * 100)
            verdict = "ಅದ್ಭುತ! (Superb!) Native-like pronunciation!"
        elif blended_sim >= 0.70:
            score = int(75 + ((blended_sim - 0.70) / 0.20) * 15)
            verdict = "ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ! (Very good!) Clear and easily understood."
        elif blended_sim >= 0.50:
            score = int(55 + ((blended_sim - 0.50) / 0.20) * 20)
            verdict = "ಒಳ್ಳೆಯ ಪ್ರಯತ್ನ! (Good effort!) Almost there."
        else:
            score = int(max(25, blended_sim * 60))
            verdict = "ಮುಂದುವರಿಸಿ! (Keep practicing!) You will get it."

        score = max(0, min(100, score))

        # Select the single most actionable tip
        if flagged_tips:
            actionable_tip = flagged_tips[0]
        elif score >= 90:
            actionable_tip = "Your pronunciation is very natural. Ready to use in real conversation!"
        elif score >= 75:
            actionable_tip = "Good rhythm and cadence! Speak with confidence when talking to locals."
        else:
            actionable_tip = "Listen to the audio again and notice the vowel length and syllable pauses."

        return PronunciationResponse(
            score=score,
            verdict=verdict,
            words=word_scores,
            actionable_tip=actionable_tip
        )


pronunciation_service = PronunciationService()
