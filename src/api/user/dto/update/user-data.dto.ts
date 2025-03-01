import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserDataDto {
  @ApiProperty({ example : 1 })
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
}
