import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RoleGuard } from 'src/common/guard/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard, RoleGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('videos/pending')
  getPendingVideos(@Query('limit') limit: string, @Query('page') page: string) {
    return this.adminService.getPendingVideos(+limit, +page);
  }

  @Patch('videos/:id/approve')
  approveVideo(@Param('id') id: string) {
    return this.adminService.approveVideo(id);
  }

  @Patch('videos/:id/reject')
  rejectVideo(@Param('id') id: string) {
    return this.adminService.rejectVideo(id);
  }

  @Get('users')
  getUsers(
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Query('search') search: string,
    @Query('status') status: string,
  ) {
    return this.adminService.getUsers(+limit, +page, search, status);
  }

  @Patch('users/:id/block')
  blockUser(@Param('id') id: string) {
    return this.adminService.blockUser(id);
  }

  @Patch('users/:id/verify')
  verifyUser(@Param('id') id: string) {
    return this.adminService.verifyUser(id);
  }

  @Get('reports')
  getReports(
    @Query('type') type: string,
    @Query('status') status: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ) {
    return this.adminService.getReports(type, status, +limit, +page);
  }

  @Patch('reports/:id/resolve')
  resolveReport(@Param('id') id: string) {
    return this.adminService.resolveReport(id);
  }
}
