import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "changeme");

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Check OTP
  const store = globalThis.otpStore || {};
  const entry = store[email];
  if (!entry || entry.otp !== otp || Date.now() > entry.expires) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
  }
  // Clean up OTP
  delete store[email];

  // Issue JWT (30 days)
  const jwt = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  return NextResponse.json({ token: jwt });
}

export async function GET(req: NextRequest) {
  // For token refresh: expects Authorization: Bearer <token>
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "No token" }, { status: 401 });
  const token = auth.split(" ")[1];
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Issue new JWT
    const newJwt = await new SignJWT({ email: payload.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);
    return NextResponse.json({ token: newJwt });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
