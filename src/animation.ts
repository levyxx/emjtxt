/**
 * Animation module
 * Handles marquee-style scrolling animation in terminal
 */

import type { AnimationConfig } from './types.js';

// ANSI escape codes for terminal control
const ANSI = {
  CLEAR_LINE: '\x1b[2K',
  CURSOR_TO_START: '\x1b[0G',
  HIDE_CURSOR: '\x1b[?25l',
  SHOW_CURSOR: '\x1b[?25h',
  MOVE_UP: (n: number) => `\x1b[${n}A`,
  CLEAR_SCREEN: '\x1b[2J',
  CURSOR_HOME: '\x1b[H',
};

/**
 * Default animation configuration
 */
const DEFAULT_CONFIG: AnimationConfig = {
  speed: 100, // milliseconds per frame
  terminalWidth: process.stdout.columns || 80,
};

/**
 * Get visible width of a string (accounting for emoji width)
 */
function getVisibleWidth(str: string): number {
  // Emojis typically take 2 character widths
  // This is a simplified calculation
  let width = 0;
  for (const char of str) {
    const code = char.codePointAt(0) || 0;
    // Check if it's likely an emoji (simplified check)
    if (code > 0x1F300) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

/**
 * Pad string to specified visible width
 */
function padToWidth(str: string, targetWidth: number, padChar: string = ' '): string {
  const currentWidth = getVisibleWidth(str);
  if (currentWidth >= targetWidth) {
    return str;
  }
  const padCount = targetWidth - currentWidth;
  return str + padChar.repeat(padCount);
}

/**
 * Extract a visible substring with emoji support
 */
function visibleSubstring(str: string, start: number, length: number): string {
  const chars = [...str]; // Properly split including emojis
  let currentPos = 0;
  let result = '';
  let resultWidth = 0;

  for (const char of chars) {
    const charWidth = getVisibleWidth(char);
    
    // Skip characters before start
    if (currentPos + charWidth <= start) {
      currentPos += charWidth;
      continue;
    }

    // Check if we've collected enough
    if (resultWidth >= length) {
      break;
    }

    result += char;
    resultWidth += charWidth;
    currentPos += charWidth;
  }

  return result;
}

/**
 * Run marquee animation for multi-line banner
 */
export async function runAnimation(
  bannerText: string,
  config: Partial<AnimationConfig> = {}
): Promise<void> {
  const { speed, terminalWidth } = { ...DEFAULT_CONFIG, ...config };
  
  const lines = bannerText.split('\n');
  const bannerHeight = lines.length;
  
  // Get the maximum width of the banner
  const maxBannerWidth = Math.max(...lines.map(getVisibleWidth));
  
  // Pad all lines to the same width
  const paddedLines = lines.map((line) => padToWidth(line, maxBannerWidth));
  
  // Total scroll distance (screen width + banner width)
  const totalFrames = terminalWidth + maxBannerWidth;
  
  // Hide cursor and setup
  process.stdout.write(ANSI.HIDE_CURSOR);
  
  // Handle cleanup on exit
  const cleanup = () => {
    process.stdout.write(ANSI.SHOW_CURSOR);
    process.stdout.write('\n');
  };
  
  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });

  try {
    let frame = 0;
    
    // Animation loop
    while (true) {
      // Calculate scroll offset (starts from right, moves left)
      const offset = terminalWidth - frame;
      
      // Clear and redraw each line
      for (let i = 0; i < bannerHeight; i++) {
        const line = paddedLines[i];
        
        let displayLine = '';
        
        if (offset >= 0) {
          // Banner is still entering from the right
          displayLine = ' '.repeat(offset) + visibleSubstring(line, 0, terminalWidth - offset);
        } else {
          // Banner is scrolling through
          const startPos = -offset;
          displayLine = visibleSubstring(line, startPos, terminalWidth);
        }
        
        // Pad to terminal width to clear any leftover characters
        displayLine = padToWidth(displayLine, terminalWidth);
        
        process.stdout.write(ANSI.CLEAR_LINE + displayLine);
        
        if (i < bannerHeight - 1) {
          process.stdout.write('\n');
        }
      }
      
      // Move cursor back to start of banner
      if (bannerHeight > 1) {
        process.stdout.write(ANSI.MOVE_UP(bannerHeight - 1));
      }
      process.stdout.write(ANSI.CURSOR_TO_START);
      
      // Wait for next frame
      await sleep(speed);
      
      // Advance frame
      frame = (frame + 1) % totalFrames;
    }
  } finally {
    cleanup();
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run a single scroll cycle (for testing)
 */
export async function runSingleCycle(
  bannerText: string,
  config: Partial<AnimationConfig> = {}
): Promise<void> {
  const { speed, terminalWidth } = { ...DEFAULT_CONFIG, ...config };
  
  const lines = bannerText.split('\n');
  const maxBannerWidth = Math.max(...lines.map(getVisibleWidth));
  const paddedLines = lines.map((line) => padToWidth(line, maxBannerWidth));
  const totalFrames = terminalWidth + maxBannerWidth;
  const bannerHeight = lines.length;

  process.stdout.write(ANSI.HIDE_CURSOR);

  try {
    for (let frame = 0; frame < totalFrames; frame++) {
      const offset = terminalWidth - frame;
      
      for (let i = 0; i < bannerHeight; i++) {
        const line = paddedLines[i];
        
        let displayLine = '';
        
        if (offset >= 0) {
          displayLine = ' '.repeat(offset) + visibleSubstring(line, 0, terminalWidth - offset);
        } else {
          const startPos = -offset;
          displayLine = visibleSubstring(line, startPos, terminalWidth);
        }
        
        displayLine = padToWidth(displayLine, terminalWidth);
        
        process.stdout.write(ANSI.CLEAR_LINE + displayLine);
        
        if (i < bannerHeight - 1) {
          process.stdout.write('\n');
        }
      }
      
      if (bannerHeight > 1) {
        process.stdout.write(ANSI.MOVE_UP(bannerHeight - 1));
      }
      process.stdout.write(ANSI.CURSOR_TO_START);
      
      await sleep(speed);
    }
  } finally {
    process.stdout.write(ANSI.SHOW_CURSOR);
    process.stdout.write('\n'.repeat(bannerHeight));
  }
}
