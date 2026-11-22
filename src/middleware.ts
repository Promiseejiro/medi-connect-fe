import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Customer authentication is intentionally disabled.
 * All customer-facing routes are public and are not redirected to /login.
 */
export default function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
