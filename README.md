# AIcodegen

An automated pipeline for AI-powered code generation and idea implementation.

## Overview

AIcodegen is a comprehensive system that:

1. **Generates AI application ideas** daily using GPT-4
2. **Implements ideas automatically** using coding agents
3. **Creates pull requests** with working implementations
4. **Tracks progress** through GitHub issues

## Features

### 🤖 Daily AI Idea Generation

- Fetches trending topics from Hacker News
- Generates unique, implementable AI application ideas
- Avoids duplicates using historical tracking
- Sends email notifications

### 🔨 Coding Agent Pipeline

- Automatically implements ideas from GitHub issues or generated ideas
- Uses AI agents for planning, coding, and testing
- Creates project structures with documentation
- Generates pull requests with working code

## Quick Start

### Prerequisites

- Node.js 18 or higher
- OpenAI API key
- GitHub token (optional, for GitHub API operations)

### Environment Setup

```bash
export OPENAI_API_KEY=your_openai_api_key
export GITHUB_TOKEN=your_github_token
```

### Usage

#### Generate AI Ideas

```bash
# Generate 3 new ideas (default)
node scripts/ai_ideas.mjs

# Generate custom number of ideas
IDEA_COUNT=5 node scripts/ai_ideas.mjs
```

#### Run Coding Pipeline

```bash
# Run full pipeline
node scripts/pipeline_cli.mjs run

# Show help
node scripts/pipeline_cli.mjs help
```

## Repository Structure

```
AIcodegen/
├── scripts/
│   ├── ai_ideas.mjs           # Generate AI application ideas
│   ├── coding_pipeline.mjs    # Main pipeline orchestrator
│   ├── pipeline_cli.mjs       # CLI wrapper
│   └── test_pipeline.mjs      # Pipeline tests
├── .github/
│   └── workflows/
│       ├── ai_ideas.yml       # Daily idea generation workflow
│       └── coding_pipeline.yml # Pipeline execution workflow
├── implementations/           # Generated project implementations
├── data/
│   └── idea_titles.json      # Historical idea tracking
├── pipeline.config.json       # Pipeline configuration
├── AI_IDEAS.md               # Generated ideas archive
├── PIPELINE_README.md        # Detailed pipeline documentation
└── README.md                 # This file
```

## Workflows

### 1. Idea Generation Workflow

**Trigger**: Daily at 14:00 UTC (or manual)

**Process**:
1. Fetches hot topics from Hacker News
2. Checks historical ideas to avoid duplicates
3. Generates 3 new AI application ideas
4. Appends to `AI_IDEAS.md`
5. Updates `data/idea_titles.json`
6. Sends email notification
7. Commits changes to repository

**Example Output**:
```markdown
### PrivacyGuardian: AI-Powered Real-Time Personal Data Leak Detector

**Description:** Monitors mobile apps for data leaks using AI...

**Potential tech stack:**
- Mobile monitoring (Kotlin/Swift)
- ML models (TensorFlow Lite)
- Backend (Python, FastAPI)
```

### 2. Coding Pipeline Workflow

**Trigger**: Weekly on Monday at 12:00 UTC (or manual)

**Process**:
1. Fetches ideas from GitHub issues (labeled "idea") or `AI_IDEAS.md`
2. Selects an idea to implement
3. Generates detailed implementation plan using AI
4. Creates project structure in `implementations/`
5. Generates code for each phase and task
6. Runs tests and iterates on failures
7. Creates GitHub issue for tracking
8. Opens pull request with implementation

**Generated Files**:
```
implementations/project-name/
├── README.md                 # Project documentation
├── IMPLEMENTATION_PLAN.json  # Detailed implementation plan
├── src/                      # Source code
└── tests/                    # Test files
```

## Configuration

Edit `pipeline.config.json` to customize behavior:

```json
{
  "defaults": {
    "ai_model": "gpt-4o-mini",     // Model for planning
    "coding_model": "gpt-4o",       // Model for code generation
    "max_iterations": 3             // Max test retry attempts
  },
  "sources": {
    "github_issues": {
      "enabled": true,
      "labels": ["idea"]
    }
  },
  "implementation": {
    "output_dir": "implementations",
    "create_issue": true,
    "create_pr": true
  }
}
```

## How It Works

### Idea Generation

1. **Context Gathering**: Fetches trending topics from Hacker News API
2. **Historical Check**: Loads past ideas from `data/idea_titles.json`
3. **AI Generation**: Uses GPT-4 to generate novel ideas with:
   - Unique names
   - Problem descriptions
   - Differentiation from existing solutions
   - Technical stack suggestions
4. **Deduplication**: Extracts titles and ensures uniqueness
5. **Persistence**: Saves to both `AI_IDEAS.md` and history file

### Implementation Pipeline

1. **Idea Selection**: Chooses from GitHub issues or recent ideas
2. **Planning Phase**: 
   - Generates project structure
   - Defines implementation phases
   - Creates task breakdown
   - Plans test strategies
3. **Implementation Phase**:
   - Generates code for each task
   - Maintains context between tasks
   - Creates necessary files and directories
4. **Testing Phase**: (when applicable)
   - Runs automated tests
   - Analyzes failures
   - Iterates on failing tests
5. **PR Creation**: 
   - Commits all changes
   - Creates descriptive PR
   - Links to tracking issue

## Testing

Run the test suite to validate pipeline setup:

```bash
node scripts/test_pipeline.mjs
```

Tests include:
- ✅ File structure validation
- ✅ Configuration validation
- ✅ Workflow structure checks
- ✅ Idea parsing functionality

## Development

### Local Testing

```bash
# Test idea generation (requires OPENAI_API_KEY)
node scripts/ai_ideas.mjs

# Test pipeline without API calls
node scripts/test_pipeline.mjs

# Run pipeline with verbose logging
node scripts/pipeline_cli.mjs run --verbose
```

### Manual Workflow Trigger

Go to:
- **Actions** → **Daily AI App Ideas** → **Run workflow** (for ideas)
- **Actions** → **Coding Agent Pipeline** → **Run workflow** (for implementation)

## Examples

### Generated Ideas

See `AI_IDEAS.md` for the full archive of generated ideas, including:
- PrivacyGuardian: Mobile data leak detector
- ReflectiveLens: Emotionally adaptive video conferencing
- SkillSlice: Fractional expert sessions marketplace
- And many more...

### Implementation Example

When the pipeline runs, it creates a complete project:

```
implementations/privacy-guardian/
├── README.md
├── IMPLEMENTATION_PLAN.json
├── src/
│   ├── index.js
│   ├── monitor.js
│   └── analyzer.js
├── tests/
│   └── monitor.test.js
└── package.json
```

## Advanced Features

### Custom Configuration

```bash
node scripts/pipeline_cli.mjs run --config custom-config.json
```

### Dry Run Mode

```bash
node scripts/pipeline_cli.mjs run --dry-run
```

### Selecting Specific Ideas

```bash
node scripts/pipeline_cli.mjs run --idea "PrivacyGuardian"
```

## Troubleshooting

### Common Issues

1. **Missing API Keys**
   ```
   Error: OPENAI_API_KEY is not set
   ```
   Solution: Set environment variable `export OPENAI_API_KEY=your_key`

2. **GitHub API Rate Limits**
   ```
   Error: GitHub API error 403
   ```
   Solution: Use authenticated requests with `GITHUB_TOKEN`

3. **Pipeline Failures**
   - Check logs in GitHub Actions
   - Run locally with `--verbose` flag
   - Review generated `IMPLEMENTATION_PLAN.json`

## Future Enhancements

- [ ] Support for multiple AI providers (Anthropic, Google)
- [ ] Interactive mode for idea selection
- [ ] Advanced code quality metrics
- [ ] Deployment automation
- [ ] Multi-language support
- [ ] Team collaboration features
- [ ] Integration with project management tools

## Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `node scripts/test_pipeline.mjs`
5. Submit a pull request

## License

See LICENSE file for details.

## Documentation

- **PIPELINE_README.md** - Detailed pipeline documentation
- **AI_IDEAS.md** - Archive of generated ideas
- **pipeline.config.json** - Configuration reference

## Contact

For questions or issues, please create a GitHub issue.

---

**Built with ❤️ using AI coding agents**
