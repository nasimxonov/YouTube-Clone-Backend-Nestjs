import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    let token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      token = request.cookies.token;
    }
    try {
      console.log(token); //1chi

      const { id, role } = await this.jwtService.verifyAsync(token);
      console.log(token); // 2chi

      request.user = { id, role };
      console.log(id, role);

      return true;
    } catch (error) {
      throw new ForbiddenException('Token invalid');
    }
  }
}
