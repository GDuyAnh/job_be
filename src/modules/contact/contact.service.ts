import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import {
  CONTACT_SUBJECT_LABELS,
  type ContactSubjectCode,
} from './contact.constants';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateContactMessageDto): Promise<{ id: number; message: string }> {
    const subjectCode = dto.subject as ContactSubjectCode;
    const subjectLabel = CONTACT_SUBJECT_LABELS[subjectCode] ?? dto.subject;

    const saved = await this.contactRepository.save(
      this.contactRepository.create({
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        subject: subjectCode,
        message: dto.message.trim(),
      }),
    );

    this.notifyContactEmails(saved, subjectLabel).catch((error) => {
      this.logger.error(
        `Contact message #${saved.id} saved but email notification failed`,
        error,
      );
    });

    return {
      id: saved.id,
      message: 'Đã gửi tin nhắn thành công',
    };
  }

  private async notifyContactEmails(
    contact: ContactMessage,
    subjectLabel: string,
  ): Promise<void> {
    const variables = {
      fullName: contact.fullName,
      email: contact.email,
      subjectLabel,
      message: contact.message,
    };

    await this.emailService.sendByTemplate(
      'CONTACT_FORM_USER',
      contact.email,
      variables,
    );

    const adminEmails = await this.usersService.findAdminEmails();
    if (!adminEmails.length) {
      this.logger.warn(
        `No admin emails for contact message #${contact.id}`,
      );
      return;
    }

    await this.emailService.sendToManyByTemplate(
      'CONTACT_FORM_ADMIN',
      adminEmails,
      variables,
    );
  }
}
