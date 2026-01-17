import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await User.findOne({ username: decodedUsername });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const isCodeValid = user.verificationcode === code;
    const isCodeNotExpired = new Date(user.verificationCodeExpiry).getTime() > new Date().getTime();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return NextResponse.json(
        { success: true, message: 'Account verified successfully' },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return NextResponse.json(
        {
          success: false,
          message: 'Verification code has expired. Please sign up again to get a new code.',
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Incorrect verification code' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json({ success: false, message: 'Error verifying user' }, { status: 500 });
  }
}
