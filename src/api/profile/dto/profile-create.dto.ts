import { GenderEnum } from 'prisma/client';
import { IsDateString, IsEnum, IsMobilePhone, IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class ProfileCreateDto {
  @IsString()
  @Length(3, 20)
  name: string;

  @IsString()
  @Length(3, 20)
  surname: string;

  @IsEnum(GenderEnum)
  gender: GenderEnum = GenderEnum.MALE;

  @IsDateString()
  birthday: Date;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsMobilePhone('am-AM')
  mobile: string;

  @IsPhoneNumber('AM')
  phone: string;
}
