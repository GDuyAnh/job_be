import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
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

    return blogs.map((blog) => this.mapToBlogDetailDto(blog));
  }

  async findAllForAdmin(): Promise<BlogDtoResponse[]> {
    const blogs = await this.blogsRepository.find({
      order: { createdAt: 'DESC' },
    });

    return blogs.map((blog) => this.mapToBlogDetailDto(blog));
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
      status: createBlogDto.status || 'draft',
      displayOnHomepage: createBlogDto.displayOnHomepage ?? false,
      description: createBlogDto.description || createBlogDto.metaDescription || null, // Use metaDescription as description if not provided
      content: createBlogDto.content || createBlogDto.description || '', // Ensure content is set
    });

    const savedBlog = await this.blogsRepository.save(blog);
    return this.mapToBlogDetailDto(savedBlog);
  }

  async update(
    id: number,
    updateBlogDto: UpdateBlogDto,
  ): Promise<BlogDtoResponse> {
    const blog = await this.blogsRepository.findOne({ where: { id } });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    // Only update fields that are provided
    if (updateBlogDto.title !== undefined) blog.title = updateBlogDto.title
    if (updateBlogDto.content !== undefined) blog.content = updateBlogDto.content
    if (updateBlogDto.description !== undefined) blog.description = updateBlogDto.description
    if (updateBlogDto.image !== undefined) blog.image = updateBlogDto.image
    if (updateBlogDto.url !== undefined) blog.url = updateBlogDto.url
    if (updateBlogDto.author !== undefined) blog.author = updateBlogDto.author
    if (updateBlogDto.status !== undefined) blog.status = updateBlogDto.status
    if (updateBlogDto.titleSeo !== undefined) blog.titleSeo = updateBlogDto.titleSeo
    if (updateBlogDto.metaDescription !== undefined) blog.metaDescription = updateBlogDto.metaDescription
    if (updateBlogDto.schema !== undefined) blog.schema = updateBlogDto.schema
    if (updateBlogDto.category !== undefined) blog.category = updateBlogDto.category
    if (updateBlogDto.displayOnHomepage !== undefined) blog.displayOnHomepage = updateBlogDto.displayOnHomepage

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
      content: blog.content || blog.description || '',
      description: blog.description,
      image: blog.image,
      url: blog.url,
      author: blog.author,
      status: blog.status,
      titleSeo: blog.titleSeo || blog.title,
      metaDescription: blog.metaDescription || blog.description || '',
      schema: blog.schema,
      category: blog.category,
      displayOnHomepage: blog.displayOnHomepage ?? false,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }
}
