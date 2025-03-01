import { ApiProperty } from '@nestjs/swagger';

export class AccessDto {
  @ApiProperty()
  accessToken: string;
}