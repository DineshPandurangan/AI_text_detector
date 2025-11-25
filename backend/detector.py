import torch
from transformers import GPT2Tokenizer, GPT2LMHeadModel
import numpy as np
import re
from typing import List, Dict

class AIDetector:
    def __init__(self):
        self.tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
        self.model = GPT2LMHeadModel.from_pretrained("gpt2")
        self.model.eval()

    def perplexity(self, text: str) -> float:
        if not text.strip():
            return 1000
        encodings = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=1024)
        with torch.no_grad():
            loss = self.model(encodings.input_ids, labels=encodings.input_ids).loss
        return float(torch.exp(loss))

    def burstiness(self, sentences: List[str]) -> float:
        lengths = [len(s.split()) for s in sentences if len(s.split()) > 3]
        if len(lengths) < 2:
            return 0
        return np.var(lengths) / (np.mean(lengths) + 1e-6)

    def analyze_sentence(self, sentence: str) -> float:
        if len(sentence) < 20:
            return 50  # neutral

        ppl = self.perplexity(sentence)
        # AI text usually has perplexity < 60, humans > 100
        score = max(0, min(100, (80 - ppl) * 2))  # invert and scale
        return round(score, 2)

    def detect(self, text: str) -> Dict:
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]

        if not sentences:
            return {"error": "Not enough text"}

        results = []
        total_ai_score = 0

        for i, sent in enumerate(sentences):
            ai_score = self.analyze_sentence(sent)
            total_ai_score += ai_score
            results.append({
                "id": i,
                "text": sent,
                "ai_score": ai_score,
                "human_score": round(100 - ai_score, 2)
            })

        avg_ai = total_ai_score / len(sentences) if sentences else 0

        return {
            "overall_ai_probability": round(avg_ai, 2),
            "overall_human_probability": round(100 - avg_ai, 2),
            "sentence_analysis": results,
            "total_sentences": len(sentences)
        }