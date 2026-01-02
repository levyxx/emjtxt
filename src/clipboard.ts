/**
 * Clipboard module
 * Handles copying text to system clipboard
 */

import clipboardy from 'clipboardy';

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text for clipboard');
  }

  try {
    await clipboardy.write(text);
  } catch (error) {
    // Handle clipboard access errors gracefully
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to copy to clipboard: ${errorMessage}`);
  }
}

/**
 * Read from clipboard (for testing purposes)
 */
export async function readFromClipboard(): Promise<string> {
  try {
    return await clipboardy.read();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to read from clipboard: ${errorMessage}`);
  }
}

/**
 * Check if clipboard is available
 */
export async function isClipboardAvailable(): Promise<boolean> {
  try {
    // Try to read clipboard - this will fail if not available
    await clipboardy.read();
    return true;
  } catch {
    return false;
  }
}
