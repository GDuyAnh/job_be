import {
  Injectable,
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password, fullName, phoneNumber } = createUserDto;

    const existingEmail = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email or username already exists');
    }

    const existingUsername = await this.usersRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException('Email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      email,
      username,
      password: hashedPassword,
      fullName,
      phoneNumber: phoneNumber || null,
    });

    const savedUser = await this.usersRepository.save(user);

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
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match')
    }

    // Get user with password
    const user = await this.findByIdWithPassword(userId)

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect')
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await this.usersRepository.update(userId, { password: hashedPassword })
  }

  async updateProfile(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Check if username is already taken by another user
    const existingUser = await this.usersRepository.findOne({
      where: { username: updateUserDto.username },
    })

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Username already exists')
    }

    // Update user
    await this.usersRepository.update(userId, {
      fullName: updateUserDto.fullName.trim(),
      username: updateUserDto.username.trim(),
      phoneNumber: updateUserDto.phoneNumber?.trim() || null,
    })

    // Return updated user
    const updatedUser = await this.findById(userId)
    return updatedUser
  }

  async deleteAccount(userId: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Soft delete by setting isActive to false
    // Or hard delete if needed
    await this.usersRepository.update(userId, { isActive: false })
    // For hard delete: await this.usersRepository.delete(userId)
  }
}
