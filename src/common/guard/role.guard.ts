import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles || roles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const token = request.cookies['token'];

    if (!token) throw new ForbiddenException("Token yo'q");

    try {
      const user = this.jwtService.verify(token);

      if (!user || !roles.includes(user.role)) {
        throw new ForbiddenException("Sizda bu sahifaga ruxsat yo'q");
      }
      return true;
    } catch {
      throw new ForbiddenException("Noto'g'ri token yoki role yo'q");
    }
  }
}
