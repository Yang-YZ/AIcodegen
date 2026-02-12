import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

issue_title = os.environ["ISSUE_TITLE"]
issue_body = os.environ["ISSUE_BODY"]

prompt = f"""
You are a coding agent.

Project: simple Python app.
Modify app/main.py to implement this feature.

Title: {issue_title}
Description: {issue_body}

Return ONLY valid Python code for app/main.py.
"""

response = client.chat.completions.create(
    model="gpt-5-mini",
    messages=[{"role": "user", "content": prompt}],
)

code = response.choices[0].message.content

os.makedirs("app", exist_ok=True)

with open("app/main.py", "w") as f:
    f.write(code)
