import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { AiChatResponse } from '@g-hub/shared';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('chat')
  chat(@Body() dto: ChatDto): Promise<AiChatResponse> {
    return this.ai.chat(dto.messages);
  }
}
