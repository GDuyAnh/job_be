import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/constants/roles.decorator';

@ApiTags('demo')
@Controller('demo')
export class DemoController {
  @Get('test')
  @ApiResponse({ status: 200, description: 'success' })
  async test() {
    return {
      message: 'Test logging success!',
      timestamp: new Date().toISOString(),
      data: {
        id: 1,
        name: 'Test Data',
        status: 'active',
      },
    };
  }

  @Post('test-post')
  @ApiResponse({ status: 201, description: 'success' })
  async testPost(@Body() body: any) {
    return {
      message: 'POST request success!',
      receivedData: body,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('error')
  @ApiResponse({ status: 500, description: 'error' })
  async testError() {
    throw new HttpException(
      'This is a test error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Get('slow')
  @ApiResponse({ status: 200, description: 'slow' })
  async testSlow() {
    // simulate slow request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      message: 'slow request success!',
      duration: '1500ms',
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'success' })
  @ApiResponse({ status: 404, description: 'not found' })
  async getById(@Param('id') id: string) {
    // simulate data by id
    const mockData = {
      1: { id: 1, name: 'User 1', email: 'user1@example.com', role: 'admin' },
      2: { id: 2, name: 'User 2', email: 'user2@example.com', role: 'user' },
      3: {
        id: 3,
        name: 'User 3',
        email: 'user3@example.com',
        role: 'moderator',
      },
    };

    const data = mockData[id];
    if (!data) {
      throw new BadRequestException('not found');
    }

    return {
      message: `get data by id ${id} success!`,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('admin-only/ping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiResponse({ status: 200, description: 'admin success' })
  async adminOnly() {
    return { message: 'ADMIN route OK' }
  }
}
