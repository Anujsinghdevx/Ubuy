import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import AuthUser from '@/models/AuthUser';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { userId, userModel } = await req.json();

    if (!userId || !userModel) {
      return NextResponse.json({ error: 'userId and userModel are required' }, { status: 400 });
    }

    if (!['User', 'AuthUser'].includes(userModel)) {
      return NextResponse.json({ error: 'Invalid user model' }, { status: 400 });
    }

    const Model = userModel === 'User' ? User : AuthUser;
    const user = await Model.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: (error as Error).message },
      { status: 500 }
    );
  }
}
