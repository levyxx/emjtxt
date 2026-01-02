#!/usr/bin/env node

/**
 * Emoji Banner Generator
 * Convert text to emoji banner art for CLI display
 */

import { createCLI, parseCLIOptions, validateOptions } from './cli.js';
import { textToBitmap } from './bitmap.js';
import { parseEmojis, resolveEmoji } from './emoji.js';
import { renderBitmap, createDefaultConfig } from './renderer.js';
import { runAnimation } from './animation.js';
import { saveToFile } from './output.js';
import { copyToClipboard } from './clipboard.js';
import { generateSlackJson } from './slack.js';
import { getThemeBackground } from './themes.js';
import type { BannerResult, CLIOptions } from './types.js';

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    // Create and parse CLI
    const program = createCLI();
    program.parse(process.argv);

    // Parse and validate options
    const options = await parseCLIOptions(program);
    validateOptions(options);

    // Generate the banner
    const result = await generateBanner(options);

    // Handle output based on options
    await handleOutput(result, options);
  } catch (error) {
    handleError(error);
    process.exit(1);
  }
}

/**
 * Generate emoji banner from options
 */
async function generateBanner(options: CLIOptions): Promise<BannerResult> {
  const text = options.text!;
  
  // Parse emojis (supports comma-separated multiple emojis)
  const foregroundEmojis = parseEmojis(options.emoji);
  
  // Parse background emoji if provided
  const backgroundEmoji = options.background
    ? resolveEmoji(options.background)
    : options.theme === 'github'
      ? getThemeBackground('github')
      : undefined;

  // Convert text to bitmap
  const bitmap = await textToBitmap(text, options.font);

  // Create render config
  const config = createDefaultConfig(
    foregroundEmojis,
    backgroundEmoji,
    options.mode,
    options.theme
  );

  // Render bitmap to emoji text
  const result = renderBitmap(bitmap, config);

  return result;
}

/**
 * Handle all output operations based on options
 */
async function handleOutput(
  result: BannerResult,
  options: CLIOptions
): Promise<void> {
  let outputText = result.text;

  // Format output if needed
  if (options.format === 'slack') {
    outputText = generateSlackJson(result);
  }

  // Handle file output
  if (options.output) {
    const filename = options.format === 'slack' ? 'banner.json' : 'banner.txt';
    const savedPath = await saveToFile(result, options.output, filename);
    console.log(`✅ Saved to: ${savedPath}`);
  }

  // Handle clipboard copy
  if (options.copy) {
    try {
      await copyToClipboard(outputText);
      console.log('📋 Copied to clipboard!');
    } catch (error) {
      console.warn('⚠️  Could not copy to clipboard:', 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Handle animation or standard output
  if (options.animate && options.format !== 'slack') {
    // Show banner info first
    console.log(`\n🎬 Starting animation (Ctrl+C to stop)...\n`);
    
    // Run animation
    await runAnimation(result.text, {
      speed: options.speed,
      terminalWidth: process.stdout.columns || 80,
    });
  } else {
    // Print result to stdout
    console.log('\n' + outputText + '\n');
  }
}

/**
 * Handle errors with user-friendly messages
 */
function handleError(error: unknown): void {
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('Text is required')) {
      console.error('❌ Error:', error.message);
      console.error('\nUsage: emoji-banner <text> -e <emoji>');
      console.error('       emoji-banner --help for more information');
    } else if (error.message.includes('Invalid')) {
      console.error('❌ Validation Error:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
  } else {
    console.error('❌ An unexpected error occurred');
  }
}

// Run main function
main();
