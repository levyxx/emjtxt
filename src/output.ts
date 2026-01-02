/**
 * Output module
 * Handles file output
 */

import fs from 'fs/promises';
import path from 'path';
import type { BannerResult } from './types.js';

/**
 * Sanitize filename to prevent path traversal attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove path traversal characters and other dangerous patterns
  return filename
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*]/g, '')
    .replace(/^\.+/, '')
    .trim();
}

/**
 * Validate and resolve output path safely
 */
async function validateOutputPath(outputPath: string): Promise<string> {
  // Resolve to absolute path
  const absolutePath = path.resolve(outputPath);
  
  // Check if directory exists, create if not
  const dir = path.dirname(absolutePath);
  
  try {
    await fs.access(dir);
  } catch {
    // Create directory recursively
    await fs.mkdir(dir, { recursive: true });
  }
  
  return absolutePath;
}

/**
 * Save banner result to text file
 */
export async function saveToFile(
  result: BannerResult,
  outputDir: string,
  filename: string = 'banner.txt'
): Promise<string> {
  const sanitizedFilename = sanitizeFilename(filename);
  
  if (!sanitizedFilename) {
    throw new Error('Invalid filename');
  }

  const fullPath = path.join(outputDir, sanitizedFilename);
  const validatedPath = await validateOutputPath(fullPath);
  
  // Ensure we're not writing outside the intended directory
  const resolvedDir = path.resolve(outputDir);
  if (!validatedPath.startsWith(resolvedDir)) {
    throw new Error('Invalid output path: path traversal detected');
  }

  await fs.writeFile(validatedPath, result.text, 'utf-8');
  
  return validatedPath;
}

/**
 * Save raw banner text
 */
export async function saveRawText(
  text: string,
  outputPath: string
): Promise<string> {
  const sanitizedFilename = sanitizeFilename(path.basename(outputPath));
  const dir = path.dirname(outputPath);
  const fullPath = path.join(dir, sanitizedFilename);
  const validatedPath = await validateOutputPath(fullPath);

  await fs.writeFile(validatedPath, text, 'utf-8');
  
  return validatedPath;
}

/**
 * Check if a path is writable
 */
export async function isWritable(dirPath: string): Promise<boolean> {
  try {
    const testFile = path.join(dirPath, `.write-test-${Date.now()}`);
    await fs.writeFile(testFile, '');
    await fs.unlink(testFile);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Generate unique filename if file exists
 */
export async function getUniqueFilename(
  dirPath: string,
  baseName: string,
  extension: string
): Promise<string> {
  const sanitizedBase = sanitizeFilename(baseName);
  let filename = `${sanitizedBase}.${extension}`;
  let counter = 1;

  while (true) {
    try {
      await fs.access(path.join(dirPath, filename));
      // File exists, try next number
      filename = `${sanitizedBase}-${counter}.${extension}`;
      counter++;
      
      // Safety limit
      if (counter > 1000) {
        throw new Error('Too many files with same name');
      }
    } catch {
      // File doesn't exist, we can use this name
      return filename;
    }
  }
}
