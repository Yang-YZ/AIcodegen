# AI Coding Agent Pipeline

An automated pipeline that takes AI application ideas and implements them using coding agents, with built-in testing, iteration, and PR generation.

## Overview

This pipeline automates the entire software development lifecycle:

1. **Idea Collection** - Fetches ideas from GitHub issues or AI_IDEAS.md
2. **Planning** - Uses AI to generate detailed implementation plans
3. **Implementation** - Generates code using specialized coding agents
4. **Testing** - Runs tests and iterates on failures
5. **PR Creation** - Automatically creates pull requests with the implementation

## Features

- 🤖 **AI-Powered Planning** - Generates detailed implementation plans using GPT-4
- 📝 **Code Generation** - Creates production-ready code with proper structure
- 🧪 **Automated Testing** - Runs tests and iterates on failures
- 🔄 **Continuous Integration** - Integrated with GitHub Actions
- 📊 **Progress Tracking** - Creates GitHub issues for implementation tracking
- 🔐 **Security First** - Includes security scanning in the workflow

## Quick Start

### Prerequisites

- Node.js 18 or higher
- OpenAI API key
- GitHub token (for GitHub API operations)

### Environment Variables

Create a `.env` file or set environment variables:

```bash
export OPENAI_API_KEY=your_openai_api_key
export GITHUB_TOKEN=your_github_token
export REPO_OWNER=Yang-YZ
export REPO_NAME=AIcodegen
```

### Local Usage

```bash
# Run the full pipeline
node scripts/pipeline_cli.mjs run

# Generate plan only
node scripts/pipeline_cli.mjs plan

# Show help
node scripts/pipeline_cli.mjs help
```

### GitHub Actions

The pipeline runs automatically via GitHub Actions:

- **Manual Trigger**: Go to Actions → Coding Agent Pipeline → Run workflow
- **Scheduled**: Runs every Monday at noon UTC

## Configuration

Edit `pipeline.config.json` to customize:

```json
{
  "defaults": {
    "ai_model": "gpt-4o-mini",
    "coding_model": "gpt-4o",
    "max_iterations": 3
  },
  "sources": {
    "github_issues": {
      "enabled": true,
      "labels": ["idea"]
    }
  }
}
```

## How It Works

### 1. Idea Collection

The pipeline collects ideas from two sources:

- **GitHub Issues**: Issues labeled with `idea`
- **AI_IDEAS.md**: Latest ideas from the ideas file

### 2. Implementation Planning

Using GPT-4, the pipeline generates:

- Project structure
- Technology stack
- Implementation phases
- Task breakdown
- Test strategies

### 3. Code Generation

For each phase and task:

1. Calls coding agents to generate code
2. Creates necessary files and directories
3. Maintains context between tasks
4. Ensures code quality and documentation

### 4. Testing & Iteration

- Runs automated tests
- Analyzes failures
- Iterates on failing tests up to configured max_iterations
- Reports test results

### 5. PR Creation

Creates a pull request with:

- Generated code
- Documentation
- Implementation plan
- Test results

## Project Structure

```
AIcodegen/
├── scripts/
│   ├── ai_ideas.mjs           # Generate AI ideas
│   ├── coding_pipeline.mjs    # Main pipeline script
│   └── pipeline_cli.mjs       # CLI wrapper
├── .github/
│   └── workflows/
│       ├── ai_ideas.yml       # Daily ideas generation
│       └── coding_pipeline.yml # Pipeline execution
├── implementations/           # Generated projects
├── data/
│   └── idea_titles.json      # Idea history
├── pipeline.config.json       # Pipeline configuration
└── AI_IDEAS.md               # Generated ideas

## Example Workflow

1. **Idea Generation** (daily)
   - AI generates new app ideas
   - Ideas saved to AI_IDEAS.md
   - Email notification sent

2. **Pipeline Execution** (weekly or manual)
   - Selects latest idea
   - Generates implementation plan
   - Creates project structure
   - Generates code
   - Runs tests
   - Creates PR

3. **Review & Merge**
   - Review generated code
   - Run additional tests
   - Merge PR
   - Deploy if applicable

## Configuration Options

### AI Models

- `ai_model`: Model for planning (default: gpt-4o-mini)
- `coding_model`: Model for code generation (default: gpt-4o)

### Implementation

- `output_dir`: Directory for generated projects
- `create_issue`: Create tracking issue (default: true)
- `create_pr`: Create pull request (default: true)
- `run_tests`: Run automated tests (default: true)

### Quality Checks

- `code_review`: Enable code review (default: true)
- `security_scan`: Enable security scanning (default: true)
- `lint`: Enable linting (default: true)

## Generated Project Structure

Each implementation includes:

```
implementations/project-name/
├── README.md                 # Project documentation
├── IMPLEMENTATION_PLAN.json  # Detailed plan
├── src/                      # Source code
├── tests/                    # Test files
└── package.json              # Dependencies (if applicable)
```

## Advanced Usage

### Custom Configuration

```bash
node scripts/pipeline_cli.mjs run --config custom-config.json
```

### Verbose Logging

```bash
node scripts/pipeline_cli.mjs run --verbose
```

### Dry Run

```bash
node scripts/pipeline_cli.mjs run --dry-run
```

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Ensure `OPENAI_API_KEY` is set
   - Check API key has sufficient credits

2. **GitHub Token Issues**
   - Ensure `GITHUB_TOKEN` has required permissions
   - Check token hasn't expired

3. **Pipeline Failures**
   - Check logs in GitHub Actions
   - Run with `--verbose` flag locally
   - Review error messages in output

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

See LICENSE file for details.

## Future Enhancements

- [ ] Support for multiple AI providers (Anthropic, Google)
- [ ] Interactive mode for idea selection
- [ ] Advanced test generation strategies
- [ ] Code quality metrics
- [ ] Deployment automation
- [ ] Multi-repository support
- [ ] Team collaboration features

## Contact

For questions or issues, please create a GitHub issue.

---

**Built with ❤️ using AI coding agents**
