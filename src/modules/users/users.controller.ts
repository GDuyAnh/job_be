import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/constants/roles.decorator';
import { RoleStatus } from '@/enum/role';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiResponse({ status: 201, description: 'success', type: User })
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'success', type: User })
  async getProfile(@Request() req): Promise<User> {
    return this.usersService.findById(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateProfile(req.user.id, updateUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'success', type: [User] })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(req.user.id, changePasswordDto);
    return { message: 'Đổi mật khẩu thành công' };
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Get all users for admin, optionally filter by companyId',
    type: [User],
  })
  async getAllUsersForAdmin(
    @Query('companyId') companyId?: string,
  ): Promise<User[]> {
    const id =
      companyId !== undefined && companyId !== ''
        ? parseInt(companyId, 10)
        : undefined;
    return this.usersService.findAllWithCompany(
      id !== undefined && !Number.isNaN(id) ? id : undefined,
    );
  }

  @Patch('admin/:id/upgrade-to-company')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User upgraded to company user successfully',
  })
  async upgradeToCompanyUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.usersService.upgradeToCompanyUser(userId, companyId);
  }

  @Patch('admin/:id/set-host-company')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Set or unset user as host of company (only one host per company)',
  })
  async setHostCompany(
    @Param('id', ParseIntPipe) userId: number,
    @Body('companyId', ParseIntPipe) companyId: number,
    @Body('isHostCompany') isHostCompany?: boolean,
  ) {
    const setAsHost = isHostCompany !== false;
    return this.usersService.setHostCompany(userId, companyId, setAsHost);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async deleteUserByAdmin(@Param('id', ParseIntPipe) userId: number) {
    await this.usersService.deleteUserByAdmin(userId);
    return { message: `Đã xóa người dùng ID ${userId} thành công` };
  }
}
