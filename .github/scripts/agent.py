import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

issue_title = os.environ.get("ISSUE_TITLE", "No title")
issue_body = os.environ.get("ISSUE_BODY", "No body")

# Prompt for the LLM
prompt = f"""
You are a coding agent.

Project: simple Python app with tests.
Modify or create app/main.py to implement this feature.

Title: {issue_title}
Description: {issue_body}

Return ONLY valid Python code for app/main.py. Do NOT include explanations.
"""

# Call the LLM
response = client.chat.completions.create(
    model="gpt-5-mini",
    messages=[{"role": "user", "content": prompt}],
)

code = response.choices[0].message.content.strip()

# Ensure app/ folder exists
os.makedirs("app", exist_ok=True)

# Ensure __init__.py exists so app is a package
init_file = os.path.join("app", "__init__.py")
if not os.path.exists(init_file):
    with open(init_file, "w") as f:
        f.write("# init file for app package\n")

# Write code to main.py
with open("app/main.py", "a") as f:
    f.write("\n# AI generated code\n")
    f.write(code)

print("Agent code written to app/main.py")
