import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactMessageResponseDto } from './dto/contact-message-response.dto';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Lưu tin nhắn liên hệ và gửi email xác nhận cho user + admin',
    type: ContactMessageResponseDto,
  })
  async createMessage(
    @Body() dto: CreateContactMessageDto,
  ): Promise<ContactMessageResponseDto> {
    return this.contactService.create(dto);
  }
}
