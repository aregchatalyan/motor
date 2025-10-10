import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class SignInDto {
  @ValidateIf(o => !o.email, { message: 'Username is required if email is missing' })
  @IsString()
  username: string;

  @ValidateIf(o => !o.username, { message: 'Email is required if username is missing' })
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
