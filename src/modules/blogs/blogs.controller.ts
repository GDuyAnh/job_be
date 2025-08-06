import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogDtoResponse } from './dto/blog-response.dto';

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

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog found',
    type: BlogDtoResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Blog not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BlogDtoResponse> {
    return this.blogsService.findOne(id);
  }

  @Post()
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
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog updated successfully',
    type: BlogDtoResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Blog not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlogDto: Partial<CreateBlogDto>,
  ): Promise<BlogDtoResponse> {
    return this.blogsService.update(id, updateBlogDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog not found',
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.blogsService.delete(id);
  }
}
