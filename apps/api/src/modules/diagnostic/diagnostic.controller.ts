import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { DiagnosticService } from './diagnostic.service';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Adaptive Diagnostic Assessment (CAT / IRT)')
@Controller('diagnostic')
@UseGuards(AuthGuard, RolesGuard)
@ApiCookieAuth()
export class DiagnosticController {
  constructor(private readonly diagnosticService: DiagnosticService) {}

  @Post('start')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Bắt đầu hoặc khôi phục phiên làm bài kiểm tra chẩn đoán năng lực' })
  @ApiResponse({ status: 201, description: 'Phiên làm bài và câu hỏi đầu tiên' })
  async startAttempt(@CurrentUser('id') studentId: string) {
    return this.diagnosticService.startAttempt(studentId);
  }

  @Post('answer')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Nộp câu trả lời cho một câu hỏi (cập nhật thích ứng theta và chọn câu tiếp theo)' })
  @ApiResponse({ status: 200, description: 'Kết quả câu vừa làm và câu hỏi tiếp theo' })
  async answerQuestion(
    @CurrentUser('id') studentId: string,
    @Body() dto: AnswerQuestionDto
  ) {
    return this.diagnosticService.answerQuestion(studentId, dto);
  }

  @Post('submit/:attemptId')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Hoàn tất và nộp toàn bộ bài chẩn đoán (đồng bộ năng lực & nạp sổ lỗi sai)' })
  @ApiResponse({ status: 200, description: 'Tổng kết kết quả bài chẩn đoán' })
  async submitAttempt(
    @CurrentUser('id') studentId: string,
    @Param('attemptId') attemptId: string
  ) {
    return this.diagnosticService.submitAttempt(studentId, attemptId);
  }

  @Get('results/:attemptId')
  @ApiOperation({ summary: 'Xem chi tiết kết quả và phân tích bài chẩn đoán đã hoàn thành' })
  @ApiResponse({ status: 200, description: 'Báo cáo chi tiết bài làm' })
  async getAttemptResult(
    @CurrentUser('id') studentId: string,
    @Param('attemptId') attemptId: string
  ) {
    return this.diagnosticService.getAttemptResult(studentId, attemptId);
  }
}
