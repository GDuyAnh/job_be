import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { Repository, IsNull, MoreThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { PasswordResetToken } from './password-reset-token.entity';
import { User } from '../users/user.entity';
import { EmailService } from './email.service';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async requestReset(email: string): Promise<void> {
    const normalized = email.trim();
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email: normalized })
      .getOne();

    if (!user) {
      return;
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.tokenRepository.save(
      this.tokenRepository.create({
        userId: user.id,
        tokenHash,
        expiresAt,
        usedAt: null,
      }),
    );

    const frontendUrl = this.emailService.getFrontendUrl();
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${rawToken}`;

    try {
      await this.emailService.sendByTemplate('PASSWORD_RESET', user.email, {
        fullName: user.fullName,
        email: user.email,
        resetUrl,
        expiresAt: expiresAt.toLocaleString('vi-VN'),
      });
    } catch {
      // fire-and-forget pattern
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'Mật khẩu mới và xác nhận mật khẩu không khớp',
      );
    }

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');
    }

    const tokenHash = this.hashToken(token.trim());
    const resetRecord = await this.tokenRepository.findOne({
      where: {
        tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!resetRecord?.user) {
      throw new BadRequestException(
        'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(resetRecord.userId, {
      password: hashedPassword,
    });

    resetRecord.usedAt = new Date();
    await this.tokenRepository.save(resetRecord);

    try {
      await this.emailService.sendByTemplate(
        'PASSWORD_CHANGED',
        resetRecord.user.email,
        {
          fullName: resetRecord.user.fullName,
          email: resetRecord.user.email,
          changedAt: new Date().toLocaleString('vi-VN'),
        },
      );
    } catch {
      // fire-and-forget
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
