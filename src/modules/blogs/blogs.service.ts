import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogDtoResponse } from './dto/blog-response.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>,
  ) {}

  async findAll(): Promise<BlogDtoResponse[]> {
    const blogs = await this.blogsRepository.find({
      where: { status: 'published' },
      order: { createdAt: 'DESC' },
    });

    return blogs.map(blog => this.mapToBlogDetailDto(blog));
  }

  async findOne(id: number): Promise<BlogDtoResponse> {
    const blog = await this.blogsRepository.findOne({
      where: { id, status: 'published' },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return this.mapToBlogDetailDto(blog);
  }

  async create(createBlogDto: CreateBlogDto): Promise<BlogDtoResponse> {
    const blog = this.blogsRepository.create({
      ...createBlogDto,
      status: createBlogDto.status || 'published',
    });

    const savedBlog = await this.blogsRepository.save(blog);
    return this.mapToBlogDetailDto(savedBlog);
  }

  async update(id: number, updateBlogDto: Partial<CreateBlogDto>): Promise<BlogDtoResponse> {
    const blog = await this.blogsRepository.findOne({ where: { id } });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    Object.assign(blog, updateBlogDto);
    const updatedBlog = await this.blogsRepository.save(blog);
    return this.mapToBlogDetailDto(updatedBlog);
  }

  async delete(id: number): Promise<void> {
    const blog = await this.blogsRepository.findOne({ where: { id } });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    await this.blogsRepository.remove(blog);
  }

  private mapToBlogDetailDto(blog: Blog): BlogDtoResponse {
    return {
      id: blog.id,
      title: blog.title,
      description: blog.description,
      image: blog.image,
      url: blog.url,
      author: blog.author,
      status: blog.status,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }
} 