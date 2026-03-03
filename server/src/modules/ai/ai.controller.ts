import { Controller, Post, Body, Get } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /api/ai/execute
   * Nhận yêu cầu từ user, AI xử lý và trả về kết quả + proposed changes
   */
  @Post('execute')
  async execute(
    @Body() body: { userInput: string; preferredSkillId?: string; mode?: string },
  ) {
    return this.aiService.execute(body.userInput, body.preferredSkillId);
  }

  /**
   * POST /api/ai/apply
   * Apply các file changes đã được user confirm
   */
  @Post('apply')
  async apply(
    @Body()
    body: {
      changes: Array<{
        filePath: string;
        action: 'create' | 'update' | 'delete';
        content?: string;
      }>;
    },
  ) {
    return this.aiService.applyChanges(body.changes);
  }

  /**
   * GET /api/ai/context
   * Lấy context hiện tại (tech stack, conventions, modules đã generate)
   */
  @Get('context')
  async getContext() {
    return this.aiService.getContext();
  }

  /**
   * GET /api/ai/skills
   * Lấy danh sách skills available
   */
  @Get('skills')
  async getSkills() {
    return this.aiService.getSkills();
  }
}
