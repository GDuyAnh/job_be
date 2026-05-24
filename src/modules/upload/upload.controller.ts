import {
  Controller,
  Post,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('cv')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiOperation({ summary: 'Upload CV file (no authentication required)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CV file (PDF, DOC, DOCX)',
        },
        oldUrl: {
          type: 'string',
          description: 'URL of old CV to delete (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Public URL of uploaded file' },
        originalName: { type: 'string', description: 'Original filename' },
        message: { type: 'string' },
      },
    },
  })
  async uploadCv(
    @UploadedFile() file: Express.Multer.File,
    @Body('oldUrl') oldUrl?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Chưa tải lên tệp');
    }

    // Validate file
    this.uploadService.validateCvFile(file);

    // Delete old file if exists
    if (oldUrl) {
      await this.uploadService.deleteFile(oldUrl);
    }

    // Upload new file to R2
    const url = await this.uploadService.uploadFile(file, 'cv');

    return {
      url,
      originalName: file.originalname,
      message: 'Tải CV lên thành công',
    };
  }

  @Post('cover-letter')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload cover letter file (no authentication required)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Cover letter file (PDF, DOC, DOCX)',
        },
        oldUrl: {
          type: 'string',
          description: 'URL of old cover letter to delete (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Public URL of uploaded file' },
        originalName: { type: 'string', description: 'Original filename' },
        message: { type: 'string' },
      },
    },
  })
  async uploadCoverLetter(
    @UploadedFile() file: Express.Multer.File,
    @Body('oldUrl') oldUrl?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Chưa tải lên tệp');
    }

    // Validate file
    this.uploadService.validateCvFile(file);

    // Delete old file if exists
    if (oldUrl) {
      await this.uploadService.deleteFile(oldUrl);
    }

    // Upload new file to R2
    const url = await this.uploadService.uploadFile(file, 'cover-letter');

    return {
      url,
      originalName: file.originalname,
      message: 'Tải thư xin việc lên thành công',
    };
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 3 * 1024 * 1024, // 3MB
      },
    }),
  )
  @ApiOperation({ summary: 'Upload avatar image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image (JPEG, PNG)',
        },
        oldUrl: {
          type: 'string',
          description: 'URL of old avatar to delete (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Public URL of uploaded file' },
        originalName: { type: 'string', description: 'Original filename' },
        message: { type: 'string' },
      },
    },
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body('oldUrl') oldUrl?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Chưa tải lên tệp');
    }

    // Validate file
    this.uploadService.validateImageFile(file);

    // Delete old file if exists
    if (oldUrl) {
      await this.uploadService.deleteFile(oldUrl);
    }

    // Upload new file to R2
    const url = await this.uploadService.uploadFile(file, 'avatar');

    return {
      url,
      originalName: file.originalname,
      message: 'Tải ảnh đại diện lên thành công',
    };
  }

  @Post('presigned-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get presigned URL for direct client upload to R2',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string', description: 'Original file name' },
        folder: {
          type: 'string',
          description: 'Folder to upload to',
          enum: ['cv', 'cover-letter', 'avatar'],
        },
        contentType: {
          type: 'string',
          description: 'MIME type of the file',
        },
      },
      required: ['fileName', 'folder', 'contentType'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        uploadUrl: {
          type: 'string',
          description: 'Presigned URL for upload',
        },
        fileUrl: { type: 'string', description: 'Final public URL' },
        key: { type: 'string', description: 'S3 key' },
      },
    },
  })
  async getPresignedUrl(
    @Body()
    body: {
      fileName: string;
      folder: string;
      contentType: string;
    },
  ) {
    const { fileName, folder, contentType } = body;

    // Validate folder
    if (!['cv', 'cover-letter', 'avatar'].includes(folder)) {
      throw new BadRequestException('Thư mục không hợp lệ');
    }

    return await this.uploadService.getPresignedUploadUrl(
      fileName,
      folder,
      contentType,
    );
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiOperation({ summary: 'Upload image file (logo, banner, company images)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG)',
        },
        folder: {
          type: 'string',
          description: 'Folder to upload to',
          enum: ['logo', 'banner', 'company-images'],
        },
        oldUrl: {
          type: 'string',
          description: 'URL of old image to delete (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Public URL of uploaded file' },
        originalName: { type: 'string', description: 'Original filename' },
        message: { type: 'string' },
      },
    },
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('oldUrl') oldUrl?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Chưa tải lên tệp');
    }

    // Validate folder
    const validFolders = ['logo', 'banner', 'company-images'];
    const uploadFolder = folder && validFolders.includes(folder) ? folder : 'company-images';

    // Validate file
    this.uploadService.validateImageFile(file);

    // Delete old file if exists
    if (oldUrl) {
      await this.uploadService.deleteFile(oldUrl);
    }

    // Upload new file to R2
    const url = await this.uploadService.uploadFile(file, uploadFolder);

    return {
      url,
      originalName: file.originalname,
      message: 'Image uploaded successfully',
    };
  }

  @Get('image-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Load image from R2 as data URL (for client-side crop)',
  })
  @ApiResponse({
    status: 200,
    description: 'Image data URL',
    schema: {
      type: 'object',
      properties: {
        dataUrl: { type: 'string' },
      },
    },
  })
  async getImageData(@Query('url') url: string) {
    if (!url?.trim()) {
      throw new BadRequestException('URL là bắt buộc');
    }

    return await this.uploadService.getImageDataUrl(url.trim());
  }

  @Post('delete-batch')
  @ApiOperation({
    summary: 'Delete multiple files from R2 (async operation)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        urls: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of file URLs to delete',
        },
      },
      required: ['urls'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Batch delete initiated',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        count: { type: 'number', description: 'Number of files to delete' },
      },
    },
  })
  async deleteBatch(@Body('urls') urls: string[]) {
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new BadRequestException('Danh sách URL là bắt buộc và không được rỗng');
    }

    // Delete files asynchronously (don't await)
    this.uploadService.deleteBatch(urls).catch((error) => {
      console.error('Batch delete error:', error);
    });

    return {
      message: 'Đã bắt đầu xóa hàng loạt',
      count: urls.length,
    };
  }
}
