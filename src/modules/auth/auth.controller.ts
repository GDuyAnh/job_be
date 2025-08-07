import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '@/modules/users/dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiResponse({ status: 200, description: 'success' })
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Validate user
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new Error('incorrect login information');
    }

    // Generate token
    return this.authService.login(user);
  }
}
