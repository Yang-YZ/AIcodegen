// scripts/ai_ideas.js
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
    console.log("🔹 Fetching AI ideas...");
    const ideas = await callOpenAI(prompt);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `AI_IDEAS_${timestamp}.md`;
    fs.writeFileSync(filename, ideas);
    console.log(`✅ Wrote ${filename}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
