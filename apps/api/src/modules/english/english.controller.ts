import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EnglishService } from './english.service';

@ApiTags('English learning')
@Controller('english')
export class EnglishController {
  constructor(private readonly english: EnglishService) {}

  @Get('topics')
  topics() { return this.english.topics(); }

  @Get('lessons/:id')
  lesson(@Param('id') id: string) { return this.english.lesson(id); }

  @Post('lessons/:id/submit')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  submit(@Param('id') id: string, @CurrentUser('id') studentId: string, @Body() body: unknown) {
    return this.english.submit(id, studentId, body);
  }

  @Get('progress')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  progress(@CurrentUser('id') studentId: string) { return this.english.progress(studentId); }

  @Get('placement')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  placement() { return this.english.placementQuestions(); }

  @Get('placement/result')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  placementResult(@CurrentUser('id') studentId: string) { return this.english.placementResult(studentId); }

  @Post('placement')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  submitPlacement(@CurrentUser('id') studentId: string, @Body() body: unknown) {
    return this.english.submitPlacement(studentId, body);
  }

  @Post('import')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_AUTHOR)
  import(@Body() body: unknown, @CurrentUser('role') role: UserRole) { return this.english.importBatch(body, role); }
}
