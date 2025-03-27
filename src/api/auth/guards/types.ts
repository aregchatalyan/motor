import { Token, User } from '@prisma/client';

export interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export type UserPayload = Omit<User, 'secret' | 'password'> & { tokens: Token[] };
