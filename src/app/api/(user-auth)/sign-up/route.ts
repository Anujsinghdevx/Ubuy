import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, username, password } = await req.json();
    const existingUser = await User.findOne({ email });
    const existingVerifiedUserByUsername = await User.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      );
    }
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      verificationcode: verifyCode,
      verificationCodeExpiry: expiry,
      isVerified: false,
    });

    await newUser.save();

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
      subject: 'Welcome to U-Buy – Verify Your Account',
      html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px;">
              <h2 style="color: #0070f3;">Welcome to U-Buy!</h2>
              <p>Hi there,</p>
              <p>Thanks for signing up with <strong>U-Buy</strong>! We're excited to have you join our auction community. To get started, please verify your email address by using the code below:</p>
              <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
                ${verifyCode}
              </div>
              <p>This verification code will expire in 10 minutes.</p>
              <p>Need help? Just reply to this email or reach out to our support team anytime.</p>
              <p>Happy bidding!<br/>— The U-Buy Team</p>
            </div>
          `,
    });

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error during sign-up:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
