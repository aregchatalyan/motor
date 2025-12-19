import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class SignInDto {
  @ValidateIf(o => !o.email, { message: 'Username is required' })
  @IsString()
  username: string;

  @ValidateIf(o => !o.username, { message: 'Email is required' })
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
