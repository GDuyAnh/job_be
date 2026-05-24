import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
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
      throw new BadRequestException('Tải tệp lên thất bại');
    }
  }

  /**
   * Xóa file từ Cloudflare R2
   * @param fileUrl URL của file cần xóa
   */
  private extractKeyFromFileUrl(fileUrl: string): string {
    if (!fileUrl) {
      throw new BadRequestException('URL ảnh không hợp lệ');
    }

    const sanitized = fileUrl.split('?')[0].split('#')[0];
    const publicBase = this.publicUrl.replace(/\/$/, '');

    if (sanitized.startsWith(`${publicBase}/`)) {
      return sanitized.slice(publicBase.length + 1);
    }

    let pathname: string;
    try {
      pathname = new URL(sanitized).pathname;
    } catch {
      throw new BadRequestException('URL ảnh không hợp lệ');
    }

    const key = pathname.startsWith('/') ? pathname.substring(1) : pathname;

    if (!key || key.includes('..')) {
      throw new BadRequestException('Đường dẫn ảnh không hợp lệ');
    }

    return key;
  }

  private assertAllowedImageKey(key: string): void {
    const allowedPrefixes = ['logo/', 'banner/', 'company-images/', 'avatar/'];

    if (!allowedPrefixes.some((prefix) => key.startsWith(prefix))) {
      throw new BadRequestException('Đường dẫn ảnh không được phép');
    }
  }

  /**
   * Đọc ảnh từ R2 và trả về data URL (phục vụ crop ảnh trên FE, tránh CORS)
   */
  async getImageDataUrl(fileUrl: string): Promise<{ dataUrl: string }> {
    const key = this.extractKeyFromFileUrl(fileUrl);
    this.assertAllowedImageKey(key);

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      const body = await response.Body?.transformToByteArray();

      if (!body?.length) {
        throw new BadRequestException('Không tìm thấy ảnh');
      }

      const mimeType = response.ContentType || 'image/png';
      const base64 = Buffer.from(body).toString('base64');

      return {
        dataUrl: `data:${mimeType};base64,${base64}`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error reading image from R2:', error);
      throw new BadRequestException('Không tải được ảnh');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) return;

      const key = this.extractKeyFromFileUrl(fileUrl);

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
      throw new BadRequestException('Tạo URL tải lên thất bại');
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
        'Định dạng tệp không hợp lệ. Chỉ cho phép PDF, DOC và DOCX.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException('Kích thước tệp phải nhỏ hơn 5MB.');
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
        'Định dạng tệp không hợp lệ. Chỉ cho phép JPEG và PNG.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException('Kích thước tệp phải nhỏ hơn 3MB.');
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
