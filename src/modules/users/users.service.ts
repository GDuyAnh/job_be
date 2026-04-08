import { Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { RoleStatus } from '@/enum/role';
import { EmailService } from '../email/email.service';
import { Company } from '../companies/company.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    private emailService: EmailService,
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

    // FE đã tạo company rồi, BE chỉ nhận companyId và gán cho user
    // isHostCompany = true khi tạo company mới (FE set), false khi link tới existing company
    const user = this.usersRepository.create({
      email,
      username,
      password: hashedPassword,
      fullName,
      phoneNumber: phoneNumber || null,
      role: role || RoleStatus.USER,
      companyId: companyId || null,
      isHostCompany: false,
    });

    const savedUser = await this.usersRepository.save(user);

    // Send welcome email with account information
    try {
      await this.emailService.sendAccountCredentials(
        email,
        fullName,
        username,
        password, // Send original password before hashing
      );
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
      throw new NotFoundException('User not found');
    }
    // Remove password for security
    delete user.password;
    return user;
  }

  async findByIdWithPassword(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
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
        'New password and confirm password do not match',
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
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.usersRepository.update(userId, { password: hashedPassword });
  }

  async updateProfile(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if username is already taken by another user
    const existingUser = await this.usersRepository.findOne({
      where: { username: updateUserDto.username },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Username already exists');
    }

    // Prepare update data
    const updateData: any = {
      fullName: updateUserDto.fullName.trim(),
      username: updateUserDto.username.trim(),
      phoneNumber: updateUserDto.phoneNumber?.trim() || null,
      location: updateUserDto.location?.trim() || null,
      expertise: updateUserDto.expertise?.trim() || null,
    };

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

    // Return updated user
    const updatedUser = await this.findById(userId);
    return updatedUser;
  }

  async deleteAccount(
    userId: number,
    deleteAccountDto: DeleteAccountDto,
  ): Promise<void> {
    const { password } = deleteAccountDto;

    // Get user with password
    const user = await this.findByIdWithPassword(userId);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    // Soft delete by setting isActive to false
    // Or hard delete if needed
    await this.usersRepository.update(userId, { isActive: false });
    // For hard delete: await this.usersRepository.delete(userId)
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
      // User exists - Update CV and Cover Letter from application
      const updateData: any = {};

      if (cvUrl !== undefined && cvUrl !== null) {
        updateData.cvUrl = cvUrl;
      }
      if (coverLetterUrl !== undefined && coverLetterUrl !== null) {
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
      throw new NotFoundException('User not found');
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
      throw new NotFoundException('User not found');
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
      throw new NotFoundException('User not found');
    }

    if (user.companyId !== companyId) {
      throw new BadRequestException('User does not belong to this company');
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
