#!/usr/bin/env node

// CLI wrapper for the coding pipeline
import { executePipeline } from './coding_pipeline.mjs';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VERSION = '1.0.0';

function showHelp() {
  console.log(`
AI Coding Pipeline CLI v${VERSION}

Usage:
  node scripts/pipeline_cli.mjs [command] [options]

Commands:
  run              Execute the full pipeline
  plan             Generate implementation plan only (no code generation)
  help             Show this help message
  version          Show version

Options:
  --idea <id>      Select specific idea by ID or title
  --dry-run        Generate plan without executing
  --verbose        Show detailed logs
  --no-pr          Skip PR creation
  --config <path>  Use custom config file

Environment Variables:
  OPENAI_API_KEY   Required for AI operations
  GITHUB_TOKEN     Required for GitHub API operations

Examples:
  # Run full pipeline
  node scripts/pipeline_cli.mjs run

  # Generate plan only
  node scripts/pipeline_cli.mjs plan --idea "PrivacyGuardian"

  # Dry run
  node scripts/pipeline_cli.mjs run --dry-run

  # Use custom config
  node scripts/pipeline_cli.mjs run --config ./my-config.json
`);
}

function showVersion() {
  console.log(`AI Coding Pipeline v${VERSION}`);
}

function parseArgs(args) {
  const parsed = {
    command: 'run',
    options: {}
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!arg.startsWith('--')) {
      if (i === 0) {
        parsed.command = arg;
      }
      continue;
    }

    const key = arg.slice(2);
    if (args[i + 1] && !args[i + 1].startsWith('--')) {
      parsed.options[key] = args[i + 1];
      i++;
    } else {
      parsed.options[key] = true;
    }
  }

  return parsed;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const { command, options } = parseArgs(args);

  // Handle commands
  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      process.exit(0);
      break;

    case 'version':
    case '--version':
    case '-v':
      showVersion();
      process.exit(0);
      break;

    case 'run':
      console.log('🚀 Starting pipeline execution...\n');
      
      if (options['dry-run']) {
        console.log('ℹ️  Running in dry-run mode (plan only)\n');
        // TODO: Implement dry-run mode
      }

      if (options.verbose) {
        process.env.VERBOSE = 'true';
      }

      try {
        const result = await executePipeline();
        console.log('\n✅ Pipeline completed successfully!');
        process.exit(0);
      } catch (err) {
        console.error('\n❌ Pipeline failed:', err.message);
        if (options.verbose) {
          console.error(err.stack);
        }
        process.exit(1);
      }
      break;

    case 'plan':
      console.log('📋 Generating implementation plan only...\n');
      // TODO: Implement plan-only mode
      console.log('⚠️  Plan-only mode not yet implemented');
      process.exit(1);
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
