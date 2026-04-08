"""
AI Remediation Engine — uses OpenAI to generate fix suggestions.
"""
import os
from openai import AsyncOpenAI
from schemas import RemediationRequest

client = AsyncOpenAI(
    api_key=os.environ.get("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
)

SYSTEM_PROMPT = """You are a senior application security engineer.
Given a web vulnerability, output a unified git diff patch between
===BEGIN_DIFF=== and ===END_DIFF=== markers that provides the minimal,
safe fix. If no code context is available, output a clear code snippet fix instead.
Be concise. Do not explain — only output the fix."""


async def generate_fix(req: RemediationRequest) -> str:
    """Call OpenAI and return the AI-generated fix string."""
    user_message = f"""Vulnerability: {req.issue}
URL: {req.url}
Parameter: {req.param or 'N/A'}
Evidence: {req.evidence or 'N/A'}

Provide a secure code fix."""

    try:
        response = await client.chat.completions.create(
            model="mistralai/mistral-7b-instruct:free",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            max_tokens=512,
            temperature=0.2,
        )
        return response.choices[0].message.content or "No fix generated."
    except Exception as e:
        print(f"OpenAI error: {e}")
        return f"AI fix unavailable: {str(e)}"
