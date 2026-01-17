import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, code } = await request.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const isCodeValid = user.verificationcode === code;
    const isCodeNotExpired = new Date(user.verificationCodeExpiry).getTime() > new Date().getTime();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return NextResponse.json(
        {
          success: true,
          message: 'Account verified successfully',
          username: user.username, // return username to use in redirect
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return NextResponse.json(
        {
          success: false,
          message: 'Verification code has expired. Please request a new one.',
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
