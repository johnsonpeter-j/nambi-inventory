import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface TokenPayload {
  email: string;
  type: "register" | "reset" | "auth";
}

export const generateToken = (
  payload: TokenPayload,
  expiresIn: string | number = "7d"
): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  } as SignOptions);
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

