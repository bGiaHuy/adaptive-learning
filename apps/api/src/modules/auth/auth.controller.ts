import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication & Identity')
@Controller('auth')
export class AuthController {
  private readonly isProd = process.env.NODE_ENV === 'production';
  private readonly cookieName = process.env.SESSION_COOKIE_NAME || 'am_session';
  private readonly sessionTtlMs = (parseInt(process.env.SESSION_TTL_SECONDS || '604800', 10)) * 1000;

  constructor(private readonly authService: AuthService) {}

  private setSessionCookie(res: Response, token: string, expiresAt: Date) {
    const cookieOptions = {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax' as const,
      expires: expiresAt,
      path: '/'
    };

    res.cookie(this.cookieName, token, cookieOptions);
    if (this.isProd) {
      res.cookie(`__Host-${this.cookieName}`, token, cookieOptions);
    }
  }

  private clearSessionCookie(res: Response) {
    const clearOptions = {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax' as const,
      path: '/'
    };

    res.clearCookie(this.cookieName, clearOptions);
    if (this.isProd) {
      res.clearCookie(`__Host-${this.cookieName}`, clearOptions);
    }
  }

  @Post('register/student')
  @ApiOperation({ summary: 'Đăng ký tài khoản học sinh mới' })
  @ApiResponse({ status: 201, description: 'Học sinh đăng ký thành công' })
  async registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.registerStudent(dto);
  }

  @Post('register/teacher')
  @ApiOperation({ summary: 'Đăng ký tài khoản giáo viên (chờ quản trị viên duyệt)' })
  @ApiResponse({ status: 201, description: 'Giáo viên nộp hồ sơ đăng ký thành công' })
  async registerTeacher(@Body() dto: RegisterTeacherDto) {
    return this.authService.registerTeacher(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập hệ thống (sinh cookie session an toàn)' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const userAgent = req.headers['user-agent'] as string;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip;

    const result = await this.authService.login(dto, userAgent, ipAddress);

    this.setSessionCookie(res, result.sessionToken, result.expiresAt);

    return {
      message: 'Đăng nhập thành công',
      user: result.user,
      sessionToken: result.sessionToken
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin tài khoản và vai trò của phiên hiện tại' })
  @ApiResponse({ status: 200, description: 'Thông tin tài khoản' })
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      user
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất phiên hiện tại' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  async logout(
    @Req() req: Request & { sessionToken?: string },
    @Res({ passthrough: true }) res: Response
  ) {
    if (req.sessionToken) {
      await this.authService.logout(req.sessionToken);
    }
    this.clearSessionCookie(res);

    return {
      message: 'Đăng xuất thành công'
    };
  }

  @Post('logout-all')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất tất cả các phiên đăng nhập của người dùng' })
  @ApiResponse({ status: 200, description: 'Toàn bộ phiên đã bị thu hồi' })
  async logoutAll(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.logoutAll(userId);
    this.clearSessionCookie(res);

    return {
      message: 'Toàn bộ các phiên đăng nhập đã được hủy'
    };
  }
}
