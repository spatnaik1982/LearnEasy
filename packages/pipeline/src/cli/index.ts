#!/usr/bin/env node

import { existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { createLlmProvider } from '@learn-easy/llm-config';
import { runPipeline } from '../graph';
import type { PipelineReport } from '../graph';
import * as logger from './logger';

config();

const LEVEL_A_CONCEPT_IDS = [
  'counting_1_10',
  'number_recognition_1_10',
  'comparing_quantities',
  'basic_shapes',
  'position_words',
  'addition_1_10',
  'subtraction_1_10',
];

interface CLIOptions {
  pdf: string;
  level: string;
  subject: string;
  force: boolean;
  llmProvider?: string;
  llmModel?: string;
  interactive: boolean;
  dryRun: boolean;
  verbose: boolean;
  outputDir: string;
  maxRetries: number;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    pdf: '',
    level: 'B',
    subject: 'math',
    force: false,
    interactive: false,
    dryRun: false,
    verbose: false,
    outputDir: join(process.cwd(), 'curriculum'),
    maxRetries: 3,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--pdf':
        options.pdf = args[++i] || '';
        break;
      case '--level':
        options.level = args[++i] || 'B';
        break;
      case '--subject':
        options.subject = args[++i] || 'math';
        break;
      case '--force':
        options.force = true;
        break;
      case '--llm-provider':
        options.llmProvider = args[++i];
        break;
      case '--llm-model':
        options.llmModel = args[++i];
        break;
      case '--interactive':
        options.interactive = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--output-dir':
        options.outputDir = args[++i] || options.outputDir;
        break;
      case '--max-retries':
        options.maxRetries = parseInt(args[++i] || '3', 10);
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
LearnEasy Curriculum Generator v1.0

Usage: curriculum:generate [options]

Options:
  --pdf <path>          Path to the PDF file (required)
  --level <code>        Level code (default: B)
  --subject <name>      Subject name (default: math)
  --force               Overwrite existing YAML files
  --llm-provider <name> LLM provider override (default: from env)
  --llm-model <name>    LLM model override (default: from env)
  --interactive         Enable human-in-the-loop checkpoints
  --dry-run             Validate but don't write files
  --verbose             Detailed logging per stage
  --output-dir <path>   Custom output directory (default: ./curriculum)
  --max-retries <num>   Max retries per concept (default: 3)
  --help, -h            Show this help message

Examples:
  pnpm curriculum:generate --pdf ./math-level-b.pdf --level B --subject math
  pnpm curriculum:generate --pdf ./math-level-b.pdf --verbose --dry-run
`);
}

function validateArgs(options: CLIOptions): string[] {
  const errors: string[] = [];

  if (!options.pdf) {
    errors.push('Missing required option: --pdf <path>');
  } else if (!existsSync(options.pdf)) {
    errors.push(`PDF file not found: ${options.pdf}`);
  } else if (!options.pdf.toLowerCase().endsWith('.pdf')) {
    errors.push(`File is not a PDF: ${options.pdf}`);
  }

  if (!options.level.match(/^[a-zA-Z0-9]+$/)) {
    errors.push('Level must be alphanumeric (e.g., B, C)');
  }

  if (!options.subject.match(/^[a-z]+$/)) {
    errors.push('Subject must be lowercase letters (e.g., math, language)');
  }

  return errors;
}

export async function runPipelineCLI(): Promise<void> {
  const options = parseArgs();

  logger.divider();
  logger.info('LearnEasy Curriculum Generator v1.0');
  logger.divider();
  logger.info(`PDF:      ${options.pdf || '(not specified)'}`);
  logger.info(`Level:    ${options.level}`);
  logger.info(`Subject:  ${options.subject.charAt(0).toUpperCase() + options.subject.slice(1)}`);
  logger.info(`Output:   ${options.outputDir}`);
  if (options.dryRun) logger.info('Mode:     Dry run (no files written)');

  const validationErrors = validateArgs(options);
  if (validationErrors.length > 0) {
    logger.error('Validation errors:');
    for (const err of validationErrors) {
      logger.error(`  ${err}`);
    }
    printHelp();
    process.exit(1);
  }

  logger.info('');

  let llm;
  try {
    llm = createLlmProvider(
      options.llmProvider
        ? { ...require('@learn-easy/llm-config').loadConfig(), provider: options.llmProvider, model: options.llmModel || 'gpt-4o-mini' }
        : undefined,
    );
    logger.success('LLM provider initialized');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to initialize LLM provider: ${msg}`);
    process.exit(1);
  }

  try {
    const report: PipelineReport = await runPipeline(llm, {
      pdfPath: options.pdf,
      levelCode: options.level.toUpperCase(),
      subject: options.subject,
      force: options.force,
      outputDir: options.outputDir,
      llmProvider: options.llmProvider || process.env.LLM_PROVIDER || 'openai',
      llmModel: options.llmModel || process.env.LLM_MODEL || 'gpt-4o-mini',
      interactive: options.interactive,
      dryRun: options.dryRun,
      verbose: options.verbose,
      maxRetries: options.maxRetries,
      levelAConceptIds: LEVEL_A_CONCEPT_IDS,
    });

    logger.divider();
    logger.info('Summary');
    logger.divider();

    logger.reportTable([
      { label: 'Chapters Processed', value: report.chaptersProcessed, status: report.chaptersProcessed > 0 ? 'ok' : 'fail' },
      { label: 'Concepts Generated', value: report.conceptsGenerated, status: report.conceptsGenerated > 0 ? 'ok' : 'fail' },
      { label: 'Activities Generated', value: report.activitiesGenerated, status: report.activitiesGenerated > 0 ? 'ok' : 'fail' },
      { label: 'YAML Files Written', value: report.filesWritten, status: report.status !== 'failed' ? 'ok' : 'fail' },
      { label: 'Files Skipped', value: report.filesSkipped, status: report.filesSkipped === 0 ? 'ok' : 'warn' },
      { label: 'Validation Errors', value: report.validationErrors, status: report.validationErrors === 0 ? 'ok' : 'fail' },
      { label: 'Retries Needed', value: report.retriesNeeded, status: 'warn' },
      { label: 'Failed Concepts', value: report.failedConcepts, status: report.failedConcepts === 0 ? 'ok' : 'fail' },
    ]);

    const durationSec = (report.duration / 1000).toFixed(1);
    logger.info(`Done in ${durationSec}s`);

    if (report.errors.length > 0) {
      logger.error(`\nErrors (${report.errors.length}):`);
      for (const err of report.errors) {
        logger.error(`  • ${err}`);
      }
    }

    if (report.warnings.length > 0) {
      logger.warn(`\nWarnings (${report.warnings.length}):`);
      for (const w of report.warnings.slice(0, 10)) {
        logger.warn(`  • ${w}`);
      }
      if (report.warnings.length > 10) {
        logger.warn(`  ... and ${report.warnings.length - 10} more`);
      }
    }

    process.exit(report.status === 'complete' ? 0 : 1);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Pipeline failed: ${msg}`);
    process.exit(1);
  }
}

if (require.main === module) {
  runPipelineCLI();
}
