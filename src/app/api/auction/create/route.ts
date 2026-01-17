import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Auction from '@/models/Auction';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import Notification from '@/models/Notification';

const verifyCaptcha = async (token: string): Promise<boolean> => {
  const secret = process.env.TURNSTILE_SECRET_KEY!;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secret}&response=${token}`,
  });

  const data = await res.json();
  return data.success;
};

const validCategories = ['Collectibles', 'Art', 'Electronics', 'Fashion', 'Other'];

export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, images, startingPrice, startTime, endTime, category, token } = body;

    // Validate CAPTCHA token
    const isValidCaptcha = await verifyCaptcha(token);
    if (!isValidCaptcha) {
      return NextResponse.json({ message: 'CAPTCHA verification failed' }, { status: 400 });
    }

    // Validate required fields
    if (!title || !description || !startingPrice || !startTime || !endTime || !category) {
      return NextResponse.json(
        { message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate category
    if (!validCategories.includes(category)) {
      return NextResponse.json({ message: 'Invalid category provided' }, { status: 400 });
    }

    //  Validate images
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ message: 'Please upload at least one image' }, { status: 400 });
    }

    const createdByModel = session.user.authProvider ? 'AuthUser' : 'User';

    const newAuction = await Auction.create({
      title,
      description,
      images,
      startingPrice,
      currentPrice: startingPrice,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'active',
      category,
      createdBy: session.user.id,
      createdByModel: createdByModel,
      notified: false,
    });

    //sending notification to the current highest bidder
    await Notification.create({
      recipient: session.user.id,
      recipientModel: session.user.authProvider,
      type: 'create',
      message: `Your auction ${newAuction.title} was created successfully.`,
      relatedAuction: newAuction._id,
    });

    console.log('Notification sent to current bidder:', session.user.id);

    return NextResponse.json(
      { message: 'Auction created successfully', auction: newAuction },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
