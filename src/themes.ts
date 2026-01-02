/**
 * Theme module
 * Provides themed emoji sets for different visual styles
 */

import type { Theme, GitHubLevel } from './types.js';

/**
 * GitHub contribution graph colors using square emojis
 * Level 0 = no contribution (background)
 * Level 1-4 = increasing intensity
 */
const GITHUB_THEME_EMOJIS: Record<GitHubLevel, string> = {
  0: '⬜', // Background / no contribution
  1: '🟩', // Light green (low contribution)
  2: '🟩', // Medium-light green
  3: '🟩', // Medium-dark green  
  4: '🟩', // Dark green (high contribution)
};

// Alternative GitHub theme with different shades using Unicode blocks
const GITHUB_THEME_BLOCKS: string[] = [
  '⬜', // Level 0 - empty
  '🟩', // Level 1 - lightest green
  '🟩', // Level 2
  '🟩', // Level 3
  '🟩', // Level 4 - darkest green
];

/**
 * Available themes
 */
const THEMES: Record<Theme, string[]> = {
  default: ['🔥'], // Single default emoji
  github: GITHUB_THEME_BLOCKS,
};

/**
 * Get emojis for a specific theme
 */
export function getThemeEmojis(theme: Theme): string[] {
  return THEMES[theme] || THEMES.default;
}

/**
 * Get background emoji for a theme
 */
export function getThemeBackground(theme: Theme): string {
  if (theme === 'github') {
    return '⬜'; // White square for GitHub theme background
  }
  return '  '; // Default: double space
}

/**
 * Check if a theme is valid
 */
export function isValidTheme(theme: string): theme is Theme {
  return theme in THEMES;
}

/**
 * Get all available theme names
 */
export function getAvailableThemes(): Theme[] {
  return Object.keys(THEMES) as Theme[];
}

/**
 * GitHub theme intensity calculator
 * Returns 1-4 for foreground pixels with varying intensity
 */
export function getGitHubIntensity(
  row: number,
  col: number,
  seed: number = 0
): GitHubLevel {
  // Simple deterministic pseudo-random based on position
  const hash = (row * 31 + col * 17 + seed) % 100;
  
  if (hash < 20) return 1;
  if (hash < 45) return 2;
  if (hash < 75) return 3;
  return 4;
}

/**
 * Get description for a theme
 */
export function getThemeDescription(theme: Theme): string {
  const descriptions: Record<Theme, string> = {
    default: 'Default theme - uses specified emoji',
    github: 'GitHub contribution graph style with green squares',
  };
  return descriptions[theme] || 'Unknown theme';
}
