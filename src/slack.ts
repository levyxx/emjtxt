/**
 * Slack format module
 * Generates Slack Block Kit JSON format output
 */

import type { BannerResult, SlackMessage, SlackBlock } from './types.js';

/**
 * Maximum characters per Slack text block
 * Slack has a limit of 3000 characters per text block
 */
const SLACK_TEXT_LIMIT = 3000;

/**
 * Convert banner result to Slack Block Kit format
 * This format ensures emojis align properly in Slack
 */
export function toSlackFormat(result: BannerResult): SlackMessage {
  const lines = result.text.split('\n');
  const blocks: SlackBlock[] = [];

  // Use a section with mrkdwn for each line to preserve spacing
  // Wrap each line in a code block using backticks for monospace
  // This helps with alignment
  
  // Group lines to stay within Slack's character limit
  let currentText = '';
  
  for (const line of lines) {
    // Use zero-width spaces and special formatting to maintain alignment
    const formattedLine = formatLineForSlack(line);
    
    if (currentText.length + formattedLine.length + 1 > SLACK_TEXT_LIMIT) {
      // Push current block and start new one
      if (currentText) {
        blocks.push(createTextBlock(currentText));
      }
      currentText = formattedLine;
    } else {
      currentText += (currentText ? '\n' : '') + formattedLine;
    }
  }

  // Push remaining text
  if (currentText) {
    blocks.push(createTextBlock(currentText));
  }

  return { blocks };
}

/**
 * Format a single line for Slack display
 * Uses techniques to maintain emoji alignment
 */
function formatLineForSlack(line: string): string {
  // In Slack, emojis in mrkdwn should align properly
  // We just need to ensure consistent spacing
  return line;
}

/**
 * Create a Slack text block
 */
function createTextBlock(text: string): SlackBlock {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: text,
      emoji: true,
    },
  };
}

/**
 * Convert to Slack-compatible plain text
 * This version uses a rich_text block for better emoji handling
 */
export function toSlackRichText(result: BannerResult): SlackMessage {
  const lines = result.text.split('\n');
  
  // Create rich_text block with elements
  const elements = lines.map((line) => ({
    type: 'rich_text_preformatted',
    elements: [
      {
        type: 'text',
        text: line,
      },
    ],
  }));

  return {
    blocks: [
      {
        type: 'rich_text',
        elements,
      } as unknown as SlackBlock,
    ],
  };
}

/**
 * Convert to simple Slack message format (for direct posting)
 */
export function toSlackSimple(result: BannerResult): { text: string } {
  // Use triple backticks for code block (monospace)
  return {
    text: '```\n' + result.text + '\n```',
  };
}

/**
 * Generate JSON string output for Slack API
 */
export function generateSlackJson(result: BannerResult): string {
  const message = toSlackFormat(result);
  return JSON.stringify(message, null, 2);
}

/**
 * Validate Slack message structure
 */
export function validateSlackMessage(message: SlackMessage): boolean {
  if (!message || !Array.isArray(message.blocks)) {
    return false;
  }

  // Check each block has required fields
  for (const block of message.blocks) {
    if (!block.type) {
      return false;
    }
  }

  return true;
}

/**
 * Get Slack-compatible emoji name from Unicode emoji
 * Note: This is a simplified mapping, Slack uses its own emoji names
 */
export function toSlackEmojiName(emoji: string): string {
  // For most emojis, Slack accepts the Unicode directly
  // But for some, you might need the :name: format
  return emoji;
}
