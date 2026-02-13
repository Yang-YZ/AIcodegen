# AI Provider Configuration Guide

This guide explains how to configure and use different AI providers with the AIcodegen pipeline.

## Why Multiple Providers?

The pipeline supports multiple AI providers to give you flexibility:

- **Cost Optimization**: Use cheaper models for planning, premium models for coding
- **Provider Redundancy**: Automatic fallback if primary provider fails
- **Specialized Models**: Use coding-optimized models or self-hosted solutions
- **Vendor Independence**: Not locked into a single provider

## Supported Providers

### 1. OpenAI (Default)

**Best For**: General-purpose code generation, wide model selection

**API**: https://platform.openai.com/

**Available Models**:
- `gpt-4o` - Latest GPT-4 Optimized, best for coding
- `gpt-4o-mini` - Fast and economical
- `gpt-4-turbo` - Previous generation, still powerful
- `gpt-3.5-turbo` - Most economical option

**Setup**:
```bash
# Get API key from https://platform.openai.com/api-keys
export OPENAI_API_KEY=sk-proj-...
```

**Configuration** (`pipeline.config.json`):
```json
{
  "ai_provider": {
    "primary": "openai",
    "providers": {
      "openai": {
        "models": {
          "planning": "gpt-4o-mini",
          "coding": "gpt-4o"
        },
        "base_url": "https://api.openai.com/v1"
      }
    }
  }
}
```

**Pricing** (as of 2024):
- GPT-4o: ~$5/1M input tokens, ~$15/1M output tokens
- GPT-4o-mini: ~$0.15/1M input tokens, ~$0.60/1M output tokens

---

### 2. Anthropic Claude

**Best For**: Advanced reasoning, longer context windows (200K tokens), high-quality code

**API**: https://www.anthropic.com/

**Available Models**:
- `claude-3-5-sonnet-20241022` - Best balance, excellent coding
- `claude-3-opus-20240229` - Highest quality for complex tasks
- `claude-3-haiku-20240307` - Fast and economical

**Setup**:
```bash
# Get API key from https://console.anthropic.com/
export ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Configuration** (`pipeline.config.json`):
```json
{
  "ai_provider": {
    "primary": "anthropic",
    "providers": {
      "anthropic": {
        "models": {
          "planning": "claude-3-5-sonnet-20241022",
          "coding": "claude-3-5-sonnet-20241022"
        },
        "base_url": "https://api.anthropic.com/v1"
      }
    }
  }
}
```

**Key Features**:
- 200K token context window
- Strong at following complex instructions
- Excellent at structured output (JSON)
- Good at multi-step reasoning

**Pricing** (as of 2024):
- Claude 3.5 Sonnet: ~$3/1M input, ~$15/1M output
- Claude 3 Opus: ~$15/1M input, ~$75/1M output

---

### 3. Custom Provider / Coding Agent Proxy

**Best For**: Self-hosted models, specialized coding agents, custom endpoints

**Use Cases**:
- OpenAI-compatible proxies (LiteLLM, LocalAI)
- Self-hosted models (Ollama, vLLM)
- Specialized coding agents (Codex alternatives)
- Corporate/private deployments

**Setup**:
```bash
export CUSTOM_API_KEY=your_api_key
export CUSTOM_API_BASE_URL=https://your-endpoint.com/v1
```

**Configuration** (`pipeline.config.json`):
```json
{
  "ai_provider": {
    "primary": "custom",
    "providers": {
      "custom": {
        "enabled": true,
        "name": "My Coding Agent",
        "base_url": "https://your-endpoint.com/v1",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer",
        "models": {
          "planning": "codellama-34b",
          "coding": "deepseek-coder-33b"
        }
      }
    }
  }
}
```

**Example Providers**:

#### A. LiteLLM Proxy
```bash
# Setup LiteLLM proxy locally
litellm --model gpt-4

# Configure
export CUSTOM_API_BASE_URL=http://localhost:8000
export CUSTOM_API_KEY=sk-1234
```

#### B. Ollama (Local)
```bash
# Run Ollama
ollama serve

# Configure
export CUSTOM_API_BASE_URL=http://localhost:11434/v1
# No API key needed for local
```

#### C. Azure OpenAI
```json
{
  "custom": {
    "enabled": true,
    "base_url": "https://your-resource.openai.azure.com/openai/deployments",
    "auth_header": "api-key",
    "auth_prefix": "",
    "models": {
      "planning": "gpt-4-deployment-name",
      "coding": "gpt-4-deployment-name"
    }
  }
}
```

---

## Multi-Provider Strategies

### Strategy 1: Cost Optimization

Use cheaper model for planning, premium for coding:

```json
{
  "ai_provider": {
    "primary": "openai",
    "providers": {
      "openai": {
        "models": {
          "planning": "gpt-4o-mini",    // $0.15/1M
          "coding": "gpt-4o"             // $5/1M
        }
      }
    }
  }
}
```

### Strategy 2: Provider Fallback

Primary with fallback for reliability:

```json
{
  "ai_provider": {
    "primary": "openai",
    "fallbacks": ["anthropic"],  // Switch if OpenAI fails
    "providers": {
      "openai": { ... },
      "anthropic": { ... }
    }
  }
}
```

### Strategy 3: Hybrid Approach

Different providers for different tasks:

```json
{
  "ai_provider": {
    "primary": "anthropic",  // Use Claude for planning (better reasoning)
    "providers": {
      "anthropic": {
        "models": {
          "planning": "claude-3-5-sonnet-20241022",
          "coding": "claude-3-5-sonnet-20241022"
        }
      }
    }
  }
}
```

---

## Environment Variables Reference

| Variable | Provider | Required | Description |
|----------|----------|----------|-------------|
| `OPENAI_API_KEY` | OpenAI | Yes (if using) | Your OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic | Yes (if using) | Your Anthropic API key |
| `CUSTOM_API_KEY` | Custom | Depends | Custom provider API key |
| `CUSTOM_API_BASE_URL` | Custom | Yes (if using) | Custom endpoint URL |
| `AI_PROVIDER` | All | No | Override primary provider |

## Testing Your Configuration

### 1. Validate Configuration
```bash
node scripts/test_pipeline.mjs
```

### 2. Test Provider Connection
```bash
# Set your API key
export OPENAI_API_KEY=sk-...

# Run a simple test
node scripts/pipeline_cli.mjs run --dry-run
```

### 3. Check Logs
The pipeline logs which provider it's using:
```
✅ Initialized AI provider: OpenAI
   Fallbacks: anthropic
```

## Troubleshooting

### Issue: "No configured providers available"

**Cause**: No valid API key found

**Solution**:
```bash
# Check environment variables
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# Set the appropriate key
export OPENAI_API_KEY=your_key
```

### Issue: "All providers failed"

**Cause**: All configured providers returned errors

**Solution**:
1. Check API key validity
2. Verify network connectivity
3. Check provider status pages
4. Review error messages in logs

### Issue: "Provider anthropic failed: API error 401"

**Cause**: Invalid or expired API key

**Solution**:
```bash
# Generate new key from provider console
# OpenAI: https://platform.openai.com/api-keys
# Anthropic: https://console.anthropic.com/

export ANTHROPIC_API_KEY=sk-ant-new-key...
```

## Best Practices

### 1. Use Fallbacks for Production
```json
{
  "primary": "openai",
  "fallbacks": ["anthropic"]
}
```

### 2. Separate Planning and Coding Models
```json
{
  "models": {
    "planning": "gpt-4o-mini",  // Cheaper
    "coding": "gpt-4o"           // Better quality
  }
}
```

### 3. Monitor Costs
- Track API usage in provider dashboards
- Set spending limits
- Use cheaper models for development

### 4. Test Before Production
```bash
# Test with a simple idea first
node scripts/pipeline_cli.mjs run
```

### 5. Keep API Keys Secure
```bash
# Never commit keys to git
# Use environment variables
# Rotate keys regularly
```

## Advanced: Custom Provider Implementation

To add a new provider, edit `scripts/ai_providers.mjs`:

```javascript
class MyCustomProvider extends AIProvider {
  async generateCompletion(messages, options = {}) {
    // Your implementation
  }
  
  isConfigured() {
    return !!this.apiKey;
  }
  
  getName() {
    return 'MyProvider';
  }
}

// Register in factory
const providers = {
  'openai': OpenAIProvider,
  'anthropic': AnthropicProvider,
  'custom': CustomProvider,
  'mycustom': MyCustomProvider,  // Add here
};
```

## FAQ

**Q: Can I use multiple providers simultaneously?**
A: Yes, configure fallbacks. The pipeline tries them in order.

**Q: Which provider is best for coding?**
A: GPT-4o and Claude 3.5 Sonnet are both excellent. GPT-4o has more training data, Claude has longer context.

**Q: Can I use local models?**
A: Yes! Use Ollama or vLLM with the custom provider configuration.

**Q: How much does it cost per implementation?**
A: Varies by model and project size. Typical: $0.10-$1.00 per implementation with GPT-4o-mini/GPT-4o combo.

**Q: Do I need different API keys for different models from the same provider?**
A: No, one API key per provider works for all their models.

---

*For more information, see DESIGN_DECISIONS.md*