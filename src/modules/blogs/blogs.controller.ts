import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogDtoResponse } from './dto/blog-response.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/constants/roles.decorator';
import { RoleStatus } from '@/enum/role';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of all published blogs',
    type: [BlogDtoResponse],
  })
  async findAll(): Promise<BlogDtoResponse[]> {
    return this.blogsService.findAll();
  }

  @Get(':id/related')
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiResponse({
    status: 200,
    description: 'List of related blogs (published)',
    type: [BlogDtoResponse],
  })
  async related(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
  ): Promise<BlogDtoResponse[]> {
    const n = Number(limit)
    const take = Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 12) : 3
    return this.blogsService.findRelated(id, take)
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'List of all blogs for admin',
    type: [BlogDtoResponse],
  })
  async findAllForAdmin(): Promise<BlogDtoResponse[]> {
    return this.blogsService.findAllForAdmin();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog found',
    type: BlogDtoResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Blog Không tìm thấy',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BlogDtoResponse> {
    return this.blogsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Blog created successfully',
    type: BlogDtoResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async create(@Body() createBlogDto: CreateBlogDto): Promise<BlogDtoResponse> {
    return this.blogsService.create(createBlogDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog updated successfully',
    type: BlogDtoResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Blog Không tìm thấy',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<BlogDtoResponse> {
    return this.blogsService.update(id, updateBlogDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleStatus.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog Không tìm thấy',
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.blogsService.delete(id);
  }
}
