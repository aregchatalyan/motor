import { IsEmail, IsMobilePhone, IsString, IsStrongPassword, Length } from 'class-validator';

export class SignUpDto {
  @IsString()
  @Length(3, 20)
  name: string;

  @IsString()
  @Length(3, 20)
  surname: string;

  @IsMobilePhone('am-AM', { strictMode: true })
  mobile: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
    minLowercase: 1
  })
  password: string;
}
