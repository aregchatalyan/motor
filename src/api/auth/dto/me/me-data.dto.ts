import { Role, Token } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

class TokenDto implements Token {
  id: number;
  userId: number;
  agent: string | null;
  accessToken: string;
  refreshToken: string;
  expiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class MeDataDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  surname: string;
  @ApiProperty()
  avatar: string | null;
  @ApiProperty()
  mobile: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  active: boolean;
  @ApiProperty()
  confirmed: boolean;
  @ApiProperty({ enum: Role, isArray: true })
  roles: Role[];
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty({ type: TokenDto, isArray: true })
  tokens: Token[];
}
