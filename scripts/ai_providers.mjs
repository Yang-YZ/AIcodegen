// scripts/ai_providers.mjs
// Abstraction layer for multiple AI providers

/**
 * Base AI Provider Interface
 * All providers must implement this interface
 */
class AIProvider {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Generate a completion from the AI model
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Provider-specific options (model, temperature, etc.)
   * @returns {Promise<Object>} Response object with choices array
   */
  async generateCompletion(messages, options = {}) {
    throw new Error('generateCompletion must be implemented by provider');
  }

  /**
   * Check if the provider is properly configured
   * @returns {boolean} True if provider can be used
   */
  isConfigured() {
    throw new Error('isConfigured must be implemented by provider');
  }

  /**
   * Get provider name
   * @returns {string} Provider name
   */
  getName() {
    throw new Error('getName must be implemented by provider');
  }
}

/**
 * OpenAI Provider (GPT-4, GPT-3.5, etc.)
 */
class OpenAIProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  }

  getName() {
    return 'OpenAI';
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async generateCompletion(messages, options = {}) {
    const {
      model = 'gpt-4o-mini',
      temperature = 0.7,
      max_tokens = 4000,
      ...otherOptions
    } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        ...otherOptions,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Normalize response format
    return {
      choices: data.choices || [],
      usage: data.usage,
      model: data.model,
      provider: 'openai',
    };
  }
}

/**
 * Anthropic Claude Provider
 */
class AnthropicProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
    this.apiVersion = config.apiVersion || '2023-06-01';
  }

  getName() {
    return 'Anthropic';
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async generateCompletion(messages, options = {}) {
    const {
      model = 'claude-3-5-sonnet-20241022',
      temperature = 0.7,
      max_tokens = 4000,
      ...otherOptions
    } = options;

    // Convert OpenAI-style messages to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': this.apiVersion,
      },
      body: JSON.stringify({
        model,
        messages: userMessages,
        system: systemMessage?.content,
        temperature,
        max_tokens,
        ...otherOptions,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Normalize to OpenAI-style response format
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: data.content[0]?.text || '',
        },
        finish_reason: data.stop_reason,
      }],
      usage: data.usage,
      model: data.model,
      provider: 'anthropic',
    };
  }
}

/**
 * Custom/Generic Provider for coding agent proxies
 */
class CustomProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || process.env.CUSTOM_API_KEY;
    this.baseUrl = config.baseUrl || process.env.CUSTOM_API_BASE_URL;
    this.authHeader = config.authHeader || 'Authorization';
    this.authPrefix = config.authPrefix || 'Bearer';
  }

  getName() {
    return this.config.name || 'Custom';
  }

  isConfigured() {
    return !!(this.apiKey && this.baseUrl);
  }

  async generateCompletion(messages, options = {}) {
    const {
      model = 'default',
      temperature = 0.7,
      max_tokens = 4000,
      ...otherOptions
    } = options;

    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers[this.authHeader] = `${this.authPrefix} ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        ...otherOptions,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Custom API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Assume OpenAI-compatible response format
    return {
      choices: data.choices || [],
      usage: data.usage,
      model: data.model || model,
      provider: 'custom',
    };
  }
}

/**
 * Provider Factory - creates appropriate provider based on configuration
 */
class AIProviderFactory {
  static createProvider(providerName, config = {}) {
    const providers = {
      'openai': OpenAIProvider,
      'anthropic': AnthropicProvider,
      'custom': CustomProvider,
    };

    const ProviderClass = providers[providerName.toLowerCase()];
    if (!ProviderClass) {
      throw new Error(`Unknown provider: ${providerName}. Available: ${Object.keys(providers).join(', ')}`);
    }

    return new ProviderClass(config);
  }

  /**
   * Create provider with fallback chain
   * @param {Array} providerConfigs - Array of {name, config} objects
   * @returns {Object} Provider manager with fallback support
   */
  static createWithFallbacks(providerConfigs) {
    const providers = providerConfigs
      .map(({ name, config }) => {
        try {
          const provider = this.createProvider(name, config);
          return provider.isConfigured() ? provider : null;
        } catch (err) {
          console.warn(`Failed to initialize provider ${name}:`, err.message);
          return null;
        }
      })
      .filter(p => p !== null);

    if (providers.length === 0) {
      throw new Error('No configured providers available');
    }

    return {
      providers,
      async generateCompletion(messages, options = {}) {
        const errors = [];
        
        for (const provider of this.providers) {
          try {
            console.log(`Attempting with provider: ${provider.getName()}`);
            const result = await provider.generateCompletion(messages, options);
            return result;
          } catch (err) {
            console.warn(`Provider ${provider.getName()} failed:`, err.message);
            errors.push({ provider: provider.getName(), error: err.message });
          }
        }

        throw new Error(
          `All providers failed:\n${errors.map(e => `  - ${e.provider}: ${e.error}`).join('\n')}`
        );
      },
      getPrimaryProvider() {
        return this.providers[0];
      },
    };
  }
}

/**
 * Load provider configuration from config file or environment
 */
function loadProviderConfig(configPath = null) {
  let config = {
    provider: 'openai',
    providers: {
      openai: {
        models: {
          planning: 'gpt-4o-mini',
          coding: 'gpt-4o',
        },
      },
    },
  };

  // Try to load from config file
  if (configPath) {
    try {
      const fs = await import('fs');
      const fileContent = fs.readFileSync(configPath, 'utf8');
      const fileConfig = JSON.parse(fileContent);
      config = { ...config, ...fileConfig };
    } catch (err) {
      console.warn(`Could not load config from ${configPath}:`, err.message);
    }
  }

  // Environment variable overrides
  if (process.env.AI_PROVIDER) {
    config.provider = process.env.AI_PROVIDER;
  }

  return config;
}

export {
  AIProvider,
  OpenAIProvider,
  AnthropicProvider,
  CustomProvider,
  AIProviderFactory,
  loadProviderConfig,
}