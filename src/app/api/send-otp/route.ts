import { NextRequest, NextResponse } from "next/server";
import { db } from "../firebase";
import { collection, getDoc, doc } from "firebase/firestore";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Check if email is in admins collection
  const adminDoc = await getDoc(doc(db, "admins", email.toLowerCase()));
  if (!adminDoc.exists()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Store OTP in memory (for demo; in production, use Redis or Firestore with expiry)
  globalThis.otpStore = globalThis.otpStore || {};
  globalThis.otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };

  // Send OTP email (configure SMTP in .env.local)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Your Longview Admin OTP",
    text: `Your login code is: ${otp}`,
  });

  return NextResponse.json({ success: true });
}
