#!/usr/bin/env node

// Test script for the coding pipeline
// Tests basic functionality without requiring API keys

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🧪 Testing Coding Pipeline\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passedTests++;
  } catch (err) {
    console.log(`❌ ${name}: ${err.message}`);
    failedTests++;
  }
}

// Test 1: Check required files exist
test('Pipeline script exists', () => {
  const filePath = path.join(rootDir, 'scripts', 'coding_pipeline.mjs');
  if (!fs.existsSync(filePath)) {
    throw new Error('coding_pipeline.mjs not found');
  }
});

test('CLI script exists', () => {
  const filePath = path.join(rootDir, 'scripts', 'pipeline_cli.mjs');
  if (!fs.existsSync(filePath)) {
    throw new Error('pipeline_cli.mjs not found');
  }
});

test('Config file exists', () => {
  const filePath = path.join(rootDir, 'pipeline.config.json');
  if (!fs.existsSync(filePath)) {
    throw new Error('pipeline.config.json not found');
  }
});

test('Workflow file exists', () => {
  const filePath = path.join(rootDir, '.github', 'workflows', 'coding_pipeline.yml');
  if (!fs.existsSync(filePath)) {
    throw new Error('coding_pipeline.yml not found');
  }
});

// Test 2: Validate configuration
test('Config is valid JSON', () => {
  const configPath = path.join(rootDir, 'pipeline.config.json');
  const content = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(content);
  
  if (!config.pipeline) throw new Error('Missing pipeline section');
  if (!config.ai_provider) throw new Error('Missing ai_provider section');
  if (!config.defaults) throw new Error('Missing defaults section');
  if (!config.sources) throw new Error('Missing sources section');
});

test('AI provider configuration is valid', () => {
  const configPath = path.join(rootDir, 'pipeline.config.json');
  const content = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(content);
  
  if (!config.ai_provider.primary) throw new Error('Missing primary provider');
  if (!config.ai_provider.providers) throw new Error('Missing providers section');
  
  const primary = config.ai_provider.primary;
  if (!config.ai_provider.providers[primary]) {
    throw new Error(`Primary provider ${primary} not configured`);
  }
  
  // Check that each provider has required fields
  const providers = config.ai_provider.providers;
  for (const [name, settings] of Object.entries(providers)) {
    if (name === 'custom' && !settings.enabled) continue;
    if (!settings.models) throw new Error(`Provider ${name} missing models`);
    if (!settings.models.planning) throw new Error(`Provider ${name} missing planning model`);
    if (!settings.models.coding) throw new Error(`Provider ${name} missing coding model`);
  }
});

test('AI providers module exists', () => {
  const filePath = path.join(rootDir, 'scripts', 'ai_providers.mjs');
  if (!fs.existsSync(filePath)) {
    throw new Error('ai_providers.mjs not found');
  }
});

// Test 3: Check implementations directory
test('Implementations directory exists', () => {
  const dirPath = path.join(rootDir, 'implementations');
  if (!fs.existsSync(dirPath)) {
    throw new Error('implementations directory not found');
  }
});

// Test 4: Test idea parsing (mock)
test('Can parse ideas from AI_IDEAS.md', () => {
  const ideasPath = path.join(rootDir, 'AI_IDEAS.md');
  if (!fs.existsSync(ideasPath)) {
    throw new Error('AI_IDEAS.md not found');
  }
  
  const content = fs.readFileSync(ideasPath, 'utf8');
  if (!content.includes('###')) {
    throw new Error('No ideas found in AI_IDEAS.md');
  }
});

// Test 5: Check data directory and history
test('Data directory structure is correct', () => {
  const dataPath = path.join(rootDir, 'data');
  if (!fs.existsSync(dataPath)) {
    throw new Error('data directory not found');
  }
  
  const titlesPath = path.join(dataPath, 'idea_titles.json');
  if (!fs.existsSync(titlesPath)) {
    throw new Error('idea_titles.json not found');
  }
});

// Test 6: Validate workflow YAML structure
test('Workflow YAML is properly structured', () => {
  const workflowPath = path.join(rootDir, '.github', 'workflows', 'coding_pipeline.yml');
  const content = fs.readFileSync(workflowPath, 'utf8');
  
  if (!content.includes('on:')) throw new Error('Missing workflow triggers');
  if (!content.includes('jobs:')) throw new Error('Missing jobs section');
  if (!content.includes('execute_pipeline:')) throw new Error('Missing pipeline job');
});

// Test 7: Check gitignore
test('Gitignore includes necessary patterns', () => {
  const gitignorePath = path.join(rootDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    throw new Error('.gitignore not found');
  }
  
  const content = fs.readFileSync(gitignorePath, 'utf8');
  if (!content.includes('node_modules')) {
    throw new Error('Missing node_modules pattern');
  }
  if (!content.includes('.env')) {
    throw new Error('Missing .env pattern');
  }
});

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`📊 Test Results:`);
console.log(`   ✅ Passed: ${passedTests}`);
console.log(`   ❌ Failed: ${failedTests}`);
console.log(`   📈 Total:  ${passedTests + failedTests}`);
console.log(`${'='.repeat(50)}\n`);

if (failedTests > 0) {
  console.log('❌ Some tests failed');
  process.exit(1);
} else {
  console.log('✅ All tests passed!');
  process.exit(0);
}