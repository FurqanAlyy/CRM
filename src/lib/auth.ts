import { SignJWT, jwtVerify } from "jose"

const AUTH_SECRET = process.env.AUTH_SECRET

if (!AUTH_SECRET) {
  throw new Error("Please define AUTH_SECRET in .env.local")
}

const secret = new TextEncoder().encode(AUTH_SECRET)

export async function createToken(userId: string, role: string) {
  return await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret)

  return payload
}