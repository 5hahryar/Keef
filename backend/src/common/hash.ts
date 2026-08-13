import * as bcrypt from 'bcrypt';

const MIN_COST = 4;

export async function hashPassword(input: string): Promise<string> {
  return bcrypt.hash(input, MIN_COST);
}

export async function verifyHash(input: string, hashedInput: string): Promise<boolean> {
  return bcrypt.compare(input, hashedInput);
}
