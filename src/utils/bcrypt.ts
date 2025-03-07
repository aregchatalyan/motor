import * as bcrypt from 'bcryptjs';

export const hash = async (password: string, rounds?: number) => {
  const salt = await bcrypt.genSalt(rounds);

  return bcrypt.hash(password, salt);
}

export const compare = async (password: string, hashed: string) => {
  return bcrypt.compare(password, hashed);
}
