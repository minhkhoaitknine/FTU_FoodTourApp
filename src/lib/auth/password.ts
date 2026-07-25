import bcrypt from "bcryptjs";

const HASH_ROUNDS = 10;

export function hashPassword(password: string) {
  return bcrypt.hash(password, HASH_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

