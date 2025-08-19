// scripts/ai_ideas.mjs
import fs from "fs";
import {execSync} from "child_process";

const IDEA_COUNT = parseInt(process.env.IDEA_COUNT || "3", 10);

async function callOpenAI(messages, model = "gpt-4.1-mini") {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model, messages }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${errText}`);
  }
  return resp.json();
}

async function fetchHotTopics(limit = 10) {
  try {
    const res = await fetch(
      "https://hn.algolia.com/api/v1/search?tags=front_page",
      { headers: { "Content-Type": "application/json" } }
    );
    const json = await res.json();
    const titles = Array.isArray(json?.hits)
      ? json.hits.map(h => h?.title).filter(Boolean)
      : [];
    return titles.slice(0, limit);
  } catch {
    return [];
  }
}

function readHistory(filePath = "data/idea_titles.json") {
  try {
    if (!fs.existsSync(filePath)) return [];
    const txt = fs.readFileSync(filePath, "utf8");
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr.filter(t => typeof t === "string") : [];
  } catch {
    return [];
  }
}

function writeHistory(titles, filePath = "data/idea_titles.json") {
  const dir = filePath.substring(0, filePath.lastIndexOf("/")) || "data";
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(titles, null, 2));
}

function mergeTitles(existing, incoming, maxSize = 1000) {
  const seen = new Set(existing.map(t => t.trim().toLowerCase()));
  const result = [...existing];
  for (const t of incoming) {
    const key = t.trim().toLowerCase();
    if (!seen.has(key) && key) {
      result.push(t.trim());
      seen.add(key);
    }
  }
  return result.slice(-maxSize);
}

async function extractIdeaTitles(markdown) {
  const messages = [
    {
      role: "system",
      content:
        "You extract idea names from markdown. Return ONLY a compact JSON array of strings. No comments or markdown.",
    },
    {
      role: "user",
      content: `Extract only the idea names (titles) from this markdown and return a JSON array of strings.\n\n${markdown}`,
    },
  ];
  const data = await callOpenAI(messages);
  const text = data.choices?.[0]?.message?.content?.trim() || "[]";
  try {
    const arr = JSON.parse(text);
    return Array.isArray(arr) ? arr.filter(t => typeof t === "string") : [];
  } catch {
    // Heuristic fallback: try to parse largest JSON slice
    const first = text.indexOf("[");
    const last = text.lastIndexOf("]");
    if (first !== -1 && last > first) {
      try {
        const arr = JSON.parse(text.slice(first, last + 1));
        return Array.isArray(arr) ? arr.filter(t => typeof t === "string") : [];
      } catch {}
    }
    return [];
  }
}

function buildPrompt({ hotTopics, historyTitles }) {
  const hotLine = hotTopics.length
    ? `Focus on today's hot topics as inspiration only: ${hotTopics.join("; ")}. Do NOT simply repeat or repackage these; identify gaps, underserved users, or adjacent problems and propose novel directions.`
    : "";
  const avoidLine = historyTitles.length
    ? `Do not repeat any of these past idea names: ${historyTitles.slice(-50).join("; ")}.`
    : "";
  return `Generate ${IDEA_COUNT} new AI application ideas. ${hotLine}\n${avoidLine}\nFor each, include:\n- Idea name\n- Description (explain why it's different from existing popular approaches)\n- Potential tech stack\n\nFormat as markdown.`;
}

(async () => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Load context
    const [hotTopics, history] = await Promise.all([
      fetchHotTopics(10),
      (async () => readHistory())(),
    ]);

    // Print hot topics
    if (hotTopics.length) {
      console.log("🔥 Hot topics:");
      hotTopics.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
    } else {
      console.log("No hot topics found.");
    }

    // Create prompt
    const prompt = buildPrompt({ hotTopics, historyTitles: history });

    // Generate ideas
    console.log("🔹 Fetching AI ideas...");
    const data = await callOpenAI([{ role: "user", content: prompt }]);
    const ideasMd = data.choices?.[0]?.message?.content || "";

    // Append to AI_IDEAS.md with timestamp header
    const ts = new Date().toISOString().slice(0, 10);
    const block = `\n\n## ${ts}\n\n${ideasMd}\n`;
    if (fs.existsSync("AI_IDEAS.md")) {
      fs.appendFileSync("AI_IDEAS.md", block);
    } else {
      fs.writeFileSync("AI_IDEAS.md", `# AI Ideas\n${block}`);
    }
    console.log("✅ Updated AI_IDEAS.md");

    // Extract titles and update history
    console.log("🔹 Updating idea history...");
    const newTitles = await extractIdeaTitles(ideasMd);
    const merged = mergeTitles(history, newTitles);
    writeHistory(merged);
    console.log(`✅ Updated data/idea_titles.json with ${newTitles.length} new titles`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})(); 