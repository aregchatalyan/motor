import { ApiProperty } from '@nestjs/swagger';

export class SignInDataDto {
  @ApiProperty()
  accessToken: string;
}
