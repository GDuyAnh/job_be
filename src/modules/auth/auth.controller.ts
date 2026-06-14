import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '@/modules/users/dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordResetService } from '../email/password-reset.service';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/password-reset.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private passwordResetService: PasswordResetService,
  ) {}

  @Post('login')
  @ApiResponse({ status: 200, description: 'success' })
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Validate user
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    // Generate token
    return this.authService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Get current user information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Request() req) {
    return this.authService.getMe(req.user.id);
  }

  @Post('auto-login')
  @ApiResponse({
    status: 200,
    description: 'Auto login by email after job application',
  })
  async autoLogin(@Body() body: { email: string }) {
    return this.authService.autoLoginByEmail(body.email);
  }

  @Post('forgot-password')
  @ApiResponse({
    status: 200,
    description:
      'Request password reset email (always returns generic message)',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.passwordResetService.requestReset(dto.email);
    return {
      message:
        'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.',
    };
  }

  @Post('reset-password')
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.passwordResetService.resetPassword(
      dto.token,
      dto.newPassword,
      dto.confirmPassword,
    );
    return { message: 'Mật khẩu đã được đặt lại thành công' };
  }
}
