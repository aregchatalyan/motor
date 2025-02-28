import * as bcrypt from 'bcryptjs';

export const hash = async (password: string) => {
  const salt = await bcrypt.genSalt(10);

  return bcrypt.hash(password, salt);
}

export const compare = async (password: string, hashed: string) => {
  return bcrypt.compare(password, hashed);
}
