import os
import re
import subprocess
import sys
from typing import Optional

from openai import OpenAI


def _build_client() -> OpenAI:
    provider = os.getenv("AGENT_PROVIDER", "codex").lower()
    api_key = os.getenv("AGENT_API_KEY") or os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError("Missing API key. Set AGENT_API_KEY or OPENAI_API_KEY.")

    if provider in {"codex", "openai", "openai_compatible"}:
        base_url = os.getenv("AGENT_BASE_URL")
        if base_url:
            return OpenAI(api_key=api_key, base_url=base_url)
        return OpenAI(api_key=api_key)

    raise RuntimeError(
        f"Unsupported AGENT_PROVIDER='{provider}'. "
        "Use one of: codex, openai, openai_compatible."
    )


def _extract_diff(response_text: str) -> str:
    fenced = re.search(r"```(?:diff)?\n(.*?)```", response_text, flags=re.DOTALL)
    if fenced:
        return fenced.group(1).strip()
    return response_text.strip()


def _apply_patch(diff_text: str) -> None:
    if not diff_text:
        raise RuntimeError("Agent returned an empty patch.")

    process = subprocess.run(
        ["git", "apply", "--index", "--whitespace=fix", "-"],
        input=diff_text,
        text=True,
        capture_output=True,
    )
    if process.returncode != 0:
        with open("agent_response.diff", "w", encoding="utf-8") as file:
            file.write(diff_text)
        raise RuntimeError(
            "Failed to apply generated patch. "
            f"git apply error:\n{process.stderr}\n"
            "Raw response saved to agent_response.diff"
        )


def _issue_prompt(issue_title: str, issue_body: str) -> str:
    return f"""
You are an autonomous coding agent operating inside a git repository.

Task source:
Issue title: {issue_title}
Issue body:
{issue_body}

Rules:
1) Return ONLY a valid unified git diff patch.
2) The patch must include all file edits needed for implementation.
3) Do not include explanations or markdown outside patch fences.
4) Keep changes focused and runnable.
5) Prefer minimal, testable edits.

Goal:
Implement the feature/fix described in the issue.
Also ensure test automation supports both unit and integration tests.
""".strip()


def run() -> None:
    issue_title = os.getenv("ISSUE_TITLE", "")
    issue_body = os.getenv("ISSUE_BODY", "")
    model = os.getenv("AGENT_MODEL", "gpt-5-mini")

    if not issue_title and not issue_body:
        raise RuntimeError("Issue context is empty; expected ISSUE_TITLE and/or ISSUE_BODY.")

    client = _build_client()
    prompt = _issue_prompt(issue_title, issue_body)

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    content: Optional[str] = response.choices[0].message.content
    if not content:
        raise RuntimeError("Agent returned no content.")

    diff = _extract_diff(content)
    _apply_patch(diff)
    print("Patch applied successfully.")


if __name__ == "__main__":
    try:
        run()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
