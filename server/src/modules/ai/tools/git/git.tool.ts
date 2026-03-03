import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================================
// Git Tool
// Thao tác git: status, diff, commit
// ============================================================
@Injectable()
export class GitTool {
  private cwd: string;

  constructor() {
    this.cwd = process.cwd();
  }

  setCwd(cwd: string) {
    this.cwd = cwd;
  }

  /**
   * git status --porcelain
   */
  async status(): Promise<{ modified: string[]; added: string[]; deleted: string[] }> {
    const { stdout } = await execAsync('git status --porcelain', { cwd: this.cwd });
    const lines = stdout.trim().split('\n').filter(Boolean);

    const modified: string[] = [];
    const added: string[] = [];
    const deleted: string[] = [];

    for (const line of lines) {
      const status = line.substring(0, 2).trim();
      const file = line.substring(3).trim();
      switch (status) {
        case 'M':
          modified.push(file);
          break;
        case 'A':
        case '??':
          added.push(file);
          break;
        case 'D':
          deleted.push(file);
          break;
      }
    }

    return { modified, added, deleted };
  }

  /**
   * git diff (staged or unstaged)
   */
  async diff(staged = false): Promise<string> {
    const cmd = staged ? 'git diff --staged' : 'git diff';
    const { stdout } = await execAsync(cmd, { cwd: this.cwd });
    return stdout;
  }

  /**
   * git add + commit
   */
  async commit(message: string, files: string[] = ['.']): Promise<string> {
    const addCmd = `git add ${files.join(' ')}`;
    await execAsync(addCmd, { cwd: this.cwd });

    const { stdout } = await execAsync(`git commit -m "${message}"`, { cwd: this.cwd });
    return stdout;
  }

  /**
   * git log (recent)
   */
  async log(count = 10): Promise<string> {
    const { stdout } = await execAsync(
      `git log --oneline -n ${count}`,
      { cwd: this.cwd },
    );
    return stdout;
  }
}
