import { IsEmail, IsMobilePhone, IsOptional, IsString, IsStrongPassword, IsUrl, Length } from 'class-validator';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  @Length(3, 20)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(3, 20)
  surname?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsMobilePhone('am-AM', { strictMode: true })
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
    minLowercase: 1
  })
  password?: string;
}
