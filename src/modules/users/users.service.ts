import { Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleStatus } from '@/enum/role';
import { EmailService } from '../email/email.service';
import { Company } from '../companies/company.entity';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    private emailService: EmailService,
    private uploadService: UploadService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const {
      email,
      username,
      password,
      fullName,
      phoneNumber,
      role,
      companyId,
    } = createUserDto;

    const existingEmail = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException(
        'Email đã được sử dụng. Vui lòng sử dụng email khác.',
      );
    }

    const existingUsername = await this.usersRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException(
        'Tên đăng nhập đã được sử dụng. Vui lòng sử dụng tên khác.',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // User đầu tiên đăng ký với MST/công ty → host; các user sau cùng MST không phải host
    let isHostCompany = false;
    if (companyId) {
      const existingHost = await this.usersRepository.findOne({
        where: { companyId, isHostCompany: true },
      });
      isHostCompany = !existingHost;
    }

    const user = this.usersRepository.create({
      email,
      username,
      password: hashedPassword,
      fullName,
      phoneNumber: phoneNumber || null,
      role: role || RoleStatus.USER,
      companyId: companyId || null,
      isHostCompany,
    });

    const savedUser = await this.usersRepository.save(user);

    // Send welcome email with account information
    try {
      const credentialRole =
        (role || RoleStatus.USER) === RoleStatus.COMPANY
          ? 'employer'
          : 'candidate';
      if (role !== RoleStatus.ADMIN) {
        await this.emailService.sendAccountCredentials(
          email,
          fullName,
          username,
          password,
          credentialRole,
        );
      }
    } catch (error) {
      // Log error but don't fail registration if email fails
      console.error('Failed to send welcome email:', error);
    }

    // delete password
    delete savedUser.password;
    return savedUser;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    // Remove password for security
    delete user.password;
    return user;
  }

  async findByIdWithPassword(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    // Keep password for JWT generation
    return user;
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => {
      delete user.password;
      return user;
    });
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'Mật khẩu mới và xác nhận mật khẩu không khớp',
      );
    }

    // Get user with password
    const user = await this.findByIdWithPassword(userId);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.usersRepository.update(userId, { password: hashedPassword });

    try {
      await this.emailService.sendByTemplate('PASSWORD_CHANGED', user.email, {
        fullName: user.fullName,
        email: user.email,
        changedAt: new Date().toLocaleString('vi-VN'),
      });
    } catch (error) {
      console.error('Failed to send password changed email:', error);
    }
  }

  async findAdminEmails(): Promise<string[]> {
    const admins = await this.usersRepository.find({
      where: { role: RoleStatus.ADMIN },
    });
    return [...new Set(admins.map((a) => a.email?.trim()).filter(Boolean))];
  }

  async findHostByCompanyId(companyId: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { companyId, isHostCompany: true },
    });
  }

  async updateProfile(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Check if username is already taken by another user
    const existingUser = await this.usersRepository.findOne({
      where: { username: updateUserDto.username },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    // Chuẩn bị danh sách file cũ cần xóa trên R2 (best-effort)
    const urlsToDelete: string[] = [];

    const maybeQueueReplace = (prev: string | null | undefined, next: any) => {
      if (!prev) return;
      if (next === undefined) return; // không update field này
      const nextVal = next == null || String(next).trim() === '' ? null : String(next).trim();
      if (nextVal !== prev) urlsToDelete.push(prev);
    };

    maybeQueueReplace(user.cvUrl, updateUserDto.cvUrl);
    maybeQueueReplace(user.coverLetterUrl, updateUserDto.coverLetterUrl);
    maybeQueueReplace(user.avatarUrl, updateUserDto.avatarUrl);

    // Prepare update data
    const updateData: any = {
      fullName: updateUserDto.fullName.trim(),
      username: updateUserDto.username.trim(),
      phoneNumber: updateUserDto.phoneNumber?.trim() || null,
      location: updateUserDto.location?.trim() || null,
      expertise: updateUserDto.expertise?.trim() || null,
    };

    if (updateUserDto.gender !== undefined) {
      updateData.gender = updateUserDto.gender?.trim() || null;
    }

    // Add optional fields if provided
    if (updateUserDto.cvUrl !== undefined) {
      updateData.cvUrl = updateUserDto.cvUrl?.trim() || null;
    }
    if (updateUserDto.cvFileName !== undefined) {
      updateData.cvFileName = updateUserDto.cvFileName?.trim() || null;
    }
    if (updateUserDto.coverLetterUrl !== undefined) {
      updateData.coverLetterUrl = updateUserDto.coverLetterUrl?.trim() || null;
    }
    if (updateUserDto.coverLetterFileName !== undefined) {
      updateData.coverLetterFileName =
        updateUserDto.coverLetterFileName?.trim() || null;
    }
    if (updateUserDto.coverLetterText !== undefined) {
      updateData.coverLetterText =
        updateUserDto.coverLetterText?.trim() || null;
    }
    if (updateUserDto.avatarUrl !== undefined) {
      updateData.avatarUrl = updateUserDto.avatarUrl?.trim() || null;
    }
    if (updateUserDto.avatarFileName !== undefined) {
      updateData.avatarFileName = updateUserDto.avatarFileName?.trim() || null;
    }

    // Update user
    await this.usersRepository.update(userId, updateData);

    // Best-effort: xóa file cũ trên R2 sau khi update DB
    if (urlsToDelete.length > 0) {
      this.uploadService.deleteBatch(urlsToDelete).catch((e) => console.error('R2 delete (user profile) failed:', e));
    }

    // Return updated user
    const updatedUser = await this.findById(userId);
    return updatedUser;
  }

  async findOrCreateUserByEmail(
    email: string,
    fullName: string,
    phoneNumber?: string,
    cvUrl?: string,
    coverLetterUrl?: string,
    coverLetterText?: string,
  ): Promise<User> {
    // Try to find existing user by email
    let user = await this.findByEmail(email);
    let isNewUser = false;

    if (!user) {
      // Create new user with auto-generated username and password
      const username = email.split('@')[0];
      const defaultPassword = username + '123'; // Password format: username123
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      user = this.usersRepository.create({
        email,
        username,
        password: hashedPassword,
        fullName,
        phoneNumber: phoneNumber || null,
        cvUrl: cvUrl || null,
        coverLetterUrl: coverLetterUrl || null,
        coverLetterText: coverLetterText || null,
      });

      user = await this.usersRepository.save(user);
      isNewUser = true;

      // Send email with account credentials to new user
      try {
        await this.emailService.sendAccountCredentials(
          email,
          fullName,
          username,
          defaultPassword,
        );
      } catch (error) {
        // Log error but don't fail user creation if email fails
        console.error('Failed to send account credentials email:', error);
      }
    } else {
      // User exists - sync latest application data to profile
      const updateData: any = {};
      const urlsToDelete: string[] = [];

      const trimmedFullName = fullName?.trim();
      if (trimmedFullName) {
        updateData.fullName = trimmedFullName;
      }

      const trimmedPhone = phoneNumber?.trim();
      if (trimmedPhone) {
        updateData.phoneNumber = trimmedPhone;
      }

      if (cvUrl !== undefined && cvUrl !== null) {
        if (user.cvUrl && user.cvUrl !== cvUrl) urlsToDelete.push(user.cvUrl);
        updateData.cvUrl = cvUrl;
      }
      if (coverLetterUrl !== undefined && coverLetterUrl !== null) {
        if (user.coverLetterUrl && user.coverLetterUrl !== coverLetterUrl) urlsToDelete.push(user.coverLetterUrl);
        updateData.coverLetterUrl = coverLetterUrl;
      }
      if (coverLetterText !== undefined && coverLetterText !== null) {
        updateData.coverLetterText = coverLetterText;
      }

      // Only update if there's something to update
      if (Object.keys(updateData).length > 0) {
        await this.usersRepository.update(user.id, updateData);
        // Reload user to get updated data
        user = await this.usersRepository.findOne({ where: { id: user.id } });
      }

      if (urlsToDelete.length > 0) {
        this.uploadService.deleteBatch(urlsToDelete).catch((e) => console.error('R2 delete (user application update) failed:', e));
      }
    }

    // Remove password before returning
    delete user.password;
    return user;
  }

  async findAllWithCompany(companyId?: number): Promise<User[]> {
    const where: any = {};
    if (companyId != null) {
      where.companyId = companyId;
      // Khi filter theo companyId (Admin Company Management), chỉ lấy employer role COMPANY
      where.role = RoleStatus.COMPANY;
    }
    const users = await this.usersRepository.find({
      where: Object.keys(where).length ? where : undefined,
      relations: ['company'],
      order: {
        createdAt: 'DESC',
      },
    });

    return users.map((user) => {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      return userWithoutPassword;
    });
  }

  async upgradeToCompanyUser(
    userId: number,
    companyId: number,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    user.role = RoleStatus.COMPANY;
    user.companyId = companyId;

    const updatedUser = await this.usersRepository.save(user);
    delete updatedUser.password;

    return updatedUser;
  }

  async deleteUserByAdmin(userId: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Best-effort: xóa file trên R2 trước khi xóa user
    const urlsToDelete = [user.cvUrl, user.coverLetterUrl, user.avatarUrl].filter(Boolean) as string[];
    if (urlsToDelete.length > 0) {
      this.uploadService.deleteBatch(urlsToDelete).catch((e) => console.error('R2 delete (user delete) failed:', e));
    }

    await this.usersRepository.remove(user);
  }

  async setHostCompany(
    userId: number,
    companyId: number,
    isHostCompany: boolean = true,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (user.companyId !== companyId) {
      throw new BadRequestException('Người dùng không thuộc công ty này');
    }

    if (isHostCompany) {
      await this.usersRepository.update(
        { companyId },
        { isHostCompany: false },
      );
      user.isHostCompany = true;
    } else {
      user.isHostCompany = false;
    }

    const updated = await this.usersRepository.save(user);
    delete updated.password;
    return updated;
  }
}
