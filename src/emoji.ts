/**
 * Emoji handling module
 * Resolves emoji aliases and handles direct emoji input
 */

import * as nodeEmoji from 'node-emoji';

// Common emoji aliases mapping (subset for fallback)
const CUSTOM_ALIASES: Record<string, string> = {
  // Colored squares for themes
  'green_square': '🟩',
  'white_square': '⬜',
  'black_square': '⬛',
  'red_square': '🟥',
  'blue_square': '🟦',
  'yellow_square': '🟨',
  'orange_square': '🟧',
  'purple_square': '🟪',
  'brown_square': '🟫',
  // Common emojis
  'star': '⭐',
  'fire': '🔥',
  'heart': '❤️',
  'smile': '😊',
  'rocket': '🚀',
  'check': '✅',
  'x': '❌',
  'warning': '⚠️',
  'sparkles': '✨',
  'thumbsup': '👍',
  'thumbs_up': '👍',
  'clap': '👏',
  'wave': '👋',
  'eyes': '👀',
  'thinking': '🤔',
  'party': '🎉',
  'tada': '🎉',
  'sun': '☀️',
  'moon': '🌙',
  'cloud': '☁️',
  'rain': '🌧️',
  'snow': '❄️',
  'tree': '🌳',
  'flower': '🌸',
  'muscle': '💪',
  'coffee': '☕',
  'beer': '🍺',
  'pizza': '🍕',
  'apple': '🍎',
  'banana': '🍌',
  'cat': '🐱',
  'dog': '🐶',
  'bird': '🐦',
  'fish': '🐟',
  'bug': '🐛',
  'ghost': '👻',
  'alien': '👽',
  'robot': '🤖',
  'skull': '💀',
  'poop': '💩',
  '100': '💯',
  'money': '💰',
  'gem': '💎',
  'crown': '👑',
  'trophy': '🏆',
  'medal': '🏅',
  'flag': '🚩',
  'pin': '📌',
  'bell': '🔔',
  'key': '🔑',
  'lock': '🔒',
  'bulb': '💡',
  'book': '📚',
  'pencil': '✏️',
  'scissors': '✂️',
  'hammer': '🔨',
  'wrench': '🔧',
  'gear': '⚙️',
  'link': '🔗',
  'bomb': '💣',
  'zap': '⚡',
  'dizzy': '💫',
  'boom': '💥',
  'droplet': '💧',
  'leaves': '🍃',
  'cactus': '🌵',
  'palm': '🌴',
  'maple': '🍁',
  'cherry_blossom': '🌸',
  'rose': '🌹',
  'tulip': '🌷',
  'sunflower': '🌻',
};

/**
 * Check if a string is an emoji (contains emoji characters)
 */
function isEmoji(str: string): boolean {
  // Emoji regex pattern - covers most common emoji ranges
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{2934}-\u{2935}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]|[\u{FE00}-\u{FE0F}]|[\u{200D}]/u;
  return emojiRegex.test(str);
}

/**
 * Remove colons from alias if present
 * :fire: -> fire
 * fire -> fire
 */
function normalizeAlias(alias: string): string {
  return alias.replace(/^:/, '').replace(/:$/, '').trim();
}

/**
 * Resolve an emoji input to an actual emoji character
 * Supports:
 * - Direct emoji: 🔥
 * - Alias with colons: :fire:
 * - Alias without colons: fire
 */
export function resolveEmoji(input: string): string {
  const trimmed = input.trim();

  // If it's already an emoji, return as is
  if (isEmoji(trimmed)) {
    return trimmed;
  }

  // Normalize the alias (remove colons if present)
  const alias = normalizeAlias(trimmed);

  // Try node-emoji first
  const resolved = nodeEmoji.get(alias);
  if (resolved && resolved !== `:${alias}:`) {
    return resolved;
  }

  // Try custom aliases
  if (CUSTOM_ALIASES[alias]) {
    return CUSTOM_ALIASES[alias];
  }

  // Try with underscores replaced by different variations
  const variations = [
    alias,
    alias.replace(/-/g, '_'),
    alias.replace(/_/g, '-'),
    alias.toLowerCase(),
    alias.toUpperCase(),
  ];

  for (const variant of variations) {
    const result = nodeEmoji.get(variant);
    if (result && result !== `:${variant}:`) {
      return result;
    }
    if (CUSTOM_ALIASES[variant]) {
      return CUSTOM_ALIASES[variant];
    }
  }

  // If nothing found, return the input (it might be a custom character)
  // But warn the user
  console.warn(`Warning: Could not resolve emoji "${input}", using as-is`);
  return trimmed;
}

/**
 * Parse comma-separated emoji input into array of resolved emojis
 */
export function parseEmojis(input: string): string[] {
  if (!input || typeof input !== 'string') {
    throw new Error('Emoji input is required');
  }

  const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
  
  if (parts.length === 0) {
    throw new Error('At least one emoji is required');
  }

  return parts.map(resolveEmoji);
}

/**
 * Get a default background emoji (empty space with proper width)
 */
export function getBackgroundEmoji(): string {
  // Use a full-width space to keep alignment when no background is provided
  return '　';
}

/**
 * Validate that the resolved emoji is valid
 */
export function validateEmoji(emoji: string): boolean {
  return emoji.length > 0;
}
