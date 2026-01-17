import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME');
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL');

    if (!accountId || !accessKeyId || !secretAccessKey || !this.bucketName) {
      throw new Error('Missing Cloudflare R2 configuration');
    }

    // Khởi tạo S3 Client cho Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Upload file lên Cloudflare R2
   * @param file File từ multer
   * @param folder Thư mục lưu trữ (cv, avatar, cover-letter, etc.)
   * @returns URL public của file
   */
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      // Tạo tên file unique
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

      // Upload lên R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // Trả về URL public
      const fileUrl = `${this.publicUrl}/${fileName}`;
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  /**
   * Xóa file từ Cloudflare R2
   * @param fileUrl URL của file cần xóa
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) return;

      // Extract key từ URL
      // Support cả R2 public URL và custom domain
      let key = '';

      if (fileUrl.startsWith(this.publicUrl)) {
        // Standard R2 public URL
        key = fileUrl.replace(this.publicUrl + '/', '');
      } else {
        // Custom domain hoặc URL khác
        // Extract path after domain (e.g., cv/123-abc.pdf)
        const url = new URL(fileUrl);
        key = url.pathname.startsWith('/')
          ? url.pathname.substring(1)
          : url.pathname;
      }

      if (!key) {
        console.warn('Cannot extract key from URL:', fileUrl);
        return;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      console.log('Deleted file from R2:', key);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      // Không throw error vì có thể file đã bị xóa trước đó hoặc không tồn tại
    }
  }

  /**
   * Tạo presigned URL để upload trực tiếp từ client
   * @param fileName Tên file
   * @param folder Thư mục
   * @param contentType Content type của file
   * @param expiresIn Thời gian hết hạn (giây)
   * @returns Presigned URL và key
   */
  async getPresignedUploadUrl(
    fileName: string,
    folder: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    try {
      // Tạo key unique
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = fileName.split('.').pop();
      const key = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

      // Tạo presigned URL
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      const fileUrl = `${this.publicUrl}/${key}`;

      return {
        uploadUrl,
        fileUrl,
        key,
      };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new BadRequestException('Failed to generate upload URL');
    }
  }

  /**
   * Validate file CV/Cover Letter
   */
  validateCvFile(file: Express.Multer.File): void {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PDF, DOC, and DOCX are allowed.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB.');
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file: Express.Multer.File): void {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    const maxSize = 3 * 1024 * 1024; // 3MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG and PNG are allowed.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 3MB.');
    }
  }

  /**
   * Delete multiple files from R2 (batch operation)
   * @param urls Array of file URLs to delete
   */
  async deleteBatch(urls: string[]): Promise<void> {
    console.log(`Starting batch delete of ${urls.length} files`);

    const deletePromises = urls.map(async (url) => {
      try {
        await this.deleteFile(url);
        return { url, success: true };
      } catch (error) {
        console.error(`Failed to delete ${url}:`, error);
        return { url, success: false, error };
      }
    });

    // Execute all deletes in parallel
    const results = await Promise.allSettled(deletePromises);

    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success,
    ).length;
    const failCount = results.length - successCount;

    console.log(
      `Batch delete completed: ${successCount} succeeded, ${failCount} failed`,
    );
  }
}
