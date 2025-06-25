import { NextRequest, NextResponse } from "next/server";
import { db } from "../../firebase";
import { getDocs, collection } from "firebase/firestore";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = auth.replace("Bearer ", "");
  try {
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "changeme");
    await jwtVerify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Fetch all waitlist emails
  const snap = await getDocs(collection(db, "waitlist"));
  const waitlist = snap.docs.map(doc => ({ ...doc.data(), email: doc.id }));
  return NextResponse.json({ waitlist });
}
