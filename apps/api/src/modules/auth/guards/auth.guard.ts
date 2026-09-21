import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Look for session token in cookies or Bearer Authorization header
    let token =
      request.cookies?.['am_session'] ||
      request.cookies?.['__Host-am_session'];

    if (!token && request.headers.authorization) {
      const parts = request.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Bạn cần đăng nhập để thực hiện hành động này.'
      });
    }

    const user = await this.authService.validateSession(token);
    if (!user) {
      throw new UnauthorizedException({
        code: 'SESSION_EXPIRED',
        message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.'
      });
    }

    // Attach user and token to request context
    request.user = user;
    request.sessionToken = token;

    return true;
  }
}
