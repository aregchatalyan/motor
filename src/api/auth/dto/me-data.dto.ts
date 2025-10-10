import { RoleEnum } from 'prisma/client';

export class MeDataDto {
  id: number;
  username: string;
  email: string;
  active: boolean;
  verified: boolean;
  roles: RoleEnum[] = [ RoleEnum.USER ];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
