import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const ResetPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const result = ResetPasswordSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ success: false, message: errorMessages }, { status: 400 });
    }

    const { email, password } = result.data;
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    return NextResponse.json(
      { success: true, message: 'Password reset successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
