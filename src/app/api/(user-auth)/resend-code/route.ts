import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_INTERVAL_MS = 60 * 1000; // 1 minute

export async function POST(req: Request) {
  await dbConnect();

  const { username } = await req.json();
  const decodedUsername = decodeURIComponent(username);

  // === Rate limit per IP ===
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const lastRequestTime = rateLimitMap.get(ip) || 0;

  if (now - lastRequestTime < RATE_LIMIT_INTERVAL_MS) {
    return NextResponse.json(
      { success: false, message: 'Please wait before requesting again.' },
      { status: 429 }
    );
  }

  try {
    const user = await User.findOne({ username: decodedUsername });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: 'User already verified' },
        { status: 400 }
      );
    }

    // Generate a new code and set a new expiry
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    user.verificationcode = newCode;
    user.verificationCodeExpiry = expiry;

    await user.save();

    rateLimitMap.set(ip, now); // mark this IP as recently used

    // For testing: log the code (remove in production)
    console.log(`Resent code for ${user.username}: ${newCode}`);

    return NextResponse.json(
      { success: true, message: 'Verification code resent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resending code:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
