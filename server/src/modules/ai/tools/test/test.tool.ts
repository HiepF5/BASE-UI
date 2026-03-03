import { Injectable } from '@nestjs/common';
import { ExecTool } from '../exec/exec.tool';

// ============================================================
// Test Tool
// Chạy test, parse kết quả
// ============================================================
@Injectable()
export class TestTool {
  constructor(private readonly execTool: ExecTool) {}

  /**
   * Run all tests
   */
  async runAll(cwd?: string): Promise<TestResult> {
    const result = await this.execTool.run('npm test -- --passWithNoTests', { cwd, timeout: 120000 });
    return this.parseResult(result);
  }

  /**
   * Run tests matching a pattern
   */
  async runPattern(pattern: string, cwd?: string): Promise<TestResult> {
    const result = await this.execTool.run(
      `npm test -- --testPathPattern="${pattern}" --passWithNoTests`,
      { cwd, timeout: 120000 },
    );
    return this.parseResult(result);
  }

  /**
   * Run a specific test file
   */
  async runFile(filePath: string, cwd?: string): Promise<TestResult> {
    const result = await this.execTool.run(
      `npx jest "${filePath}" --passWithNoTests`,
      { cwd, timeout: 120000 },
    );
    return this.parseResult(result);
  }

  private parseResult(result: { stdout: string; stderr: string; exitCode: number }): TestResult {
    const output = result.stdout + result.stderr;

    // Parse Jest output
    const passMatch = output.match(/Tests:\s+(\d+)\s+passed/);
    const failMatch = output.match(/Tests:\s+(\d+)\s+failed/);
    const totalMatch = output.match(/Tests:\s+(\d+)\s+total/);

    return {
      passed: passMatch ? parseInt(passMatch[1]) : 0,
      failed: failMatch ? parseInt(failMatch[1]) : 0,
      total: totalMatch ? parseInt(totalMatch[1]) : 0,
      exitCode: result.exitCode,
      output: output.substring(0, 5000), // Truncate
      success: result.exitCode === 0,
    };
  }
}

export interface TestResult {
  passed: number;
  failed: number;
  total: number;
  exitCode: number;
  output: string;
  success: boolean;
}
