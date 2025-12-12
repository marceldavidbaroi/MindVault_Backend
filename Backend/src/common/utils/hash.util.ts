// utils/hash.util.ts
import * as bcrypt from 'bcrypt';

export async function hashString(
  value: string,
  saltRounds = 10,
): Promise<string> {
  return bcrypt.hash(value, saltRounds);
}

export async function compareHash(
  value: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(value, hashed);
}
