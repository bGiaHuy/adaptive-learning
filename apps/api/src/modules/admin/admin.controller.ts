import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ReviewTeacherDto } from './dto/review-teacher.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ReviewQuestionDto } from './dto/review-question.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, QuestionStatus } from '@prisma/client';

@ApiTags('Admin, Content Workflow & Governance')
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Xem tổng quan thống kê số liệu toàn hệ thống' })
  @ApiResponse({ status: 200, description: 'Chỉ số thống kê hệ thống' })
  async getSystemOverview() {
    return this.adminService.getSystemOverview();
  }

  @Get('teachers/applicants')
  @ApiOperation({ summary: 'Lấy danh sách các giáo viên đang chờ thẩm định hồ sơ' })
  @ApiResponse({ status: 200, description: 'Danh sách hồ sơ chờ duyệt' })
  async getTeacherApplicants() {
    return this.adminService.getTeacherApplicants();
  }

  @Post('teachers/:teacherId/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Phê duyệt hoặc từ chối hồ sơ giáo viên ứng tuyển' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái duyệt giáo viên' })
  async reviewTeacherApplicant(
    @CurrentUser('id') adminId: string,
    @Param('teacherId') teacherId: string,
    @Body() dto: ReviewTeacherDto
  ) {
    return this.adminService.reviewTeacherApplicant(adminId, teacherId, dto);
  }

  @Get('questions')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_AUTHOR, UserRole.CONTENT_REVIEWER)
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi trong ngân hàng theo trạng thái' })
  @ApiQuery({ name: 'status', required: false, enum: QuestionStatus })
  @ApiQuery({ name: 'skillId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Danh sách câu hỏi' })
  async getQuestions(
    @Query('status') status?: QuestionStatus,
    @Query('skillId') skillId?: string
  ) {
    return this.adminService.getQuestions(status, skillId);
  }

  @Post('questions')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_AUTHOR)
  @ApiOperation({ summary: 'Tạo câu hỏi mới (mặc định trạng thái DRAFT)' })
  @ApiResponse({ status: 201, description: 'Tạo câu hỏi thành công' })
  async createQuestion(
    @CurrentUser('id') authorId: string,
    @Body() dto: CreateQuestionDto
  ) {
    return this.adminService.createQuestion(authorId, dto);
  }

  @Patch('questions/:questionId/review')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_REVIEWER, UserRole.CONTENT_AUTHOR)
  @ApiOperation({ summary: 'Thẩm định & duyệt câu hỏi (Bắt buộc tuân thủ quy tắc Maker-Checker)' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái câu hỏi' })
  async reviewQuestion(
    @CurrentUser('id') reviewerId: string,
    @Param('questionId') questionId: string,
    @Body() dto: ReviewQuestionDto
  ) {
    return this.adminService.reviewQuestion(reviewerId, questionId, dto);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Xem nhật ký kiểm toán hệ thống (Audit Logs)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách nhật ký kiểm toán' })
  async getAuditLogs(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.adminService.getAuditLogs(isNaN(limitNum) ? 50 : limitNum);
  }
}
