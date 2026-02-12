# Example Usage Guide

This guide demonstrates how to use the AI Coding Pipeline with real examples.

## Example 1: Running the Full Pipeline Locally

### Prerequisites
```bash
# Set up environment variables
export OPENAI_API_KEY="sk-..."
export GITHUB_TOKEN="ghp_..."
```

### Step 1: Generate Fresh Ideas
```bash
cd /home/runner/work/AIcodegen/AIcodegen
node scripts/ai_ideas.mjs
```

**Output:**
```
🔥 Hot topics:
  1. New AI model releases
  2. Privacy concerns in mobile apps
  3. Video conferencing innovations
🔹 Fetching AI ideas...
✅ Updated AI_IDEAS.md
✅ Updated data/idea_titles.json with 3 new titles
```

### Step 2: Check Generated Ideas
```bash
tail -50 AI_IDEAS.md
```

**You'll see something like:**
```markdown
## 2026-02-12

### PrivacyGuardian: AI-Powered Real-Time Personal Data Leak Detector

**Description:** Monitors mobile apps for data leaks...

**Potential tech stack:**
- Kotlin/Swift for mobile monitoring
- TensorFlow Lite for on-device ML
- Python FastAPI for backend
```

### Step 3: Run the Coding Pipeline
```bash
node scripts/pipeline_cli.mjs run
```

**Output:**
```
🚀 Starting Coding Pipeline

📥 Step 1: Fetching ideas...
Found 5 ideas:
  1. [ai_ideas] PrivacyGuardian: AI-Powered Real-Time Personal Data Leak Detector
  2. [ai_ideas] ReflectiveLens: Emotionally Adaptive Video Conferencing
  3. [issue] Custom Dashboard Builder

✨ Selected: PrivacyGuardian: AI-Powered Real-Time Personal Data Leak Detector

📋 Step 2: Generating implementation plan...

Plan generated for: privacy-guardian
Phases: 3
  Phase 1: Project Setup (4 tasks)
  Phase 2: Core Monitoring (5 tasks)
  Phase 3: UI & Integration (3 tasks)

📁 Created project directory: /path/to/implementations/privacy-guardian
✅ Saved plan to: /path/to/implementations/privacy-guardian/IMPLEMENTATION_PLAN.json
✅ Created implementation issue: https://github.com/Yang-YZ/AIcodegen/issues/42

🔨 Step 3: Starting implementation...

📦 Phase 1: Project Setup
  🔧 Generating code for: Initialize project structure
    ✅ Created: package.json
    ✅ Created: .gitignore
    ✅ Created: tsconfig.json
  🔧 Generating code for: Set up development environment
    ✅ Created: src/index.ts
    ✅ Created: src/types.ts
  ...
  ✅ Phase 1 complete

📦 Phase 2: Core Monitoring
  🔧 Generating code for: Implement network interceptor
    ✅ Created: src/interceptor/network.ts
    ✅ Created: src/interceptor/types.ts
  ...

📝 Generating README...
✅ Created README.md

🎉 Pipeline execution complete!

Project: privacy-guardian
Location: /path/to/implementations/privacy-guardian

Next steps:
1. Review the generated code
2. Run tests if applicable
3. Make any necessary adjustments
4. Create a PR to merge the implementation
```

### Step 4: Review Generated Code
```bash
cd implementations/privacy-guardian
ls -la
```

**Directory Structure:**
```
privacy-guardian/
├── README.md
├── IMPLEMENTATION_PLAN.json
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── interceptor/
│   │   ├── network.ts
│   │   └── types.ts
│   ├── analyzer/
│   │   └── pattern.ts
│   └── ui/
│       └── dashboard.ts
└── tests/
    └── interceptor.test.ts
```

### Step 5: View Implementation Plan
```bash
cat IMPLEMENTATION_PLAN.json
```

**Output:**
```json
{
  "projectName": "privacy-guardian",
  "description": "AI-Powered Real-Time Personal Data Leak Detector",
  "techStack": [
    "TypeScript",
    "Node.js",
    "TensorFlow.js",
    "Express"
  ],
  "phases": [
    {
      "name": "Project Setup",
      "description": "Initialize project structure and dependencies",
      "tasks": [
        "Initialize project structure",
        "Set up development environment",
        "Configure TypeScript",
        "Install dependencies"
      ],
      "testStrategy": "Verify build completes successfully"
    },
    ...
  ]
}
```

## Example 2: Using GitHub Issues as Input

### Step 1: Create an Issue
Go to GitHub and create an issue with label `idea`:

```markdown
Title: Smart Code Review Assistant

Description:
An AI-powered tool that reviews code changes and provides
contextual suggestions. It should:
- Analyze git diffs
- Check for common patterns
- Suggest improvements
- Generate review comments

Tech Stack:
- Node.js
- GitHub API
- OpenAI API
```

### Step 2: Run Pipeline
The pipeline will automatically detect this issue:

```bash
node scripts/pipeline_cli.mjs run
```

**Output:**
```
📥 Step 1: Fetching ideas...
Found 6 ideas:
  1. [issue] Smart Code Review Assistant
  2. [ai_ideas] PrivacyGuardian
  ...

✨ Selected: Smart Code Review Assistant
```

## Example 3: Using GitHub Actions

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **"Coding Agent Pipeline"**
3. Click **"Run workflow"**
4. Wait for completion

### View Results

After completion:
1. Check **Pull Requests** for new PR
2. Review generated code
3. Check linked issue for implementation plan

## Example 4: Testing the Pipeline

### Run Validation Tests
```bash
node scripts/test_pipeline.mjs
```

**Output:**
```
🧪 Testing Coding Pipeline

✅ Pipeline script exists
✅ CLI script exists
✅ Config file exists
✅ Workflow file exists
✅ Config is valid JSON
✅ Implementations directory exists
✅ Can parse ideas from AI_IDEAS.md
✅ Data directory structure is correct
✅ Workflow YAML is properly structured
✅ Gitignore includes necessary patterns

==================================================
📊 Test Results:
   ✅ Passed: 10
   ❌ Failed: 0
   📈 Total:  10
==================================================

✅ All tests passed!
```

## Example 5: Custom Configuration

### Create Custom Config
```bash
cat > custom-pipeline.config.json << EOF
{
  "defaults": {
    "ai_model": "gpt-4o",
    "coding_model": "gpt-4o",
    "max_iterations": 5
  },
  "sources": {
    "github_issues": {
      "enabled": true,
      "labels": ["feature-request", "idea"]
    }
  },
  "implementation": {
    "output_dir": "custom-implementations",
    "create_pr": false
  }
}
EOF
```

### Run with Custom Config
```bash
node scripts/pipeline_cli.mjs run --config custom-pipeline.config.json
```

## Example 6: Verbose Logging

For debugging, use verbose mode:

```bash
node scripts/pipeline_cli.mjs run --verbose
```

**Output includes:**
- Detailed API calls
- Full prompts sent to AI
- Complete responses
- File operations
- Error stack traces

## Example 7: Generated Project Usage

### Install Dependencies
```bash
cd implementations/privacy-guardian
npm install
```

### Run the Generated Code
```bash
npm start
```

### Run Tests
```bash
npm test
```

## Example 8: Viewing Workflow Logs

### In GitHub Actions
1. Go to **Actions** tab
2. Click on workflow run
3. View logs for each step
4. Check artifacts (if any)

### Download Logs
```bash
gh run view <run-id> --log
```

## Common Patterns

### Pattern 1: Daily Idea Generation + Weekly Implementation
```bash
# Monday - Generate ideas
node scripts/ai_ideas.mjs

# Review ideas during week

# Friday - Implement selected idea
node scripts/pipeline_cli.mjs run
```

### Pattern 2: Rapid Prototyping
```bash
# Generate multiple implementations
for i in {1..3}; do
  node scripts/pipeline_cli.mjs run
done
```

### Pattern 3: Quality Review Cycle
```bash
# 1. Generate code
node scripts/pipeline_cli.mjs run

# 2. Review generated code
cd implementations/latest-project

# 3. Run tests
npm test

# 4. Make manual adjustments
vim src/main.ts

# 5. Commit and PR
git add .
git commit -m "refinements after review"
```

## Troubleshooting Examples

### Issue: API Key Not Set
```bash
$ node scripts/pipeline_cli.mjs run
❌ Pipeline failed: OPENAI_API_KEY is not set

# Solution:
export OPENAI_API_KEY="sk-..."
node scripts/pipeline_cli.mjs run
```

### Issue: No Ideas Found
```bash
$ node scripts/pipeline_cli.mjs run
⚠️  No ideas found to implement

# Solution: Generate ideas first
node scripts/ai_ideas.mjs
node scripts/pipeline_cli.mjs run
```

### Issue: GitHub API Rate Limit
```bash
⚠️  Could not fetch issues: GitHub API error 403

# Solution: Use authenticated token
export GITHUB_TOKEN="ghp_..."
node scripts/pipeline_cli.mjs run
```

## Best Practices

1. **Always generate ideas first**: Run `ai_ideas.mjs` before pipeline
2. **Review generated plans**: Check `IMPLEMENTATION_PLAN.json` before proceeding
3. **Test incrementally**: Don't run full pipeline until config is correct
4. **Use version control**: Commit generated code promptly
5. **Document changes**: Update README with any manual modifications
6. **Monitor API usage**: Keep track of OpenAI API costs

## Next Steps

After running the pipeline:

1. **Review** the generated code thoroughly
2. **Test** all functionality
3. **Refine** based on requirements
4. **Document** any changes made
5. **Deploy** if ready for production
6. **Share** learnings with the team

---

For more details, see:
- `README.md` - Project overview
- `PIPELINE_README.md` - Detailed pipeline docs
- `ARCHITECTURE.md` - System architecture