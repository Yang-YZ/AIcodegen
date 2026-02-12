// scripts/coding_pipeline.mjs
// Pipeline that implements AI ideas using coding agents
import fs from "fs";
import { execSync } from "child_process";
import path from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REPO_OWNER = process.env.REPO_OWNER || "Yang-YZ";
const REPO_NAME = process.env.REPO_NAME || "AIcodegen";

// Helper to call OpenAI API
async function callOpenAI(messages, model = "gpt-4o-mini") {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ 
      model, 
      messages,
      temperature: 0.7,
      max_tokens: 4000
    }),
  });
  
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${errText}`);
  }
  
  return resp.json();
}

// Helper to call GitHub API
async function callGitHub(endpoint, options = {}) {
  const url = `https://api.github.com${endpoint}`;
  const resp = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });
  
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`GitHub API error ${resp.status}: ${errText}`);
  }
  
  return resp.json();
}

// Fetch ideas from GitHub issues
async function fetchIssueIdeas() {
  try {
    const issues = await callGitHub(`/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=open&labels=idea`);
    return issues.map(issue => ({
      source: "issue",
      id: issue.number,
      title: issue.title,
      description: issue.body || "",
      url: issue.html_url
    }));
  } catch (err) {
    console.log(`⚠️  Could not fetch issues: ${err.message}`);
    return [];
  }
}

// Parse latest ideas from AI_IDEAS.md
function parseLatestIdeas(count = 3) {
  try {
    const content = fs.readFileSync("AI_IDEAS.md", "utf8");
    const lines = content.split("\n");
    const ideas = [];
    
    let currentIdea = null;
    let collectingDescription = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for idea title (starts with ###)
      if (line.startsWith("### ")) {
        if (currentIdea) {
          ideas.push(currentIdea);
        }
        currentIdea = {
          source: "ai_ideas",
          title: line.replace("### ", "").trim(),
          description: "",
          techStack: ""
        };
        collectingDescription = false;
      } else if (currentIdea) {
        // Collect description
        if (line.includes("**Description:**")) {
          collectingDescription = true;
        } else if (line.includes("**Potential tech stack:**")) {
          collectingDescription = false;
        } else if (collectingDescription && line.trim()) {
          currentIdea.description += line.trim() + " ";
        } else if (!collectingDescription && line.trim() && line.startsWith("-")) {
          currentIdea.techStack += line.trim() + "\n";
        }
      }
    }
    
    if (currentIdea) {
      ideas.push(currentIdea);
    }
    
    return ideas.slice(-count);
  } catch (err) {
    console.log(`⚠️  Could not parse AI_IDEAS.md: ${err.message}`);
    return [];
  }
}

// Generate implementation plan using AI
async function generateImplementationPlan(idea) {
  console.log(`\n🤖 Generating implementation plan for: ${idea.title}`);
  
  const prompt = `You are an expert software architect. Create a detailed implementation plan for this idea:

Title: ${idea.title}
Description: ${idea.description}
${idea.techStack ? `Tech Stack: ${idea.techStack}` : ""}

Generate a JSON object with the following structure:
{
  "projectName": "kebab-case-name",
  "description": "one line description",
  "techStack": ["technology1", "technology2"],
  "phases": [
    {
      "name": "Phase name",
      "description": "What this phase accomplishes",
      "tasks": ["task1", "task2"],
      "testStrategy": "How to test this phase"
    }
  ],
  "fileStructure": {
    "src/": "Main source code",
    "tests/": "Test files"
  }
}

Focus on creating a minimal viable implementation. Keep it simple and achievable.`;

  const response = await callOpenAI([
    { role: "system", content: "You are a helpful software architect. Always respond with valid JSON only." },
    { role: "user", content: prompt }
  ]);
  
  const content = response.choices?.[0]?.message?.content || "{}";
  
  // Try to extract JSON from markdown code blocks if present
  let jsonContent = content;
  const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    jsonContent = codeBlockMatch[1];
  }
  
  return JSON.parse(jsonContent);
}

// Generate code for a specific task
async function generateCode(plan, phase, task, context = "") {
  console.log(`  🔧 Generating code for: ${task}`);
  
  const prompt = `You are an expert developer implementing this project:

Project: ${plan.projectName}
Description: ${plan.description}
Tech Stack: ${plan.techStack.join(", ")}

Current Phase: ${phase.name}
Task: ${task}

${context ? `Context from previous work:\n${context}\n` : ""}

Generate the necessary code files for this task. Return a JSON array of files:
[
  {
    "path": "relative/path/to/file",
    "content": "file content here"
  }
]

Make the code production-ready with proper error handling and comments.`;

  const response = await callOpenAI([
    { role: "system", content: "You are an expert developer. Always respond with valid JSON only." },
    { role: "user", content: prompt }
  ], "gpt-4o");
  
  const content = response.choices?.[0]?.message?.content || "[]";
  
  // Try to extract JSON from markdown code blocks if present
  let jsonContent = content;
  const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    jsonContent = codeBlockMatch[1];
  }
  
  return JSON.parse(jsonContent);
}

// Write files to disk
function writeFiles(files, baseDir) {
  for (const file of files) {
    const fullPath = path.join(baseDir, file.path);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, file.content);
    console.log(`    ✅ Created: ${file.path}`);
  }
}

// Run tests for the implementation
async function runTests(projectDir, testCommand) {
  try {
    console.log(`\n🧪 Running tests: ${testCommand}`);
    const output = execSync(testCommand, {
      cwd: projectDir,
      encoding: "utf8",
      stdio: "pipe"
    });
    console.log(output);
    return { success: true, output };
  } catch (err) {
    console.log(`❌ Tests failed:\n${err.stdout || err.message}`);
    return { success: false, output: err.stdout || err.message };
  }
}

// Create GitHub issue for the implementation
async function createImplementationIssue(idea, plan) {
  try {
    const body = `# Implementation Plan

Generated from: ${idea.source === "issue" ? `Issue #${idea.id}` : "AI_IDEAS.md"}

## Original Idea
${idea.description}

## Project Details
- **Project Name**: ${plan.projectName}
- **Description**: ${plan.description}
- **Tech Stack**: ${plan.techStack.join(", ")}

## Implementation Phases
${plan.phases.map((phase, idx) => `
### Phase ${idx + 1}: ${phase.name}
${phase.description}

**Tasks:**
${phase.tasks.map(task => `- [ ] ${task}`).join("\n")}

**Test Strategy:** ${phase.testStrategy}
`).join("\n")}

---
*This issue was automatically generated by the coding pipeline*
`;

    const issue = await callGitHub(`/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `[Implementation] ${idea.title}`,
        body,
        labels: ["implementation", "automated"]
      })
    });
    
    console.log(`\n✅ Created implementation issue: ${issue.html_url}`);
    return issue;
  } catch (err) {
    console.log(`⚠️  Could not create issue: ${err.message}`);
    return null;
  }
}

// Main pipeline execution
async function executePipeline() {
  console.log("🚀 Starting Coding Pipeline\n");
  
  // Validate environment
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required");
  }
  
  // Step 1: Fetch ideas
  console.log("📥 Step 1: Fetching ideas...");
  const issueIdeas = GITHUB_TOKEN ? await fetchIssueIdeas() : [];
  const fileIdeas = parseLatestIdeas(3);
  const allIdeas = [...issueIdeas, ...fileIdeas];
  
  if (allIdeas.length === 0) {
    console.log("⚠️  No ideas found to implement");
    return;
  }
  
  console.log(`Found ${allIdeas.length} ideas:`);
  allIdeas.forEach((idea, idx) => {
    console.log(`  ${idx + 1}. [${idea.source}] ${idea.title}`);
  });
  
  // Step 2: Select an idea (for now, take the first one)
  const selectedIdea = allIdeas[0];
  console.log(`\n✨ Selected: ${selectedIdea.title}`);
  
  // Step 3: Generate implementation plan
  console.log("\n📋 Step 2: Generating implementation plan...");
  const plan = await generateImplementationPlan(selectedIdea);
  console.log(`\nPlan generated for: ${plan.projectName}`);
  console.log(`Phases: ${plan.phases.length}`);
  plan.phases.forEach((phase, idx) => {
    console.log(`  Phase ${idx + 1}: ${phase.name} (${phase.tasks.length} tasks)`);
  });
  
  // Step 4: Create implementation directory
  const projectDir = path.join(process.cwd(), "implementations", plan.projectName);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
  console.log(`\n📁 Created project directory: ${projectDir}`);
  
  // Step 5: Save plan
  const planPath = path.join(projectDir, "IMPLEMENTATION_PLAN.json");
  fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));
  console.log(`✅ Saved plan to: ${planPath}`);
  
  // Step 6: Create GitHub issue for tracking
  if (GITHUB_TOKEN) {
    await createImplementationIssue(selectedIdea, plan);
  }
  
  // Step 7: Implement each phase
  console.log("\n🔨 Step 3: Starting implementation...");
  let context = "";
  
  for (let phaseIdx = 0; phaseIdx < plan.phases.length; phaseIdx++) {
    const phase = plan.phases[phaseIdx];
    console.log(`\n📦 Phase ${phaseIdx + 1}: ${phase.name}`);
    
    for (const task of phase.tasks) {
      const files = await generateCode(plan, phase, task, context);
      writeFiles(files, projectDir);
      
      // Update context with what was implemented
      context += `\nCompleted: ${task}\nFiles: ${files.map(f => f.path).join(", ")}\n`;
    }
    
    console.log(`  ✅ Phase ${phaseIdx + 1} complete`);
  }
  
  // Step 8: Generate README
  console.log("\n📝 Generating README...");
  const readmeContent = `# ${plan.projectName}

${plan.description}

## Tech Stack
${plan.techStack.map(tech => `- ${tech}`).join("\n")}

## Project Structure
${Object.entries(plan.fileStructure).map(([dir, desc]) => `- **${dir}**: ${desc}`).join("\n")}

## Implementation
This project was automatically generated by the AIcodegen pipeline.

### Original Idea
${selectedIdea.title}

${selectedIdea.description}

## Setup
\`\`\`bash
# Add setup instructions here
\`\`\`

## Usage
\`\`\`bash
# Add usage instructions here
\`\`\`

## Testing
\`\`\`bash
# Add test instructions here
\`\`\`

---
*Generated by AIcodegen pipeline on ${new Date().toISOString()}*
`;
  
  fs.writeFileSync(path.join(projectDir, "README.md"), readmeContent);
  console.log(`✅ Created README.md`);
  
  // Step 9: Summary
  console.log("\n🎉 Pipeline execution complete!");
  console.log(`\nProject: ${plan.projectName}`);
  console.log(`Location: ${projectDir}`);
  console.log(`\nNext steps:`);
  console.log(`1. Review the generated code in ${projectDir}`);
  console.log(`2. Run tests if applicable`);
  console.log(`3. Make any necessary adjustments`);
  console.log(`4. Create a PR to merge the implementation`);
  
  return {
    success: true,
    projectName: plan.projectName,
    projectDir,
    plan
  };
}

// Run the pipeline
if (import.meta.url === `file://${process.argv[1]}`) {
  executePipeline()
    .then(result => {
      if (result) {
        console.log("\n✅ Pipeline completed successfully");
        process.exit(0);
      }
    })
    .catch(err => {
      console.error("\n❌ Pipeline failed:", err.message);
      console.error(err.stack);
      process.exit(1);
    });
}

export { executePipeline, generateImplementationPlan, generateCode };
