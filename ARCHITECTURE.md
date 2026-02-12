# Pipeline Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI CODING PIPELINE                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  IDEA GENERATION     │
│  (Daily Workflow)    │
└──────────┬───────────┘
           │
           ↓
    ┌──────────────┐
    │ Fetch Topics │
    │  (HN API)    │
    └──────┬───────┘
           │
           ↓
    ┌──────────────┐
    │  Check       │
    │  History     │
    └──────┬───────┘
           │
           ↓
    ┌──────────────┐
    │  Generate    │
    │  Ideas (GPT) │
    └──────┬───────┘
           │
           ↓
    ┌──────────────┐
    │  Save to     │
    │  AI_IDEAS.md │
    └──────┬───────┘
           │
           ↓
    ┌──────────────┐
    │  Email       │
    │  Notification│
    └──────────────┘


┌──────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION PIPELINE                        │
│                    (Weekly Workflow)                              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐
│  Fetch Ideas from    │        │  Fetch Ideas from    │
│  GitHub Issues       │◄───OR──┤  AI_IDEAS.md         │
│  (label: "idea")     │        │  (latest 3)          │
└──────────┬───────────┘        └──────────────────────┘
           │
           ↓
    ┌──────────────┐
    │  Select Idea │
    │  (first one) │
    └──────┬───────┘
           │
           ↓
    ┌──────────────┐
    │  Generate    │
    │  Impl. Plan  │
    │  (GPT-4)     │
    └──────┬───────┘
           │
           ↓
    ┌──────────────────────────────┐
    │  Create Project Structure    │
    │  implementations/project-name│
    └──────────┬───────────────────┘
               │
               ↓
        ┌──────────────┐
        │  Phase Loop  │◄───────┐
        └──────┬───────┘        │
               │                 │
               ↓                 │
        ┌──────────────┐        │
        │  Task Loop   │◄───┐   │
        └──────┬───────┘    │   │
               │             │   │
               ↓             │   │
        ┌──────────────┐    │   │
        │  Generate    │    │   │
        │  Code (GPT-4)│    │   │
        └──────┬───────┘    │   │
               │             │   │
               ↓             │   │
        ┌──────────────┐    │   │
        │  Write Files │    │   │
        └──────┬───────┘    │   │
               │             │   │
               ├─────────────┘   │
               │                 │
               ├─────────────────┘
               │
               ↓
        ┌──────────────┐
        │  Generate    │
        │  README.md   │
        └──────┬───────┘
               │
               ↓
        ┌──────────────┐
        │  Create      │
        │  Issue       │
        └──────┬───────┘
               │
               ↓
        ┌──────────────┐
        │  Create      │
        │  Pull Request│
        └──────┬───────┘
               │
               ↓
        ┌──────────────┐
        │  SUCCESS ✓   │
        └──────────────┘


┌──────────────────────────────────────────────────────────────────┐
│                    COMPONENT INTERACTIONS                         │
└──────────────────────────────────────────────────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   GitHub    │◄──────┤   Pipeline  │──────►│   OpenAI    │
│     API     │       │  Orchestr.  │       │     API     │
└─────────────┘       └──────┬──────┘       └─────────────┘
                             │
                             │
                      ┌──────┴──────┐
                      │             │
                ┌─────▼────┐  ┌────▼─────┐
                │ Planner  │  │  Coder   │
                │  Agent   │  │  Agent   │
                └──────────┘  └──────────┘


┌──────────────────────────────────────────────────────────────────┐
│                    DATA FLOW                                      │
└──────────────────────────────────────────────────────────────────┘

AI_IDEAS.md
    │
    ├──► Pipeline reads ideas
    │
    ├──► Generates plan
    │         │
    │         └──► IMPLEMENTATION_PLAN.json
    │
    └──► Generates code
              │
              └──► implementations/
                      ├── src/
                      ├── tests/
                      └── README.md


┌──────────────────────────────────────────────────────────────────┐
│                    WORKFLOW TRIGGERS                              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Daily Schedule  │
│  (14:00 UTC)     │──► AI Ideas Workflow
└──────────────────┘

┌──────────────────┐
│  Weekly Schedule │
│  (Mon 12:00 UTC) │──► Coding Pipeline Workflow
└──────────────────┘

┌──────────────────┐
│  Manual Trigger  │
│  (via Actions)   │──► Both Workflows
└──────────────────┘
```

## Key Components

### 1. Idea Generation
- **Input**: Hacker News topics, historical ideas
- **Processing**: GPT-4 generates unique ideas
- **Output**: AI_IDEAS.md, idea_titles.json

### 2. Implementation Pipeline
- **Input**: GitHub issues or AI_IDEAS.md
- **Processing**: Multi-stage AI agents for planning and coding
- **Output**: Complete project in implementations/

### 3. Quality Gates
- Code structure validation
- Documentation generation
- PR creation with review checklist

## Configuration Points

| Component | Configuration | Default |
|-----------|--------------|---------|
| Planner Agent | `ai_model` | gpt-4o-mini |
| Coder Agent | `coding_model` | gpt-4o |
| Max Iterations | `max_iterations` | 3 |
| Output Directory | `output_dir` | implementations |
| Create Issues | `create_issue` | true |
| Create PRs | `create_pr` | true |

## Error Handling

```
Error Detected
    │
    ├──► Retry with context
    │
    ├──► Log error details
    │
    └──► Continue or fail gracefully
```

## Security Considerations

- API keys stored in GitHub Secrets
- No sensitive data in generated code
- Rate limiting on API calls
- Input validation on all external data
