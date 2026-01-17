// app/api/send-email/route.ts (or .js)
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const { name, email, mobile, child } = await req.json();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: process.env.SMTP_EMAIL,
    subject: 'Verification Code',
    html: `
      <h2>New Admission Enquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>Child Name:</strong> ${child}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to send email', error }, { status: 500 });
  }
}
