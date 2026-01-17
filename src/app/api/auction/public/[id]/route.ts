import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import AuthUser from "@/models/AuthUser";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const  { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    // Try fetching from User model
    const user =
      (await User.findById(id).select("name image email bio")) ||
      (await AuthUser.findById(id).select("name image email bio"));

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching public user:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
