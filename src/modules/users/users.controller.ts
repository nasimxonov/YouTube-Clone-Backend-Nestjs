import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/common/guard/auth.guard';


@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req) {
    return await this.usersService.getUserById(req.user.id);
  }

  @Put('me')
  async updateProfile(@Req() req, @Body() body: any) {
    return await this.usersService.updateUser(req.user.id, body);
  }
}
