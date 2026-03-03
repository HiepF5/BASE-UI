import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================================
// Exec Tool
// Chạy CLI command an toàn (whitelist, timeout)
// ============================================================
@Injectable()
export class ExecTool {
  private cwd: string;
  private readonly TIMEOUT = 30000; // 30s
  private readonly BLOCKED_CMDS = [
    'rm -rf /',
    'format',
    'shutdown',
    'reboot',
    'del /s',
    ':(){',
    'mkfs',
  ];

  constructor() {
    this.cwd = process.cwd();
  }

  setCwd(cwd: string) {
    this.cwd = cwd;
  }

  /**
   * Execute a shell command safely
   */
  async run(
    command: string,
    options: { cwd?: string; timeout?: number } = {},
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    this.validateCommand(command);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: options.cwd || this.cwd,
        timeout: options.timeout || this.TIMEOUT,
        maxBuffer: 1024 * 1024, // 1MB
      });
      return { stdout, stderr, exitCode: 0 };
    } catch (error: any) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1,
      };
    }
  }

  /**
   * npm install
   */
  async npmInstall(packages: string[], dev = false): Promise<string> {
    const flag = dev ? '--save-dev' : '';
    const cmd = `npm install ${packages.join(' ')} ${flag}`.trim();
    const result = await this.run(cmd);
    return result.stdout || result.stderr;
  }

  /**
   * npm run <script>
   */
  async npmRun(script: string): Promise<{ stdout: string; stderr: string }> {
    return this.run(`npm run ${script}`);
  }

  private validateCommand(command: string): void {
    const lower = command.toLowerCase();
    for (const blocked of this.BLOCKED_CMDS) {
      if (lower.includes(blocked)) {
        throw new Error(`Blocked dangerous command: ${command}`);
      }
    }
  }
}
