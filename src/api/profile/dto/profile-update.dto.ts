import { Optional } from '@nestjs/common';
import { GenderEnum } from 'prisma/client';
import { IsDateString, IsEnum, IsMobilePhone, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

export class ProfileUpdateDto {
  @IsOptional()
  @IsString()
  @Length(3, 20)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(3, 20)
  surname?: string;

  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum = GenderEnum.MALE;

  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @Optional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsMobilePhone('am-AM')
  mobile?: string;

  @IsOptional()
  @IsPhoneNumber('AM')
  phone?: string;
}
