import bcrypt from 'bcryptjs';
import { SALT } from '../config/config';

export const hashPassword = async (password: string): Promise<string> => {
  const hashPassword: string = await bcrypt.hashSync(password, SALT);
  return hashPassword;
};
