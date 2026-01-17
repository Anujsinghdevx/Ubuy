import dbConnect from '@/lib/dbConnect';
import { z } from 'zod';
import { usernameValidation } from '@/schemas/SignUpSchema';
import User from '@/models/User';

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get('username'),
    };
    const result = UsernameQuerySchema.safeParse(queryParams);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0 ? usernameErrors.join(',') : 'Invalid query parameters',
        },
        { status: 400 }
      );
    }
    const { username } = result.data;

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      );
    }
    return Response.json(
      {
        success: true,
        message: 'Username is available',
      },
      { status: 200 }
    );
  } catch (error) {
    console.log('Error checking username', error);
    return Response.json(
      {
        success: false,
        message: 'Error checking Username',
      },
      { status: 500 }
    );
  }
}
