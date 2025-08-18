// scripts/ai_ideas.mjs
import fs from "fs";

const prompt = `
Generate 3 new AI application ideas.
For each, include:
- Idea name
- Description
- Potential tech stack

Format as markdown.
`;

async function callOpenAI(prompt) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

(async () => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    console.log("🔹 Fetching AI ideas...");
    const ideas = await callOpenAI(prompt);
    fs.writeFileSync("AI_IDEAS.md", ideas);
    console.log("✅ Wrote AI_IDEAS.md");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})(); 