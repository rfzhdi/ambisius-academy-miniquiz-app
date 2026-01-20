import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import * as jose from 'jose';

export const hashPassword = (password: string) => bcrypt.hashSync(password, 10);
export const comparePassword = (password: string, hash: string) => bcrypt.compareSync(password, hash);

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export const generateJWT = async (payload: any) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
};

export const verifyJWT = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (err) {
    return null;
  }
  
};

export async function generateRefreshToken(payload: any) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return await new jose.SignJWT({ id: payload.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') 
    .sign(secret);
}