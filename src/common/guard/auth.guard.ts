import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['token'];

    if (!token) throw new UnauthorizedException('Token topilmadi');

    try {
      const decoded = this.jwtService.verify(token);

      request.user = {
        id: decoded.userId,
        role: decoded.role,
        email: decoded.email,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException("Token noto'g'ri yoki muddati o'tgan");
    }
  }
}
