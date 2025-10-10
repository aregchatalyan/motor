import { GenderEnum, Profile } from 'prisma/client';

export class ProfileDataDto implements Omit<Profile, 'user' | 'userId'> {
  id: number;
  name: string;
  surname: string;
  gender: GenderEnum = GenderEnum.MALE;
  birthday: Date;
  avatar: string | null;
  country: string;
  mobile: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}
