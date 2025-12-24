import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export interface AuthenticatedUser {
  email: string;
  type: string;
}

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decoded = verifyToken(token);

    if (!decoded || decoded.type !== "auth") {
      return null;
    }

    return {
      email: decoded.email,
      type: decoded.type,
    };
  } catch (error) {
    return null;
  }
}






