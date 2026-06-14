import { ApiProperty } from '@nestjs/swagger';
import { EmailTemplate } from '../email-template.entity';

export class EmailTemplateResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  htmlBody: string;

  @ApiProperty({ type: [String], nullable: true })
  variables: string[] | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: EmailTemplate): EmailTemplateResponseDto {
    const dto = new EmailTemplateResponseDto();
    dto.id = entity.id;
    dto.code = entity.code;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.subject = entity.subject;
    dto.htmlBody = entity.htmlBody;
    dto.variables = entity.variables;
    dto.isActive = entity.isActive;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

export class EmailTemplateListItemDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: EmailTemplate): EmailTemplateListItemDto {
    const dto = new EmailTemplateListItemDto();
    dto.code = entity.code;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.isActive = entity.isActive;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
