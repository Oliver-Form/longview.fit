import { NextRequest, NextResponse } from "next/server";
import { db } from "../../firebase";
import { getDoc, doc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  const { email, passkey } = await req.json();
  if (!email || !passkey) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Check if email is in admins collection and passkey matches
  const adminDoc = await getDoc(doc(db, "admins", email.toLowerCase()));
  if (!adminDoc.exists() || adminDoc.data()?.passkey !== passkey) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Issue JWT (30 days)
  const { SignJWT } = await import("jose");
  const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "changeme");
  const jwt = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  return NextResponse.json({ token: jwt });
}