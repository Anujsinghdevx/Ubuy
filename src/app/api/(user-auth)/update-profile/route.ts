import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import AuthUser from '@/models/AuthUser';
import cloudinary from '@/utils/cloudinary';

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const { userId, userModel, username, imageBase64 } = await req.json();

    if (!userId || !userModel) {
      return NextResponse.json({ error: 'userId and userModel are required' }, { status: 400 });
    }

    if (!['User', 'AuthUser'].includes(userModel)) {
      return NextResponse.json({ error: 'Invalid user model' }, { status: 400 });
    }

    const updateFields: Partial<{ username: string; image: string }> = {};

    if (username) updateFields.username = username;

    // Upload the image to Cloudinary if provided
    if (imageBase64) {
      const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
        folder: 'user-profiles',
      });
      updateFields.image = uploadResponse.secure_url;
    }

    const Model = userModel === 'User' ? User : AuthUser;

    const updatedUser = await Model.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile', details: (error as Error).message },
      { status: 500 }
    );
  }
}
