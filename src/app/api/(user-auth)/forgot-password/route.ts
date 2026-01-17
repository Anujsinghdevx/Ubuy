import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const result = ForgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ success: false, message: 'Invalid email format' }, { status: 400 });
    }

    const { email } = result.data;
    const user = await User.findOne({ email });

    if (!user) {
      return Response.json(
        { success: false, message: 'No user found with that email' },
        { status: 404 }
      );
    }

    // Generate 6-digit verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationcode = verifyCode;
    user.verificationCodeExpiry = verifyCodeExpiry;
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"U-Buy Support" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Your Password Reset Code',
      html: `
        <p>Hello,</p>
        <p>You requested to reset your password. Use the code below to reset it:</p>
        <h2>${verifyCode}</h2>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    return Response.json({ success: true, message: 'Reset code sent to email' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
