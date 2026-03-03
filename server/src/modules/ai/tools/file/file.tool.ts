import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

// ============================================================
// File Tool
// Đọc, ghi, xóa, list file/folder an toàn
// ============================================================
@Injectable()
export class FileTool {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  setProjectRoot(root: string) {
    this.projectRoot = root;
  }

  /**
   * Read file content
   */
  async readFile(filePath: string): Promise<string> {
    const resolvedPath = this.resolve(filePath);
    this.validatePath(resolvedPath);
    return fs.readFile(resolvedPath, 'utf-8');
  }

  /**
   * Write file (create dirs if needed)
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    const resolvedPath = this.resolve(filePath);
    this.validatePath(resolvedPath);
    await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
    await fs.writeFile(resolvedPath, content, 'utf-8');
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    const resolvedPath = this.resolve(filePath);
    this.validatePath(resolvedPath);
    await fs.unlink(resolvedPath);
  }

  /**
   * List directory contents
   */
  async listDir(dirPath: string): Promise<string[]> {
    const resolvedPath = this.resolve(dirPath);
    this.validatePath(resolvedPath);
    const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
    return entries.map((e) => (e.isDirectory() ? `${e.name}/` : e.name));
  }

  /**
   * Ensure directory exists
   */
  async ensureDir(dirPath: string): Promise<void> {
    const resolvedPath = this.resolve(dirPath);
    this.validatePath(resolvedPath);
    await fs.mkdir(resolvedPath, { recursive: true });
  }

  /**
   * Check if file/dir exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      const resolvedPath = this.resolve(filePath);
      await fs.access(resolvedPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read JSON file
   */
  async readJson<T = any>(filePath: string): Promise<T> {
    const content = await this.readFile(filePath);
    return JSON.parse(content);
  }

  /**
   * Write JSON file
   */
  async writeJson(filePath: string, data: any): Promise<void> {
    await this.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  private resolve(filePath: string): string {
    if (path.isAbsolute(filePath)) return filePath;
    return path.join(this.projectRoot, filePath);
  }

  /**
   * Block path traversal (e.g. ../../etc/passwd)
   */
  private validatePath(resolvedPath: string): void {
    const normalized = path.normalize(resolvedPath);
    if (!normalized.startsWith(this.projectRoot)) {
      throw new Error(`Path traversal detected: ${resolvedPath}`);
    }
  }
}
